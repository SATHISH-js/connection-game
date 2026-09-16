const { storage } = require('../services/storage');

let ioInstance = null;
let timerInterval = null;
let connectedDisplays = new Set();
let connectedHosts = new Set();

async function getFullSyncPayload() {
  const gameState = await storage.getGameState();
  const settings = await storage.getSettings();
  const roundNum = Number(gameState.currentRound) || 1;
  const questions = await storage.getQuestions(roundNum);
  const teams = await storage.getTeams();

  const safeIdx = Math.max(0, Math.min(Math.max(0, questions.length - 1), Number(gameState.currentQuestionIndex) || 0));
  const currentQuestion = questions[safeIdx] || null;

  return {
    gameState: {
      ...gameState,
      currentRound: roundNum,
      currentQuestionIndex: safeIdx
    },
    settings,
    currentQuestion,
    roundQuestions: questions.map((q, idx) => ({
      id: q.id || q._id,
      questionNumber: idx + 1,
      title: q.title,
      answerText: q.answerText,
      points: q.points || 10,
      timerDuration: q.timerDuration || 30
    })),
    totalQuestions: questions.length,
    teams,
    displayCount: connectedDisplays.size,
    hostCount: connectedHosts.size,
    timestamp: Date.now()
  };
}

function clearServerTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function computeInitialRevealedCount(question, roundNum) {
  if (!question) return 4;
  const count = Array.isArray(question.clues) ? question.clues.length : 4;
  if (count <= 1 || question.revealAllAtStart) {
    return count;
  }
  if (question.initialRevealedCount !== undefined && question.initialRevealedCount !== null) {
    const custom = Number(question.initialRevealedCount);
    if (!isNaN(custom) && custom > 0) {
      return Math.min(count, custom);
    }
  }
  return roundNum === 2 ? 1 : count;
}

function getRoundDefaultTimer(settings, roundNum) {
  if (!settings) return 30;
  const r = Number(roundNum) || 1;
  let val;
  if (r === 1) val = Number(settings.round1Timer);
  else if (r === 2) val = Number(settings.round2Timer);
  else if (r === 3) val = Number(settings.round3Timer);
  else val = Number(settings.defaultTimer);

  if (!val || isNaN(val) || val < 5) {
    val = (r === 1 ? 30 : r === 2 ? 20 : 15);
  }
  return Math.max(5, Math.min(60, val));
}

function startServerTimerMonitoring(io, duration) {
  clearServerTimer();

  timerInterval = setInterval(async () => {
    try {
      const state = await storage.getGameState();
      if (state.timer.status !== 'RUNNING' || !state.timer.startedAt) {
        clearServerTimer();
        return;
      }

      const elapsed = (Date.now() - state.timer.startedAt) / 1000;
      const remaining = Math.max(0, Math.ceil(state.timer.duration - elapsed));

      if (remaining <= 0) {
        clearServerTimer();
        state.timer.status = 'FINISHED';
        state.timer.pausedAt = null;
        await storage.updateGameState({ timer: state.timer });

        io.emit('timerFinished', { timestamp: Date.now() });
        io.emit('triggerAudioEffect', { sound: 'time-up' });

        const syncPayload = await getFullSyncPayload();
        io.emit('gameStateSync', syncPayload);
      }
    } catch (err) {
      console.error('Timer monitor tick error:', err);
    }
  }, 500);
}

