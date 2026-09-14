const { storage } = require('../services/storage');
const { broadcastStateChange, clearServerTimer } = require('../socket/gameSocket');

exports.getGameState = async (req, res) => {
  try {
    const gameState = await storage.getGameState();
    const settings = await storage.getSettings();
    const questions = await storage.getQuestions(gameState.currentRound);
    const teams = await storage.getTeams();
    const currentQuestion = questions[gameState.currentQuestionIndex] || null;

    res.json({
      success: true,
      data: {
        gameState,
        settings,
        currentQuestion,
        totalQuestions: questions.length,
        teams
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.startGame = async (req, res) => {
  try {
    const state = await storage.updateGameState({ gameStatus: 'RUNNING' });
    broadcastStateChange();
    res.json({ success: true, data: state });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.stopGame = async (req, res) => {
  try {
    clearServerTimer();
    const state = await storage.getGameState();
    const updated = await storage.updateGameState({
      gameStatus: 'PAUSED',
      timer: {
        ...state.timer,
        status: 'PAUSED',
        startedAt: null,
        pausedAt: Date.now()
      }
    });
    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.newGame = async (req, res) => {
  try {
    clearServerTimer();
    const { resetScores } = req.body || {};
    let resetState;
    if (resetScores) {
      resetState = await storage.resetGame({ resetScores: true });
    } else {
      const questions = await storage.getQuestions(1);
      const firstQ = questions[0] || null;
      resetState = await storage.updateGameState({
        currentRound: 1,
        currentQuestionIndex: 0,
        gameStatus: 'READY',
        answerRevealed: false,
        revealedCluesCount: 4,
        leaderboardVisible: false,
        podiumVisible: false,
        tieDetected: false,
        timer: {
          duration: firstQ ? firstQ.timerDuration : 30,
          startedAt: null,
          pausedAt: null,
          status: 'IDLE'
        }
      });
    }
    broadcastStateChange();
    res.json({ success: true, data: resetState, message: 'New game initialized.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.nextQuestion = async (req, res) => {
  try {
    clearServerTimer();
    const state = await storage.getGameState();
    const questions = await storage.getQuestions(state.currentRound);
    let nextIdx = state.currentQuestionIndex + 1;
    if (nextIdx >= questions.length) nextIdx = questions.length - 1;

    const nextQ = questions[nextIdx];
    const nextRevealedCount = state.currentRound === 2 ? 1 : (nextQ?.clues?.length || 4);
    const updated = await storage.updateGameState({
      currentQuestionIndex: nextIdx,
      answerRevealed: false,
      revealedCluesCount: nextRevealedCount,
      leaderboardVisible: false,
      podiumVisible: false,
      timer: {
        duration: nextQ ? nextQ.timerDuration : 30,
        startedAt: null,
        pausedAt: null,
        status: 'IDLE'
      }
    });

    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.previousQuestion = async (req, res) => {
  try {
    clearServerTimer();
    const state = await storage.getGameState();
    const questions = await storage.getQuestions(state.currentRound);
    let prevIdx = Math.max(0, state.currentQuestionIndex - 1);

    const prevQ = questions[prevIdx];
    const prevRevealedCount = state.currentRound === 2 ? 1 : (prevQ?.clues?.length || 4);
    const updated = await storage.updateGameState({
      currentQuestionIndex: prevIdx,
      answerRevealed: false,
      revealedCluesCount: prevRevealedCount,
      leaderboardVisible: false,
      podiumVisible: false,
      timer: {
        duration: prevQ ? prevQ.timerDuration : 30,
        startedAt: null,
        pausedAt: null,
        status: 'IDLE'
      }
    });

    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.revealAnswer = async (req, res) => {
  try {
    clearServerTimer();
    const state = await storage.getGameState();
    const updated = await storage.updateGameState({
      answerRevealed: true,
      timer: {
        ...state.timer,
        status: 'STOPPED',
        startedAt: null,
        pausedAt: null
      }
    });
    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.hideAnswer = async (req, res) => {
  try {
    const updated = await storage.updateGameState({ answerRevealed: false });
    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.revealNextClue = async (req, res) => {
  try {
    const state = await storage.getGameState();
    const questions = await storage.getQuestions(state.currentRound);
    const currentQ = questions[state.currentQuestionIndex];
    const totalClues = currentQ?.clues?.length || 4;
    const currentCount = state.revealedCluesCount !== undefined ? state.revealedCluesCount : 1;
    const nextCount = Math.min(totalClues, currentCount + 1);

    const updated = await storage.updateGameState({ revealedCluesCount: nextCount });
    broadcastStateChange();
    res.json({ success: true, data: updated, revealedCluesCount: nextCount, totalClues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.revealAllClues = async (req, res) => {
  try {
    const state = await storage.getGameState();
    const questions = await storage.getQuestions(state.currentRound);
    const currentQ = questions[state.currentQuestionIndex];
    const totalClues = currentQ?.clues?.length || 4;

    const updated = await storage.updateGameState({ revealedCluesCount: totalClues });
    broadcastStateChange();
    res.json({ success: true, data: updated, revealedCluesCount: totalClues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setRound = async (req, res) => {
  try {
    const { round } = req.body;
    const roundNum = Number(round);
    const questions = await storage.getQuestions(roundNum);
    const firstQ = questions[0];

    let tieDetected = false;
    let activeTieBreakerTeams = [];
    if (roundNum === 3) {
      const teams = await storage.getTeams();
      if (teams.length >= 2) {
        const topScore = teams[0].totalScore;
        const tied = teams.filter(t => t.totalScore === topScore && topScore > 0);
        if (tied.length > 1) {
          tieDetected = true;
          activeTieBreakerTeams = tied.map(t => t.teamId);
        }
      }
    }

    const updated = await storage.updateGameState({
      currentRound: roundNum,
      currentQuestionIndex: 0,
      answerRevealed: false,
      revealedCluesCount: roundNum === 2 ? 1 : (firstQ?.clues?.length || 4),
      leaderboardVisible: false,
      podiumVisible: false,
      tieDetected,
      activeTieBreakerTeams: activeTieBreakerTeams.length ? activeTieBreakerTeams : undefined,
      timer: {
        duration: firstQ ? firstQ.timerDuration : 30,
        startedAt: null,
        pausedAt: null,
        status: 'IDLE'
      }
    });

    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setStageView = async (req, res) => {
  try {
    const { view } = req.body;
    const landingVisible = view === 'landing';
    const leaderboardVisible = view === 'leaderboard';
    const qualifiersVisible = view === 'qualifiers';
    const podiumVisible = view === 'podium';
    const updated = await storage.updateGameState({
      stageView: view,
      landingVisible,
      leaderboardVisible,
      qualifiersVisible,
      podiumVisible
    });
    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setQualifiers = async (req, res) => {
  try {
    const { teamIds, broadcastToDisplay } = req.body;
    const updates = { qualifiedTeams: teamIds || [] };
    if (broadcastToDisplay) {
      updates.stageView = 'qualifiers';
      updates.qualifiersVisible = true;
      updates.landingVisible = false;
      updates.leaderboardVisible = false;
      updates.podiumVisible = false;
    }
    const updated = await storage.updateGameState(updates);
    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.announceRound = async (req, res) => {
  try {
    const { round, title, message } = req.body;
    const announcement = {
      round: Number(round) || 1,
      title: title || `ROUND ${round} HAS COMMENCED!`,
      message: message || `Round ${round} of the Connection Game has officially begun. Best of luck to all teams!`,
      timestamp: Date.now()
    };
    const updated = await storage.updateGameState({ roundAnnouncement: announcement });
    broadcastStateChange();
    res.json({ success: true, data: updated, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.endRound = async (req, res) => {
  try {
    clearServerTimer();
    const state = await storage.getGameState();
    const updated = await storage.updateGameState({
      leaderboardVisible: true,
      podiumVisible: false,
      answerRevealed: false
    });
    broadcastStateChange();
    res.json({ success: true, data: updated, message: `Round ${state.currentRound} ended. Leaderboard shown.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.endGame = async (req, res) => {
  try {
    clearServerTimer();
    const updated = await storage.updateGameState({
      gameStatus: 'FINISHED',
      leaderboardVisible: false,
      podiumVisible: true,
      answerRevealed: false
    });
    try {
      const { Game } = require('../models');
      if (storage.isMongo()) {
        await Game.findOneAndUpdate(
          { gameId: 'main_game' },
          { $set: { status: 'FINISHED', endedAt: new Date() } },
          { upsert: true }
        );
      }
    } catch (e) {}

    broadcastStateChange();
    res.json({ success: true, data: updated, message: 'Game finished. Championship celebration shown.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetGame = async (req, res) => {
  try {
    const resetState = await storage.resetGame();
    broadcastStateChange();
    res.json({ success: true, data: resetState, message: 'Game has been reset to initial state.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reseedData = async (req, res) => {
  try {
    await storage.reseed();
    broadcastStateChange();
    res.json({ success: true, message: 'Restored 25 demo teams and questions.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
