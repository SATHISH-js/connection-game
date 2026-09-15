import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { audioEngine } from '../services/audioEngine';

const GameContext = createContext(null);

export const GameProvider = ({ children, role = 'viewer' }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);

  const [gameState, setGameState] = useState({
    currentRound: 1,
    currentQuestionIndex: 0,
    gameStatus: 'READY',
    stageView: 'question',
    timer: { duration: 30, startedAt: null, pausedAt: null, status: 'IDLE' },
    answerRevealed: false,
    revealedCluesCount: 4,
    landingVisible: false,
    leaderboardVisible: false,
    podiumVisible: false,
    qualifiersVisible: false,
    qualifiedTeams: [],
    roundAnnouncement: null,
    tieDetected: false,
    activeTieBreakerTeams: [],
    audioMode: 'full',
    masterVolume: 0.85
  });

  const [settings, setSettings] = useState({
    eventName: 'CONNECTION GAME',
    eventSubtitle: 'Think. Connect. Win.',
    collegeName: 'K.S.R. COLLEGE OF ENGINEERING (AUTONOMOUS)',
    departmentName: 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING',
    organisedBy: 'ASSOCIATION OF COMPUTER SCIENCE & ENGINEERING — TECHFEST 2026',
    gameRules: [
      'Each round presents visual & multimedia clues linked to a hidden connecting entity.',
      'Round 1: Normal Connection (10 Points per question). All 20+ teams compete.',
      'Top qualifying teams advance to Round 2 based on Round 1 score rankings.',
      'Round 2: Sequential Clue Unlocking — clues unlock step-by-step with points for early answers.',
      'Round 3: High-Stakes Tie Breaker to determine the podium champions.',
      'Electronic devices strictly prohibited during buzzer rounds. Quiz Master decisions are final.'
    ],
    landingCountdownMinutes: 15,
    landingCountdownTarget: null,
    landingCountdownActive: false,
    defaultTimer: 30,
    autoRotateLeaderboard: true,
    leaderboardRotationTime: 6,
    theme: 'dark'
  });

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [teams, setTeams] = useState([]);
  const [timerRemaining, setTimerRemaining] = useState(30);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [toast, setToast] = useState(null);
  const [celebrationAudioEvent, setCelebrationAudioEvent] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('connection_game_theme') || 'dark';
  });

  // Persistent Smart Board Mini Preview state: Default is FALSE so it never pops up without user touch/action
  const [showMiniPreview, setShowMiniPreview] = useState(() => {
    return localStorage.getItem('smartboard_preview_open') === 'true';
  });

  const toggleMiniPreview = useCallback(() => {
    setShowMiniPreview(prev => {
      const next = !prev;
      localStorage.setItem('smartboard_preview_open', String(next));
      return next;
    });
  }, []);

  const setMiniPreviewOpen = useCallback((isOpen) => {
    setShowMiniPreview(Boolean(isOpen));
    localStorage.setItem('smartboard_preview_open', String(Boolean(isOpen)));
  }, []);

  useEffect(() => {
    localStorage.setItem('connection_game_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const timerTickerRef = useRef(null);
  const countdownBeepPlayedRef = useRef({});

  // Show auto-dismissing toast
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Compute remaining timer from server timestamps
  const updateTimerCountdown = useCallback((timer) => {
    if (!timer) return;

    if (timer.status === 'RUNNING' && timer.startedAt) {
      const elapsed = (Date.now() - timer.startedAt) / 1000;
      const left = Math.max(0, Math.ceil(timer.duration - elapsed));
      setTimerRemaining(left);

      // Play subtle countdown beep for final 5 seconds if not already played for this second
      if (left <= 5 && left > 0 && !countdownBeepPlayedRef.current[left]) {
        countdownBeepPlayedRef.current[left] = true;
        audioEngine.playEffect('countdown');
      }
    } else if (timer.status === 'PAUSED' || timer.status === 'STOPPED') {
      setTimerRemaining(Math.max(0, Math.ceil(timer.duration)));
      countdownBeepPlayedRef.current = {};
    } else if (timer.status === 'IDLE') {
      setTimerRemaining(Math.max(0, Math.ceil(timer.duration)));
      countdownBeepPlayedRef.current = {};
    } else if (timer.status === 'FINISHED') {
      setTimerRemaining(0);
      countdownBeepPlayedRef.current = {};
    }
  }, []);

  // Socket Connection Setup
  useEffect(() => {
    // Determine socket target: explicit VITE_SERVER_URL (e.g. Vercel -> Render), dev proxy, or same-origin (Render all-in-one)
    const envServerUrl = import.meta.env.VITE_SERVER_URL;
    const isDevPort = window.location.port === '3000' || window.location.port === '5173';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const socketHost = envServerUrl
      ? envServerUrl.replace(/\/$/, '')
      : (isDevPort && isLocalhost)
        ? 'http://127.0.0.1:5000'
        : (isDevPort && !isLocalhost)
          ? `${window.location.protocol}//${window.location.hostname}:5000`
          : window.location.origin;
    
    const newSocket = io(socketHost, {
      query: { role },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 50,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Socket connected to server with ID:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.warn('❌ Socket disconnected from server.');
    });

    newSocket.on('displayConnected', ({ count }) => {
      setDisplayCount(count);
      if (role === 'host') showToast('Display connected to game.', 'success');
    });

    newSocket.on('displayDisconnected', ({ count }) => {
      setDisplayCount(count);
      if (role === 'host') showToast('Display disconnected.', 'warning');
    });

    // Central state synchronization event
    newSocket.on('gameStateSync', (data) => {
      if (data.gameState) setGameState(data.gameState);
      if (data.settings) {
        setSettings(data.settings);
        audioEngine.setVolume(data.settings.masterVolume);
        audioEngine.setAudioMode(data.settings.audioMode);
        if (data.settings.soundEffects) {
          audioEngine.setSoundEffects(data.settings.soundEffects);
        }
      }
      if (data.currentQuestion !== undefined) setCurrentQuestion(data.currentQuestion);
      if (data.totalQuestions !== undefined) setTotalQuestions(data.totalQuestions);
      if (data.teams) setTeams(data.teams);
      if (data.displayCount !== undefined) setDisplayCount(data.displayCount);

      if (data.gameState?.timer) {
        updateTimerCountdown(data.gameState.timer);
      }
    });

    // Audio effect triggered from server (plays on all displays)
    newSocket.on('triggerAudioEffect', ({ sound }) => {
      audioEngine.playEffect(sound);
    });

    newSocket.on('audioStopped', () => {
      audioEngine.stopAll();
    });

    // Answer revealed with audio speech / upload execution
    newSocket.on('answerRevealed', (revealData) => {
      audioEngine.handleAnswerRevealAudio(revealData);
    });

    // Score / Leaderboard updates
    newSocket.on('scoreUpdated', ({ team }) => {
      setTeams(prev => prev.map(t => t.teamId === team.teamId ? team : t).sort((a, b) => b.totalScore - a.totalScore || a.teamNumber - b.teamNumber));
    });

    newSocket.on('leaderboardUpdated', ({ teams: updatedTeams }) => {
      setTeams(updatedTeams);
    });

    // Auto-stop timer notification when answer is revealed or timer cancelled
    newSocket.on('timerStopped', () => {
      countdownBeepPlayedRef.current = {};
    });

    // Auto-started timer when question changes or begins
    newSocket.on('questionChanged', ({ questionIndex, autoStarted, duration }) => {
      countdownBeepPlayedRef.current = {};
      if (role === 'host') {
        const msg = autoStarted
          ? `Question ${questionIndex + 1} Started! Timer Active (${duration}s)`
          : `Question ${questionIndex + 1} Ready`;
        showToast(msg, autoStarted ? 'success' : 'info');
        if (autoStarted) {
          audioEngine.playEffect('timer-start');
        }
      }
    });

    newSocket.on('timerStarted', ({ duration }) => {
      countdownBeepPlayedRef.current = {};
      if (role === 'host') {
        showToast(`⏱️ Timer Started (${duration}s)`, 'info');
      }
    });

    newSocket.on('roundAnnounced', (announcement) => {
      audioEngine.playEffect('game-start');
      if (announcement?.message && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(announcement.message);
          utterance.rate = 1.0;
          utterance.pitch = 1.05;
          window.speechSynthesis.speak(utterance);
        } catch (e) {}
      }
    });

    newSocket.on('newGameStarted', ({ resetScores }) => {
      countdownBeepPlayedRef.current = {};
      if (role === 'host') {
        showToast(resetScores ? 'Fresh Game Initialized (All Scores Reset)' : 'New Game Initialized', 'info');
      }
    });

    newSocket.on('gameStopped', () => {
      if (role === 'host') {
        showToast('Game paused / stopped.', 'warning');
      }
    });

    newSocket.on('celebrationAudioControl', (control) => {
      setCelebrationAudioEvent({ ...control, timestamp: Date.now() });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [role, showToast, updateTimerCountdown]);

  // High-precision local timer tick monitor (100ms)
  useEffect(() => {
    timerTickerRef.current = setInterval(() => {
      if (gameState.timer) {
        updateTimerCountdown(gameState.timer);
      }
    }, 100);

    return () => {
      if (timerTickerRef.current) clearInterval(timerTickerRef.current);
    };
  }, [gameState.timer, updateTimerCountdown]);

  // Audio Unlock Action
  const unlockAudio = useCallback(() => {
    const success = audioEngine.unlockAudio();
    if (success) {
      setAudioUnlocked(true);
      audioEngine.playEffect('timer-start');
      showToast('Audio unlocked for this display!', 'success');
    }
  }, [showToast]);

  // --- HOST CONTROLS ---

  const startGame = useCallback((options = {}) => {
    socket?.emit('game:start', options);
  }, [socket]);

  const startRound = useCallback((round, duration) => {
    socket?.emit('game:start', { round, duration });
  }, [socket]);

  const nextQuestion = useCallback(() => {
    countdownBeepPlayedRef.current = {};
    socket?.emit('game:next');
  }, [socket]);

  const prevQuestion = useCallback(() => {
    countdownBeepPlayedRef.current = {};
    socket?.emit('game:previous');
  }, [socket]);

  const setRound = useCallback((round) => {
    countdownBeepPlayedRef.current = {};
    socket?.emit('game:set-round', { round });
  }, [socket]);

  const startTimer = useCallback((duration) => {
    countdownBeepPlayedRef.current = {};
    socket?.emit('timer:start', { duration });
  }, [socket]);

  const pauseTimer = useCallback(() => {
    socket?.emit('timer:pause');
  }, [socket]);

  const resumeTimer = useCallback(() => {
    socket?.emit('timer:resume');
  }, [socket]);

  const resetTimer = useCallback((duration) => {
    countdownBeepPlayedRef.current = {};
    socket?.emit('timer:reset', { duration });
  }, [socket]);

  const revealAnswer = useCallback(() => {
    socket?.emit('game:reveal-answer');
  }, [socket]);

  const hideAnswer = useCallback(() => {
    socket?.emit('game:hide-answer');
  }, [socket]);

  const revealNextClue = useCallback(() => {
    socket?.emit('game:reveal-next-clue');
  }, [socket]);

  const revealAllClues = useCallback(() => {
    socket?.emit('game:reveal-all-clues');
  }, [socket]);

  const resetClues = useCallback(() => {
    socket?.emit('game:reset-clues');
  }, [socket]);

  const toggleLeaderboard = useCallback(() => {
    socket?.emit('game:toggle-leaderboard');
  }, [socket]);

  const togglePodium = useCallback(() => {
    socket?.emit('game:toggle-podium');
  }, [socket]);

  const endRound = useCallback(() => {
    socket?.emit('game:end-round');
    showToast(`Round ${gameState.currentRound || 1} concluded! Leaderboard displayed on Smart Board.`, 'info');
  }, [socket, gameState.currentRound, showToast]);

  const endGame = useCallback(() => {
    socket?.emit('game:end');
  }, [socket]);

  const resetGame = useCallback(() => {
    countdownBeepPlayedRef.current = {};
    socket?.emit('game:reset');
    showToast('Game state has been completely reset.', 'info');
  }, [socket, showToast]);

  const stopGame = useCallback(() => {
    socket?.emit('game:stop');
  }, [socket]);

  const startNewGame = useCallback((options = { resetScores: false }) => {
    countdownBeepPlayedRef.current = {};
    socket?.emit('game:new', options);
  }, [socket]);

  const setStageView = useCallback((view) => {
    // view: 'question' | 'leaderboard' | 'podium'
    socket?.emit('game:set-stage-view', { view });
  }, [socket]);

  const triggerAudioEffect = useCallback((sound) => {
    socket?.emit('audio:trigger', { sound });
    // Also play locally on host for testing
    audioEngine.playEffect(sound);
  }, [socket]);

  const stopAudio = useCallback(() => {
    socket?.emit('audio:stop');
    audioEngine.stopAll();
  }, [socket]);

  const updateAudioSettings = useCallback(({ audioMode, masterVolume, soundEffects }) => {
    if (audioMode) audioEngine.setAudioMode(audioMode);
    if (masterVolume !== undefined) audioEngine.setVolume(masterVolume);
    if (soundEffects) audioEngine.setSoundEffects(soundEffects);
    socket?.emit('audio:settings', { audioMode, masterVolume, soundEffects });
  }, [socket]);

  const setCelebrationAudio = useCallback((url) => {
    socket?.emit('celebration:set-audio', { url });
  }, [socket]);

  const controlCelebrationAudio = useCallback((action, url, volume) => {
    socket?.emit('celebration:control-audio', { action, url, volume });
  }, [socket]);

  const selectTieBreakerTeams = useCallback((teamIds) => {
    socket?.emit('tiebreaker:select-teams', { teamIds });
  }, [socket]);

  const setQualifiers = useCallback((teamIdsOrObj, broadcast) => {
    let teamIds = [];
    let broadcastToDisplay = false;
    if (Array.isArray(teamIdsOrObj)) {
      teamIds = teamIdsOrObj;
      broadcastToDisplay = !!broadcast;
    } else if (teamIdsOrObj && typeof teamIdsOrObj === 'object') {
      teamIds = teamIdsOrObj.teamIds || teamIdsOrObj.qualifiedTeams || [];
      broadcastToDisplay = !!teamIdsOrObj.broadcastToDisplay || !!teamIdsOrObj.broadcast;
    }
    socket?.emit('qualifiers:set-teams', { teamIds, broadcastToDisplay });
  }, [socket]);

  const updateLandingSettings = useCallback(async (landingData) => {
    socket?.emit('landing:update', landingData);
    const pin = localStorage.getItem('host_auth_pin') || '1234';
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-host-pin': pin },
        body: JSON.stringify(landingData)
      });
      showToast('Smart Board landing details updated successfully!', 'success');
    } catch (e) {}
  }, [socket, showToast]);

  const triggerLandingCountdown = useCallback((minutesOrObj, actionParam) => {
    let action = 'start';
    let minutes = 15;
    if (typeof minutesOrObj === 'number') {
      minutes = minutesOrObj;
      action = minutes > 0 ? 'start' : 'stop';
    } else if (typeof minutesOrObj === 'string') {
      action = minutesOrObj;
      minutes = Number(actionParam) || 15;
    } else if (minutesOrObj && typeof minutesOrObj === 'object') {
      action = minutesOrObj.action || (Number(minutesOrObj.minutes) > 0 ? 'start' : 'stop');
      minutes = Number(minutesOrObj.minutes) || 15;
    }
    socket?.emit('landing:countdown', { action, minutes });
  }, [socket]);

  const announceRound = useCallback((roundOrObj, title, message) => {
    let round = 1;
    let t = '';
    let m = '';
    if (typeof roundOrObj === 'number' || typeof roundOrObj === 'string') {
      round = Number(roundOrObj) || 1;
      t = title || `ROUND ${round} HAS COMMENCED!`;
      m = message || `Round ${round} of the Connection Game has officially begun. Best of luck!`;
    } else if (roundOrObj && typeof roundOrObj === 'object') {
      round = Number(roundOrObj.round) || 1;
      t = roundOrObj.title || `ROUND ${round} HAS COMMENCED!`;
      m = roundOrObj.message || `Round ${round} of the Connection Game has officially begun. Best of luck!`;
    }
    socket?.emit('game:announce-round', { round, title: t, message: m });
    showToast(`Round ${round} announcement broadcasted to Smart Board!`, 'success');
  }, [socket, showToast]);

  const dismissAnnouncement = useCallback(() => {
    socket?.emit('game:dismiss-announcement');
  }, [socket]);

  // Update Score via HTTP with Host Auth Token
  const updateTeamScore = useCallback(async (teamId, { delta, round, directScore }) => {
    const pin = localStorage.getItem('host_auth_pin') || '1234';
    try {
      const res = await fetch(`/api/teams/${teamId}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-host-pin': pin
        },
        body: JSON.stringify({ delta, round, directScore })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Score updated for ${data.data.teamName}`, 'success');
        if (delta && delta > 0) audioEngine.playEffect('correct');
        else if (delta && delta < 0) audioEngine.playEffect('wrong');
      } else {
        showToast(data.message || 'Error updating score', 'danger');
      }
    } catch (err) {
      showToast('Network error updating score', 'danger');
    }
  }, [showToast]);

  return (
    <GameContext.Provider
      value={{
        socket,
        isConnected,
        displayCount,
        gameState,
        settings,
        currentQuestion,
        totalQuestions,
        teams,
        timerRemaining,
        audioUnlocked,
        toast,
        showToast,
        unlockAudio,
        theme,
        setTheme,
        toggleTheme,
        startGame,
        startRound,
        stopGame,
        startNewGame,
        setStageView,
        setQualifiers,
        updateLandingSettings,
        triggerLandingCountdown,
        announceRound,
        dismissAnnouncement,
        nextQuestion,
        prevQuestion,
        setRound,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        revealAnswer,
        hideAnswer,
        revealNextClue,
        revealAllClues,
        resetClues,
        toggleLeaderboard,
        togglePodium,
        endRound,
        endGame,
        resetGame,
        triggerAudioEffect,
        stopAudio,
        updateAudioSettings,
        celebrationAudioEvent,
        setCelebrationAudio,
        controlCelebrationAudio,
        selectTieBreakerTeams,
        updateTeamScore,
        showMiniPreview,
        toggleMiniPreview,
        setMiniPreviewOpen
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