function initSocket(io) {
  ioInstance = io;

  io.on('connection', async (socket) => {
    const role = socket.handshake.query.role || 'viewer';
    console.log(`🔌 Client connected [${socket.id}] - Role: ${role}`);

    if (role === 'display') {
      connectedDisplays.add(socket.id);
      io.emit('displayConnected', { count: connectedDisplays.size, socketId: socket.id });
    } else if (role === 'host') {
      connectedHosts.add(socket.id);
    }

    // Send full state immediately upon connection (ensures recovery on reload)
    try {
      const syncData = await getFullSyncPayload();
      socket.emit('gameStateSync', syncData);
    } catch (err) {
      console.error('Error sending initial state:', err);
    }

    // --- GAME CONTROL EVENTS ---

    socket.on('game:start', async (payload = {}) => {
      try {
        clearServerTimer();
        const state = await storage.getGameState();
        const settings = await storage.getSettings();
        const roundNum = payload.round ? Number(payload.round) : (state.currentRound || 1);
        const questions = await storage.getQuestions(roundNum);
        const currentQ = questions[state.currentQuestionIndex] || questions[0] || null;
        const roundDefault = getRoundDefaultTimer(settings, roundNum);
        const dur = (payload.duration && Number(payload.duration) > 0) ? Number(payload.duration) : roundDefault;

        const updatedTimer = {
          duration: dur,
          startedAt: Date.now(),
          pausedAt: null,
          status: 'RUNNING'
        };

        startServerTimerMonitoring(io, dur);

        await storage.updateGameState({
          currentRound: roundNum,
          gameStatus: 'RUNNING',
          stageView: 'question',
          landingVisible: false,
          leaderboardVisible: false,
          qualifiersVisible: false,
          podiumVisible: false,
          answerRevealed: false,
          revealedCluesCount: computeInitialRevealedCount(currentQ, roundNum),
          timer: updatedTimer
        });

        io.emit('gameStarted', { round: roundNum, timestamp: Date.now() });
        io.emit('timerStarted', { duration: dur, status: 'RUNNING' });
        io.emit('triggerAudioEffect', { sound: 'game-start' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:start error:', err);
      }
    });

    socket.on('game:stop', async () => {
      try {
        clearServerTimer();
        const state = await storage.getGameState();
        const updatedTimer = {
          ...state.timer,
          status: 'PAUSED',
          startedAt: null,
          pausedAt: Date.now()
        };
        await storage.updateGameState({
          gameStatus: 'PAUSED',
          timer: updatedTimer
        });

        io.emit('gameStopped', { timestamp: Date.now() });
        io.emit('timerPaused', { duration: updatedTimer.duration, status: 'PAUSED' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:stop error:', err);
      }
    });

    socket.on('game:new', async ({ resetScores = false } = {}) => {
      try {
        clearServerTimer();
        const settings = await storage.getSettings();
        const dur = getRoundDefaultTimer(settings, 1);

        if (resetScores) {
          await storage.resetGame({ resetScores: true });
        } else {
          await storage.updateGameState({
            currentRound: 1,
            currentQuestionIndex: 0,
            gameStatus: 'READY',
            stageView: 'landing',
            landingVisible: true,
            round1Completed: false,
            round2Completed: false,
            answerRevealed: false,
            revealedCluesCount: 4,
            leaderboardVisible: false,
            podiumVisible: false,
            qualifiersVisible: false,
            tieDetected: false,
            timer: {
              duration: dur,
              startedAt: null,
              pausedAt: null,
              status: 'IDLE'
            }
          });
        }

        io.emit('newGameStarted', { resetScores, timestamp: Date.now() });
        io.emit('triggerAudioEffect', { sound: 'game-start' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:new error:', err);
      }
    });

    socket.on('game:next', async () => {
      try {
        clearServerTimer();
        const state = await storage.getGameState();
        const settings = await storage.getSettings();
        const roundNum = Number(state.currentRound) || 1;
        const questions = await storage.getQuestions(roundNum);

        if (!questions || questions.length === 0) {
          console.warn('game:next: No questions found for round', roundNum);
          return;
        }

        const currentIdx = Math.max(0, Math.min(questions.length - 1, Number(state.currentQuestionIndex) || 0));
        let nextIdx = currentIdx + 1;
        if (nextIdx >= questions.length) {
          nextIdx = 0; // Seamless loop so host is never locked out
        }

        const nextQuestion = questions[nextIdx] || null;
        const roundDefault = getRoundDefaultTimer(settings, roundNum);
        const defaultDur = roundDefault;
        const nextRevealedCount = computeInitialRevealedCount(nextQuestion, roundNum);

        const shouldAutoStart = settings.autoStartTimerOnNext !== false;
        const isGameRunning = state.gameStatus === 'RUNNING' || shouldAutoStart;
        const updatedTimer = isGameRunning ? {
          duration: defaultDur,
          startedAt: Date.now(),
          pausedAt: null,
          status: 'RUNNING'
        } : {
          duration: defaultDur,
          startedAt: null,
          pausedAt: null,
          status: 'IDLE'
        };

        if (isGameRunning) {
          startServerTimerMonitoring(io, defaultDur);
        }

        const updatedState = {
          gameStatus: isGameRunning ? 'RUNNING' : state.gameStatus,
          stageView: 'question',
          currentRound: roundNum,
          currentQuestionIndex: nextIdx,
          answerRevealed: false,
          revealedCluesCount: nextRevealedCount,
          landingVisible: false,
          leaderboardVisible: false,
          qualifiersVisible: false,
          podiumVisible: false,
          timer: updatedTimer
        };

        await storage.updateGameState(updatedState);
        io.emit('questionChanged', {
          questionIndex: nextIdx,
          round: roundNum,
          question: nextQuestion,
          totalQuestions: questions.length,
          autoStarted: isGameRunning,
          duration: defaultDur
        });
        io.emit('triggerAudioEffect', { sound: isGameRunning ? 'timer-start' : 'question-change' });
        if (isGameRunning) {
          io.emit('timerStarted', { duration: defaultDur, status: 'RUNNING' });
        }

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:next error:', err);
      }
    });

    socket.on('game:previous', async () => {
      try {
        clearServerTimer();
        const state = await storage.getGameState();
        const settings = await storage.getSettings();
        const roundNum = Number(state.currentRound) || 1;
        const questions = await storage.getQuestions(roundNum);

        if (!questions || questions.length === 0) return;

        const currentIdx = Math.max(0, Math.min(questions.length - 1, Number(state.currentQuestionIndex) || 0));
        let prevIdx = currentIdx - 1;
        if (prevIdx < 0) {
          prevIdx = questions.length - 1;
        }

        const prevQuestion = questions[prevIdx] || null;
        const roundDefault = getRoundDefaultTimer(settings, roundNum);
        const defaultDur = roundDefault;
        const prevRevealedCount = computeInitialRevealedCount(prevQuestion, roundNum);

        const isGameRunning = state.gameStatus === 'RUNNING';
        const updatedTimer = isGameRunning ? {
          duration: defaultDur,
          startedAt: Date.now(),
          pausedAt: null,
          status: 'RUNNING'
        } : {
          duration: defaultDur,
          startedAt: null,
          pausedAt: null,
          status: 'IDLE'
        };

        if (isGameRunning) {
          startServerTimerMonitoring(io, defaultDur);
        }

        const updatedState = {
          stageView: 'question',
          currentRound: roundNum,
          currentQuestionIndex: prevIdx,
          answerRevealed: false,
          revealedCluesCount: prevRevealedCount,
          landingVisible: false,
          leaderboardVisible: false,
          qualifiersVisible: false,
          podiumVisible: false,
          timer: updatedTimer
        };

        await storage.updateGameState(updatedState);
        io.emit('questionChanged', {
          questionIndex: prevIdx,
          round: roundNum,
          question: prevQuestion,
          totalQuestions: questions.length,
          autoStarted: isGameRunning,
          duration: defaultDur
        });
        io.emit('triggerAudioEffect', { sound: isGameRunning ? 'timer-start' : 'question-change' });
        if (isGameRunning) {
          io.emit('timerStarted', { duration: defaultDur, status: 'RUNNING' });
        }

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:previous error:', err);
      }
    });

    socket.on('game:select-question', async ({ questionIndex }) => {
      try {
        clearServerTimer();
        const state = await storage.getGameState();
        const settings = await storage.getSettings();
        const roundNum = Number(state.currentRound) || 1;
        const questions = await storage.getQuestions(roundNum);

        if (!questions || questions.length === 0) return;

        const targetIdx = Math.max(0, Math.min(questions.length - 1, Number(questionIndex) || 0));
        const selectedQ = questions[targetIdx] || null;
        const roundDefault = getRoundDefaultTimer(settings, roundNum);
        const defaultDur = roundDefault;
        const nextRevealedCount = computeInitialRevealedCount(selectedQ, roundNum);

        const shouldAutoStart = settings.autoStartTimerOnNext !== false;
        const isGameRunning = state.gameStatus === 'RUNNING' || shouldAutoStart;
        const updatedTimer = isGameRunning ? {
          duration: defaultDur,
          startedAt: Date.now(),
          pausedAt: null,
          status: 'RUNNING'
        } : {
          duration: defaultDur,
          startedAt: null,
          pausedAt: null,
          status: 'IDLE'
        };

        if (isGameRunning) {
          startServerTimerMonitoring(io, defaultDur);
        }

        const updatedState = {
          gameStatus: isGameRunning ? 'RUNNING' : state.gameStatus,
          stageView: 'question',
          currentRound: roundNum,
          currentQuestionIndex: targetIdx,
          answerRevealed: false,
          revealedCluesCount: nextRevealedCount,
          landingVisible: false,
          leaderboardVisible: false,
          qualifiersVisible: false,
          podiumVisible: false,
          timer: updatedTimer
        };

        await storage.updateGameState(updatedState);
        io.emit('questionChanged', {
          questionIndex: targetIdx,
          round: roundNum,
          question: selectedQ,
          totalQuestions: questions.length,
          autoStarted: isGameRunning,
          duration: defaultDur
        });
        io.emit('triggerAudioEffect', { sound: isGameRunning ? 'timer-start' : 'question-change' });
        if (isGameRunning) {
          io.emit('timerStarted', { duration: defaultDur, status: 'RUNNING' });
        }

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:select-question error:', err);
      }
    });

    socket.on('game:reveal-next-clue', async () => {
      try {
        const state = await storage.getGameState();
        const questions = await storage.getQuestions(state.currentRound);
        const currentQ = questions[state.currentQuestionIndex];
        const totalClues = currentQ?.clues?.length || 4;

        const currentCount = state.revealedCluesCount !== undefined ? state.revealedCluesCount : 1;
        const nextCount = Math.min(totalClues, currentCount + 1);

        await storage.updateGameState({ revealedCluesCount: nextCount });
        io.emit('clueRevealed', { revealedCluesCount: nextCount, totalClues });
        io.emit('triggerAudioEffect', { sound: 'question-change' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:reveal-next-clue error:', err);
      }
    });

    socket.on('game:reveal-all-clues', async () => {
      try {
        const state = await storage.getGameState();
        const questions = await storage.getQuestions(state.currentRound);
        const currentQ = questions[state.currentQuestionIndex];
        const totalClues = currentQ?.clues?.length || 4;

        await storage.updateGameState({ revealedCluesCount: totalClues });
        io.emit('clueRevealed', { revealedCluesCount: totalClues, totalClues });
        io.emit('triggerAudioEffect', { sound: 'answer-reveal' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:reveal-all-clues error:', err);
      }
    });

    socket.on('game:reset-clues', async () => {
      try {
        const state = await storage.getGameState();
        const questions = await storage.getQuestions(state.currentRound);
        const currentQ = questions[state.currentQuestionIndex] || null;
        const resetCount = computeInitialRevealedCount(currentQ, state.currentRound);
        await storage.updateGameState({ revealedCluesCount: resetCount });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:reset-clues error:', err);
      }
    });

    socket.on('game:set-round', async ({ round }) => {
      try {
        clearServerTimer();
        const roundNum = Number(round);
        const settings = await storage.getSettings();
        const questions = await storage.getQuestions(roundNum);
        const firstQ = questions[0] || null;
        const roundDefault = getRoundDefaultTimer(settings, roundNum);

        let tieDetected = false;
        let activeTieBreakerTeams = [];

        // If switching to Round 3, calculate ties
        if (roundNum === 3) {
          const teams = await storage.getTeams();
          if (teams.length >= 2) {
            const topScore = teams[0].totalScore;
            const tied = teams.filter(t => t.totalScore === topScore);
            if (tied.length > 1) {
              tieDetected = true;
              activeTieBreakerTeams = tied.map(t => t.teamId);
            }
          }
          io.emit('triggerAudioEffect', { sound: 'tie-breaker' });
        }

        const initRevealedCount = computeInitialRevealedCount(firstQ, roundNum);

        const updatedState = {
          stageView: 'question',
          currentRound: roundNum,
          currentQuestionIndex: 0,
          answerRevealed: false,
          revealedCluesCount: initRevealedCount,
          landingVisible: false,
          leaderboardVisible: false,
          qualifiersVisible: false,
          podiumVisible: false,
          tieDetected,
          activeTieBreakerTeams: activeTieBreakerTeams.length ? activeTieBreakerTeams : undefined,
          timer: {
            duration: roundDefault,
            startedAt: null,
            pausedAt: null,
            status: 'IDLE'
          }
        };

        await storage.updateGameState(updatedState);
        io.emit('roundChanged', { round: roundNum });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:set-round error:', err);
      }
    });

    socket.on('game:reveal-answer', async () => {
      try {
        clearServerTimer();
        const state = await storage.getGameState();
        const questions = await storage.getQuestions(state.currentRound);
        const currentQ = questions[state.currentQuestionIndex] || null;

        const updatedTimer = {
          ...state.timer,
          status: 'STOPPED',
          startedAt: null,
          pausedAt: null
        };

        await storage.updateGameState({
          answerRevealed: true,
          timer: updatedTimer
        });

        io.emit('timerStopped', { timestamp: Date.now() });

        io.emit('answerRevealed', {
          answerText: currentQ ? currentQ.answerText : '',
          points: currentQ ? currentQ.points : 10,
          answerAudio: currentQ ? currentQ.answerAudio : null,
          answerAudioEnabled: currentQ ? currentQ.answerAudioEnabled : true,
          audioType: currentQ ? currentQ.audioType : 'tts',
          timestamp: Date.now()
        });

        // Trigger reveal sound effect
        io.emit('triggerAudioEffect', { sound: 'answer-reveal' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:reveal-answer error:', err);
      }
    });

    socket.on('game:hide-answer', async () => {
      try {
        await storage.updateGameState({ answerRevealed: false });
        io.emit('answerHidden', { timestamp: Date.now() });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:hide-answer error:', err);
      }
    });

    socket.on('game:toggle-leaderboard', async () => {
      try {
        const state = await storage.getGameState();
        const nextVisible = !state.leaderboardVisible;
        // Mutually exclusive: if showing leaderboard, podium/landing/qualifiers must be off
        await storage.updateGameState({
          stageView: nextVisible ? 'leaderboard' : 'question',
          leaderboardVisible: nextVisible,
          podiumVisible: false,
          landingVisible: false,
          qualifiersVisible: false,
          ...(nextVisible ? { answerRevealed: false } : {})
        });

        if (nextVisible) {
          io.emit('leaderboardShown', { timestamp: Date.now() });
          io.emit('triggerAudioEffect', { sound: 'leaderboard' });
        } else {
          io.emit('leaderboardHidden', { timestamp: Date.now() });
        }

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:toggle-leaderboard error:', err);
      }
    });

    socket.on('game:toggle-podium', async () => {
      try {
        const state = await storage.getGameState();
        const nextVisible = !state.podiumVisible;
        // Mutually exclusive: if showing podium, leaderboard/landing/qualifiers must be off
        await storage.updateGameState({
          stageView: nextVisible ? 'podium' : 'question',
          podiumVisible: nextVisible,
          leaderboardVisible: false,
          landingVisible: false,
          qualifiersVisible: false,
          ...(nextVisible ? { answerRevealed: false } : {})
        });

        if (nextVisible) {
          io.emit('triggerAudioEffect', { sound: 'winner' });
        }

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:toggle-podium error:', err);
      }
    });

    socket.on('game:set-stage-view', async ({ view }) => {
      try {
        // Strict mutual exclusion: 'landing' | 'question' | 'leaderboard' | 'qualifiers' | 'podium'
        const landingVisible = view === 'landing';
        const leaderboardVisible = view === 'leaderboard';
        const qualifiersVisible = view === 'qualifiers';
        const podiumVisible = view === 'podium';

        if (landingVisible) {
          io.emit('triggerAudioEffect', { sound: 'game-start' });
        } else if (leaderboardVisible) {
          io.emit('leaderboardShown', { timestamp: Date.now() });
          io.emit('triggerAudioEffect', { sound: 'leaderboard' });
        } else if (qualifiersVisible) {
          io.emit('triggerAudioEffect', { sound: 'winner' });
        } else if (podiumVisible) {
          io.emit('triggerAudioEffect', { sound: 'winner' });
        }

        const updates = {
          stageView: view,
          landingVisible,
          leaderboardVisible,
          qualifiersVisible,
          podiumVisible
        };

        // When switching away from question view, always clear answer reveal so it never overlaps other views
        if (view !== 'question') {
          updates.answerRevealed = false;
        }

        await storage.updateGameState(updates);

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:set-stage-view error:', err);
      }
    });

    socket.on('qualifiers:set-teams', async (payload = {}) => {
      try {
        const teamIds = payload.teamIds || payload.qualifiedTeams || [];
        const broadcastToDisplay = !!payload.broadcastToDisplay || !!payload.broadcast;
        const updates = { qualifiedTeams: teamIds };
        if (broadcastToDisplay) {
          updates.stageView = 'qualifiers';
          updates.qualifiersVisible = true;
          updates.landingVisible = false;
          updates.leaderboardVisible = false;
          updates.podiumVisible = false;
          updates.answerRevealed = false;
          io.emit('triggerAudioEffect', { sound: 'winner' });
        }
        await storage.updateGameState(updates);
        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('qualifiers:set-teams error:', err);
      }
    });

    socket.on('landing:update', async (landingData) => {
      try {
        await storage.updateSettings(landingData);
        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('landing:update error:', err);
      }
    });

    socket.on('landing:countdown', async (payload = {}) => {
      try {
        const minutes = Number(payload.minutes);
        let action = payload.action;
        if (!action) {
          action = minutes > 0 ? 'start' : 'stop';
        }
        let target = null;
        let active = false;
        if (action === 'start' && (isNaN(minutes) || minutes > 0)) {
          active = true;
          const mins = isNaN(minutes) ? 15 : minutes;
          target = Date.now() + (mins * 60 * 1000);
        }
        await storage.updateSettings({
          landingCountdownMinutes: !isNaN(minutes) && minutes > 0 ? minutes : 15,
          landingCountdownTarget: target,
          landingCountdownActive: active
        });
        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('landing:countdown error:', err);
      }
    });

    socket.on('game:announce-round', async ({ round, title, message }) => {
      try {
        const roundNum = Number(round) || 1;
        const settings = await storage.getSettings();
        const questions = await storage.getQuestions(roundNum);
        const firstQ = questions[0] || null;
        const roundDefault = getRoundDefaultTimer(settings, roundNum);
        const defaultDur = roundDefault;
        const initRevealedCount = computeInitialRevealedCount(firstQ, roundNum);

        const announcement = {
          round: roundNum,
          title: title || `ROUND ${roundNum} COMMENCING`,
          message: message || `Round ${roundNum} of the Connection Game is starting now!`,
          countdownSeconds: 5,
          timestamp: Date.now()
        };

        clearServerTimer();
        await storage.updateGameState({
          roundAnnouncement: announcement,
          gameStatus: 'READY',
          currentRound: roundNum,
          currentQuestionIndex: 0,
          stageView: 'question',
          landingVisible: false,
          leaderboardVisible: false,
          qualifiersVisible: false,
          podiumVisible: false,
          answerRevealed: false,
          revealedCluesCount: initRevealedCount,
          timer: {
            duration: defaultDur,
            startedAt: null,
            pausedAt: null,
            status: 'IDLE'
          }
        });

        io.emit('roundAnnounced', announcement);
        io.emit('triggerAudioEffect', { sound: 'game-start' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);

        // Auto-start the round after 5.5-second countdown if announcement wasn't dismissed
        setTimeout(async () => {
          try {
            const current = await storage.getGameState();
            if (current.roundAnnouncement?.timestamp === announcement.timestamp) {
              clearServerTimer();
              startServerTimerMonitoring(io, defaultDur);

              await storage.updateGameState({
                roundAnnouncement: null,
                gameStatus: 'RUNNING',
                currentRound: roundNum,
                currentQuestionIndex: 0,
                stageView: 'question',
                landingVisible: false,
                leaderboardVisible: false,
                qualifiersVisible: false,
                podiumVisible: false,
                answerRevealed: false,
                revealedCluesCount: initRevealedCount,
                timer: {
                  duration: defaultDur,
                  startedAt: Date.now(),
                  pausedAt: null,
                  status: 'RUNNING'
                }
              });

              io.emit('gameStarted', { round: roundNum, timestamp: Date.now() });
              io.emit('timerStarted', { duration: defaultDur, status: 'RUNNING' });
              io.emit('triggerAudioEffect', { sound: 'timer-start' });

              const freshSync = await getFullSyncPayload();
              io.emit('gameStateSync', freshSync);
            }
          } catch (e) {
            console.error('Auto-start round error:', e);
          }
        }, 5500);
      } catch (err) {
        console.error('game:announce-round error:', err);
      }
    });

    socket.on('game:dismiss-announcement', async () => {
      try {
        await storage.updateGameState({ roundAnnouncement: null });
        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:dismiss-announcement error:', err);
      }
    });

    socket.on('game:end-round', async () => {
      try {
        clearServerTimer();
        const state = await storage.getGameState();
        const updates = {
          stageView: 'leaderboard',
          landingVisible: false,
          leaderboardVisible: true,
          qualifiersVisible: false,
          podiumVisible: false,
          answerRevealed: false
        };

        if (state.currentRound === 1) {
          updates.round1Completed = true;
        } else if (state.currentRound === 2) {
          updates.round2Completed = true;
        }

        await storage.updateGameState(updates);

        io.emit('leaderboardShown', { timestamp: Date.now() });
        io.emit('triggerAudioEffect', { sound: 'leaderboard' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:end-round error:', err);
      }
    });

    socket.on('game:end', async () => {
      try {
        clearServerTimer();
        const appSettings = await storage.getSettings();
        await storage.updateGameState({
          gameStatus: 'FINISHED',
          stageView: 'podium',
          podiumVisible: true,
          leaderboardVisible: false,
          landingVisible: false,
          qualifiersVisible: false,
          answerRevealed: false
        });

        io.emit('gameEnded', { timestamp: Date.now() });
        io.emit('triggerAudioEffect', { sound: 'winner' });
        if (appSettings.celebrationAudioUrl) {
          io.emit('celebrationAudioControl', { action: 'play', url: appSettings.celebrationAudioUrl });
        }

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:end error:', err);
      }
    });

    socket.on('game:reset', async () => {
      try {
        clearServerTimer();
        await storage.resetGame();
        io.emit('gameStateChanged', { reset: true });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('game:reset error:', err);
      }
    });

    // --- SERVER TIMER EVENTS ---

    socket.on('timer:start', async ({ duration } = {}) => {
      try {
        const state = await storage.getGameState();
        const settings = await storage.getSettings();
        const roundDefault = getRoundDefaultTimer(settings, state.currentRound);
        const dur = (duration && Number(duration) > 0) ? Number(duration) : roundDefault;

        state.timer = {
          duration: dur,
          startedAt: Date.now(),
          pausedAt: null,
          status: 'RUNNING'
        };

        await storage.updateGameState({ timer: state.timer });

        io.emit('timerStarted', {
          duration: dur,
          startedAt: state.timer.startedAt,
          status: 'RUNNING'
        });
        io.emit('triggerAudioEffect', { sound: 'timer-start' });

        startServerTimerMonitoring(io, dur);

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('timer:start error:', err);
      }
    });

    socket.on('timer:pause', async () => {
      try {
        const state = await storage.getGameState();
        if (state.timer.status === 'RUNNING' && state.timer.startedAt) {
          clearServerTimer();
          const elapsed = (Date.now() - state.timer.startedAt) / 1000;
          const remaining = Math.max(0, state.timer.duration - elapsed);

          state.timer = {
            duration: remaining,
            startedAt: null,
            pausedAt: Date.now(),
            status: 'PAUSED'
          };

          await storage.updateGameState({ timer: state.timer });
          io.emit('timerPaused', { duration: remaining, status: 'PAUSED' });

          const syncData = await getFullSyncPayload();
          io.emit('gameStateSync', syncData);
        }
      } catch (err) {
        console.error('timer:pause error:', err);
      }
    });

    socket.on('timer:resume', async () => {
      try {
        const state = await storage.getGameState();
        if (state.timer.status === 'PAUSED') {
          const remaining = state.timer.duration;
          state.timer = {
            duration: remaining,
            startedAt: Date.now(),
            pausedAt: null,
            status: 'RUNNING'
          };

          await storage.updateGameState({ timer: state.timer });
          io.emit('timerResumed', {
            duration: remaining,
            startedAt: state.timer.startedAt,
            status: 'RUNNING'
          });

          startServerTimerMonitoring(io, remaining);

          const syncData = await getFullSyncPayload();
          io.emit('gameStateSync', syncData);
        }
      } catch (err) {
        console.error('timer:resume error:', err);
      }
    });

    socket.on('timer:reset', async ({ duration } = {}) => {
      try {
        clearServerTimer();
        const state = await storage.getGameState();
        const settings = await storage.getSettings();
        const roundDefault = getRoundDefaultTimer(settings, state.currentRound);
        const dur = (duration && Number(duration) > 0) ? Number(duration) : roundDefault;

        state.timer = {
          duration: dur,
          startedAt: null,
          pausedAt: null,
          status: 'IDLE'
        };

        await storage.updateGameState({ timer: state.timer });
        io.emit('timerReset', { duration: dur, status: 'IDLE' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('timer:reset error:', err);
      }
    });

    // --- AUDIO EVENTS ---

    socket.on('audio:trigger', ({ sound }) => {
      io.emit('triggerAudioEffect', { sound });
    });

    socket.on('audio:stop', () => {
      io.emit('audioStopped', { timestamp: Date.now() });
    });

    socket.on('audio:settings', async ({ audioMode, masterVolume, soundEffects }) => {
      try {
        const updates = {};
        if (audioMode) updates.audioMode = audioMode;
        if (masterVolume !== undefined) updates.masterVolume = masterVolume;
        if (soundEffects) updates.soundEffects = soundEffects;

        await storage.updateSettings(updates);
        if (audioMode || masterVolume !== undefined) {
          await storage.updateGameState({
            ...(audioMode && { audioMode }),
            ...(masterVolume !== undefined && { masterVolume })
          });
        }

        io.emit('audioSettingsChanged', updates);
        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('audio:settings error:', err);
      }
    });

    // --- CELEBRATION AUDIO EVENTS ---

    socket.on('celebration:set-audio', async ({ url }) => {
      try {
        await storage.updateSettings({ celebrationAudioUrl: url || '' });
        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('celebration:set-audio error:', err);
      }
    });

    socket.on('celebration:control-audio', async ({ action, url, volume }) => {
      try {
        const appSettings = await storage.getSettings();
        const audioUrl = url !== undefined ? url : appSettings.celebrationAudioUrl;
        if (url !== undefined && url !== appSettings.celebrationAudioUrl) {
          await storage.updateSettings({ celebrationAudioUrl: url });
        }
        io.emit('celebrationAudioControl', { action, url: audioUrl, volume });
      } catch (err) {
        console.error('celebration:control-audio error:', err);
      }
    });

    // --- TIE BREAKER SELECTION ---

    socket.on('tiebreaker:select-teams', async ({ teamIds }) => {
      try {
        await storage.updateGameState({
          tieDetected: true,
          activeTieBreakerTeams: teamIds
        });
        io.emit('triggerAudioEffect', { sound: 'tie-breaker' });

        const syncData = await getFullSyncPayload();
        io.emit('gameStateSync', syncData);
      } catch (err) {
        console.error('tiebreaker:select-teams error:', err);
      }
    });

    // --- DISCONNECT ---

    socket.on('disconnect', () => {
      if (connectedDisplays.has(socket.id)) {
        connectedDisplays.delete(socket.id);
        io.emit('displayDisconnected', { count: connectedDisplays.size });
      }
      if (connectedHosts.has(socket.id)) {
        connectedHosts.delete(socket.id);
      }
      console.log(`❌ Client disconnected [${socket.id}]`);
    });
  });
}

function broadcastStateChange() {
  if (ioInstance) {
    getFullSyncPayload().then(data => {
      ioInstance.emit('gameStateSync', data);
    }).catch(console.error);
  }
}

function broadcastScoreUpdate(team) {
  if (ioInstance) {
    ioInstance.emit('scoreUpdated', { team });
    storage.getTeams().then(teams => {
      ioInstance.emit('leaderboardUpdated', { teams });
    }).catch(console.error);
  }
}

module.exports = {
  initSocket,
  broadcastStateChange,
  broadcastScoreUpdate,
  clearServerTimer
};
