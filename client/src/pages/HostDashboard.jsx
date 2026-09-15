import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trophy,
  Swords,
  Timer,
  AlertTriangle,
  Award,
  Sparkles,
  CheckCircle,
  Volume2,
  Plus,
  Minus,
  Search,
  Lock,
  Unlock,
  Image as ImageIcon,
  Video as VideoIcon,
  Monitor,
  ExternalLink,
  RefreshCw,
  Megaphone,
  CheckSquare,
  Square,
  Star,
  Home,
  Clock,
  Music
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import HostLayout from '../components/HostLayout';
import TimerDisplay from '../components/TimerDisplay';
import { parseClueItem } from '../components/QuestionCard';
import CelebrationAudioController from '../components/CelebrationAudioController';

export default function HostDashboard() {
  const {
    gameState,
    settings,
    currentQuestion,
    totalQuestions,
    teams,
    timerRemaining,
    displayCount,
    startGame,
    startRound,
    stopGame,
    startNewGame,
    setStageView,
    setQualifiers,
    triggerLandingCountdown,
    announceRound,
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
    updateTeamScore,
    showToast
  } = useGame();

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [customScoreInput, setCustomScoreInput] = useState('');
  const [customTimerInput, setCustomTimerInput] = useState('');
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [showEndRoundConfirm, setShowEndRoundConfirm] = useState(false);
  const [showCelebrationAudioModal, setShowCelebrationAudioModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showQualifiersModal, setShowQualifiersModal] = useState(false);
  const [selectedQualifierIds, setSelectedQualifierIds] = useState(gameState.qualifiedTeams || []);
  const [showDisplayRequiredModal, setShowDisplayRequiredModal] = useState(false);
  const [bypassDisplayCheck, setBypassDisplayCheck] = useState(false);
  const navigate = useNavigate();

  // Keep selected qualifiers in sync with game state
  useEffect(() => {
    if (gameState.qualifiedTeams && gameState.qualifiedTeams.length > 0) {
      setSelectedQualifierIds(gameState.qualifiedTeams);
    }
  }, [gameState.qualifiedTeams]);

  const activeStageView = gameState.stageView || (
    gameState.landingVisible ? 'landing' :
    gameState.qualifiersVisible ? 'qualifiers' :
    gameState.leaderboardVisible ? 'leaderboard' :
    gameState.podiumVisible ? 'podium' : 'question'
  );

  const handleLaunchDisplay = () => {
    const displayWindow = window.open('/display', 'SmartBoardDisplay', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
    if (displayWindow) {
      displayWindow.focus();
      showToast('Smart Board Display window opened!', 'success');
    } else {
      showToast('Pop-up blocked. Please allow pop-ups for this site.', 'warning');
    }
  };

  const currentRoundNum = gameState.currentRound || 1;
  const roundLabel = currentRoundNum === 3 ? 'TIE BREAKER' : `ROUND ${currentRoundNum}`;

  const handleStartGame = (specificRound) => {
    if (displayCount === 0 && !bypassDisplayCheck) {
      setShowDisplayRequiredModal(true);
      return;
    }
    const r = specificRound || gameState.currentRound || 1;
    startRound(r);
    showToast(`${r === 3 ? 'Tie Breaker' : `Round ${r}`} Started! Display transitioned to Question 1.`, 'success');
  };

  // Protect Host route
  useEffect(() => {
    const pin = localStorage.getItem('host_auth_pin');
    if (!pin) {
      navigate('/host-login');
    }
  }, [navigate]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if typing inside an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (gameState.timer?.status === 'RUNNING') pauseTimer();
          else if (gameState.timer?.status === 'PAUSED') resumeTimer();
          else startTimer();
          break;
        case 'KeyN':
          e.preventDefault();
          nextQuestion();
          break;
        case 'KeyP':
          e.preventDefault();
          prevQuestion();
          break;
        case 'KeyR':
          e.preventDefault();
          resetTimer();
          break;
        case 'KeyA':
          e.preventDefault();
          revealAnswer();
          break;
        case 'KeyH':
          e.preventDefault();
          hideAnswer();
          break;
        case 'KeyC':
          e.preventDefault();
          revealNextClue();
          break;
        case 'KeyL':
          e.preventDefault();
          toggleLeaderboard();
          break;
        case 'KeyF':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.timer?.status, nextQuestion, prevQuestion, resetTimer, revealAnswer, hideAnswer, revealNextClue, toggleLeaderboard, startTimer, pauseTimer, resumeTimer]);

  const handleScoreChange = (delta) => {
    if (!selectedTeamId) {
      showToast('Please select a team first to adjust score.', 'warning');
      return;
    }
    updateTeamScore(selectedTeamId, { delta, round: gameState.currentRound || 1 });
  };

  const handleDirectScoreSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      showToast('Please select a team first.', 'warning');
      return;
    }
    const val = Number(customScoreInput);
    if (isNaN(val)) return;

    updateTeamScore(selectedTeamId, { directScore: val, round: gameState.currentRound || 1 });
    setCustomScoreInput('');
  };

  const selectedTeam = teams.find(t => t.teamId === selectedTeamId);

  return (
    <HostLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Status Bar & Round Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          {/* Round Selector Tabs with Locked Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-slate-400 uppercase mr-2 hidden sm:inline">
              SELECT ROUND:
            </span>
            {[
              { round: 1, label: 'ROUND 1', locked: false },
              {
                round: 2,
                label: 'ROUND 2',
                locked: !gameState.round1Completed && gameState.currentRound !== 2,
                lockedReason: 'Round 2 unlocks after Round 1 ends and qualifiers are selected'
              },
              { round: 3, label: 'TIE BREAKER', locked: false }
            ].map(r => (
              <button
                key={r.round}
                onClick={() => {
                  if (r.locked) {
                    showToast('Round 2 is locked! Complete Round 1 and select qualifiers first, or click End Round.', 'warning');
                    return;
                  }
                  setRound(r.round);
                }}
                title={r.locked ? r.lockedReason : undefined}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black tracking-wider transition-all flex items-center gap-1.5 ${
                  gameState.currentRound === r.round
                    ? r.round === 3
                      ? 'bg-rose-500/20 text-rose-300 border-2 border-rose-500 shadow-lg shadow-rose-500/20'
                      : 'bg-amber-500/20 text-amber-300 border-2 border-amber-500 shadow-lg shadow-amber-500/20'
                    : r.locked
                    ? 'bg-slate-900/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-75'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                }`}
              >
                {r.locked && <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />}
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Action Bar: Display Status & Launch, Start/Stop, New Game */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Display Connection Indicator & Direct Launcher */}
            <button
              onClick={handleLaunchDisplay}
              title="Launch Smart Board Display in a new window"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black tracking-wide transition-all ${
                displayCount > 0
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-600/35 animate-pulse'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{displayCount > 0 ? `DISPLAY LIVE (${displayCount})` : 'LAUNCH DISPLAY'}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>

            {/* Game Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <span className="text-slate-400">STATUS:</span>
              <span className={`font-black ${
                gameState.gameStatus === 'RUNNING'
                  ? 'text-emerald-400'
                  : gameState.gameStatus === 'PAUSED'
                  ? 'text-amber-400'
                  : gameState.gameStatus === 'FINISHED'
                  ? 'text-rose-400'
                  : 'text-cyan-400'
              }`}>
                {gameState.gameStatus || 'READY'}
              </span>
            </div>

            {/* Start / Stop Game Buttons (Per Round) */}
            {gameState.gameStatus === 'RUNNING' ? (
              <button
                onClick={stopGame}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-500/25 transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>STOP {roundLabel}</span>
              </button>
            ) : (
              <button
                onClick={() => handleStartGame(gameState.currentRound)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{gameState.gameStatus === 'PAUSED' ? `RESUME ${roundLabel}` : `START ${roundLabel}`}</span>
              </button>
            )}

            {/* New Game Button */}
            <button
              onClick={() => setShowNewGameModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-black text-xs tracking-wider transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>NEW GAME</span>
            </button>

            {/* Celebration Audio Remote Button */}
            <button
              onClick={() => setShowCelebrationAudioModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 font-black text-xs tracking-wider transition-all shadow-sm"
              title="Configure Celebration Audio and Remote Smart Board Control"
            >
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>CELEBRATION AUDIO</span>
            </button>
          </div>
        </div>

        {/* Smart Board Landing Countdown Quick Controller Station */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 border border-cyan-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-cyan-300 uppercase">
                  SMART BOARD LANDING COUNTDOWN TIMER
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${
                  settings?.landingCountdownActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {settings?.landingCountdownActive ? '● LIVE ON SMART BOARD' : 'STANDBY'}
                </span>
                {activeStageView !== 'landing' && (
                  <button
                    onClick={() => {
                      setStageView('landing');
                      showToast('Switched Smart Board display to Landing Screen.', 'info');
                    }}
                    className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 ml-2"
                  >
                    <Home className="w-3 h-3" />
                    <span>Show Landing on Display</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Display audience sees: "THE GAME IS GOING TO START IN mm:ss" with rules, college name & department.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-1 hidden sm:inline">
              START TIMER:
            </span>
            {[5, 10, 15, 20].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  triggerLandingCountdown(mins, 'start');
                  showToast(`Landing countdown started: ${mins} minutes!`, 'success');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide border transition-all ${
                  settings?.landingCountdownActive && settings?.landingCountdownMinutes === mins
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border-cyan-700/50'
                }`}
              >
                ▶ {mins} MIN
              </button>
            ))}

            <button
              onClick={() => {
                triggerLandingCountdown(0, 'stop');
                showToast('Landing countdown stopped.', 'info');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/50 text-xs font-bold transition-all"
            >
              ⏹ STOP
            </button>
          </div>
        </div>

        {/* Round 1 Finished: Progression & Qualifiers Hub */}
        {gameState.round1Completed && gameState.currentRound === 1 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-slate-900/90 border border-amber-500/50 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <span>ROUND 1 COMPLETED — LEADERBOARD IS LIVE ON SMART BOARD</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    NEXT: QUALIFIERS
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Audience Smart Board is currently showing the Round 1 Leaderboard. Select top teams, celebrate qualifiers, and commence Round 2!
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowQualifiersModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-black tracking-wide flex items-center gap-1.5 transition-all"
              >
                <Star className="w-4 h-4 text-emerald-400" />
                <span>SELECT QUALIFIERS ({selectedQualifierIds.length})</span>
              </button>

              <button
                onClick={() => {
                  setStageView('landing');
                  showToast('Smart Board switched to Round 2 Landing / Rules.', 'info');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Show Round 2 Landing / Rules screen on Smart Board"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>SHOW R2 LANDING / RULES</span>
              </button>

              <button
                onClick={() => {
                  setRound(2);
                  announceRound(2, 'ROUND 2: STEP-BY-STEP CONNECTION', 'Round 2 has commenced! Clues will be revealed one by one.');
                  showToast('Round 2 Started & Announced! Display showing Question 1.', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>START ROUND 2</span>
              </button>
            </div>
          </div>
        )}

        {/* Round 2 Finished: Grand Championship Hub */}
        {gameState.round2Completed && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-amber-950/40 to-slate-900/90 border border-purple-500/50 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-black text-purple-200 flex items-center gap-2">
                  <span>ROUND 2 COMPLETED — SCORES FINALIZED</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    PODIUM READY
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Round 2 is complete. Check for ties or click Crown Winners to launch the Grand Championship Celebration on the Smart Board!
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setRound(3)}
                className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/50 text-xs font-black tracking-wide flex items-center gap-1.5 transition-all"
              >
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>RUN TIE BREAKER</span>
              </button>

              <button
                onClick={() => setShowCelebrationAudioModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-500/50 text-xs font-black tracking-wide flex items-center gap-1.5 transition-all"
                title="Configure Victory Song and Remote Audio"
              >
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>🎶 CELEBRATION MUSIC</span>
              </button>

              <button
                onClick={() => {
                  endGame();
                  setStageView('podium');
                  showToast('Grand Championship Winners Crowned! Smart Board showing podium celebration.', 'success');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>🏆 CROWN WINNERS & CELEBRATE</span>
              </button>
            </div>
          </div>
        )}

        {/* Persistent Celebration Audio Quick Bar when Podium is active or Round 2 is finished */}
        {(activeStageView === 'podium' || gameState.round2Completed) && (
          <CelebrationAudioController compact={true} />
        )}

        {/* Main 2-Column Grid: Left Controls, Right Question Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Game Control Deck (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Timer Station Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col items-center text-center">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-cyan-400" />
                  <span>SYNCHRONIZED SERVER TIMER</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  DURATION: {gameState.timer?.duration || 30}s
                </span>
              </div>

              {/* Timer Display */}
              <TimerDisplay compact={false} />

              {/* Timer Action Buttons */}
              <div className="w-full space-y-3 mt-6">
                {/* Primary Controls */}
                <div className="grid grid-cols-2 gap-2.5">
                  {gameState.timer?.status === 'RUNNING' ? (
                    <button
                      onClick={pauseTimer}
                      className="py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs md:text-sm tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      <span>PAUSE TIMER [SPACE]</span>
                    </button>
                  ) : gameState.timer?.status === 'PAUSED' ? (
                    <button
                      onClick={resumeTimer}
                      className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs md:text-sm tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>RESUME TIMER [SPACE]</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startTimer()}
                      className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs md:text-sm tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>START TIMER [SPACE]</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const roundDefault = gameState.currentRound === 2 ? (settings?.round2Timer || 20) : gameState.currentRound === 3 ? (settings?.round3Timer || 15) : (settings?.round1Timer || 30);
                      resetTimer(roundDefault);
                    }}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs md:text-sm tracking-wider border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>RESET ({gameState.currentRound === 2 ? (settings?.round2Timer || 20) : gameState.currentRound === 3 ? (settings?.round3Timer || 15) : (settings?.round1Timer || 30)}s) [R]</span>
                  </button>
                </div>

                {/* Presets: 5s, 10s, 15s, 20s, 30s, 45s, 60s */}
                <div className="grid grid-cols-7 gap-1">
                  {[5, 10, 15, 20, 30, 45, 60].map(dur => (
                    <button
                      key={dur}
                      onClick={() => startTimer(dur)}
                      className={`py-2 rounded-xl text-xs font-mono font-black border transition-all ${
                        gameState.timer?.duration === dur && gameState.timer?.status === 'RUNNING'
                          ? 'bg-cyan-500/25 border-cyan-500 text-cyan-300 shadow'
                          : 'bg-slate-800/60 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>

                {/* Custom Timer Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    placeholder="Custom seconds..."
                    value={customTimerInput}
                    onChange={(e) => setCustomTimerInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => {
                      const val = Number(customTimerInput);
                      if (val > 0) {
                        startTimer(val);
                        setCustomTimerInput('');
                      }
                    }}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-colors"
                  >
                    START CUSTOM
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Clue Reveal Station (Active in Round 2 or when clues exist) */}
            <div className={`p-6 rounded-3xl backdrop-blur-xl shadow-xl transition-all border ${
              gameState.currentRound === 2
                ? 'bg-gradient-to-b from-purple-950/50 to-slate-900/80 border-purple-500/50 ring-2 ring-purple-500/30'
                : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>ROUND 2: STEP-BY-STEP CLUE REVEAL</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-500/40">
                  {Math.min(gameState.revealedCluesCount !== undefined ? gameState.revealedCluesCount : (gameState.currentRound === 2 ? 1 : 4), currentQuestion?.clues?.length || 4)} / {currentQuestion?.clues?.length || 4} UNLOCKED
                </span>
              </div>

              {/* Big Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={revealNextClue}
                  disabled={(gameState.revealedCluesCount || 1) >= (currentQuestion?.clues?.length || 4)}
                  className="sm:col-span-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm tracking-wider shadow-lg shadow-purple-600/30 disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>REVEAL NEXT CLUE [KEY: C]</span>
                </button>

                <button
                  onClick={revealAllClues}
                  className="py-3.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs tracking-wider border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4 text-amber-400" />
                  <span>REVEAL ALL</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-purple-300 font-bold">C</kbd> on keyboard during Round 2.</span>
                <button
                  onClick={resetClues}
                  className="text-slate-400 hover:text-rose-300 underline font-bold"
                >
                  Reset to 1 Clue
                </button>
              </div>
            </div>

            {/* Question Step Controls */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
              <div className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">
                QUESTION NAVIGATION
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={prevQuestion}
                  disabled={gameState.currentQuestionIndex <= 0}
                  className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-sm tracking-wider border border-slate-700 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>PREVIOUS QUESTION [P]</span>
                </button>

                <button
                  onClick={nextQuestion}
                  disabled={gameState.currentQuestionIndex >= totalQuestions - 1}
                  className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
                >
                  <span>NEXT QUESTION [N]</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Answer Reveal Master Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={revealAnswer}
                  className={`py-3.5 px-4 rounded-xl font-black text-sm tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                    gameState.answerRevealed
                      ? 'bg-emerald-600/30 text-emerald-300 border-2 border-emerald-500'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-600/30'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>REVEAL ANSWER [A]</span>
                </button>

                <button
                  onClick={hideAnswer}
                  className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition-all"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>HIDE ANSWER [H]</span>
                </button>
              </div>
            </div>

            {/* Smart Board Presentation Modes (Leaderboard, Podium, Qualifiers, Landing, End Round, Tie Breaker, End Game) */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black tracking-widest text-slate-400 uppercase">
                  SMART BOARD STAGE VIEWS & ROUND CONTROLS
                </div>
                <div className="text-[11px] font-mono font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  LIVE ON BOARD: {
                    activeStageView === 'question' ? '📺 QUESTION' :
                    activeStageView === 'landing' ? '🏠 LANDING' :
                    activeStageView === 'qualifiers' ? '🎯 R2 QUALIFIERS' :
                    activeStageView === 'leaderboard' ? '📊 LEADERBOARD' : '🏆 PODIUM'
                  }
                </div>
              </div>

              {/* Mutually Exclusive Stage Selector (One active, others automatically off) */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  SELECT STAGE DISPLAY (MUTUALLY EXCLUSIVE):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => setStageView('question')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black tracking-wider border transition-all flex flex-col items-center justify-center gap-1 ${
                      activeStageView === 'question'
                        ? 'bg-cyan-500/25 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/40'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>QUESTION</span>
                  </button>

                  <button
                    onClick={() => setStageView(activeStageView === 'landing' ? 'question' : 'landing')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black tracking-wider border transition-all flex flex-col items-center justify-center gap-1 ${
                      activeStageView === 'landing'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/40'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>LANDING</span>
                  </button>

                  <button
                    onClick={() => setStageView(activeStageView === 'leaderboard' ? 'question' : 'leaderboard')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black tracking-wider border transition-all flex flex-col items-center justify-center gap-1 ${
                      activeStageView === 'leaderboard'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/40'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>LEADERBOARD</span>
                  </button>

                  <button
                    onClick={() => setStageView(activeStageView === 'qualifiers' ? 'question' : 'qualifiers')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black tracking-wider border transition-all flex flex-col items-center justify-center gap-1 ${
                      activeStageView === 'qualifiers'
                        ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/40'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    <span>QUALIFIERS</span>
                  </button>

                  <button
                    onClick={() => setStageView(activeStageView === 'podium' ? 'question' : 'podium')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black tracking-wider border transition-all flex flex-col items-center justify-center gap-1 col-span-2 sm:col-span-1 ${
                      activeStageView === 'podium'
                        ? 'bg-purple-500/25 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/40'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>PODIUM</span>
                  </button>
                </div>
              </div>

              {/* Round Announcements Broadcast */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>BROADCAST ROUND ANNOUNCEMENT TO SMART BOARD:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => announceRound(1)}
                    className="py-2 px-2 rounded-xl text-xs font-black tracking-wide bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>ANNOUNCE R1</span>
                  </button>

                  <button
                    onClick={() => announceRound(2)}
                    className="py-2 px-2 rounded-xl text-xs font-black tracking-wide bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>ANNOUNCE R2</span>
                  </button>

                  <button
                    onClick={() => announceRound(3)}
                    className="py-2 px-2 rounded-xl text-xs font-black tracking-wide bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>ANNOUNCE R3</span>
                  </button>
                </div>
              </div>

              {/* Round & Game Ceremony Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setShowEndRoundConfirm(true)}
                  className="py-2 px-2.5 rounded-xl text-xs font-black tracking-wider bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>END ROUND</span>
                </button>

                <button
                  onClick={() => setShowQualifiersModal(true)}
                  className="py-2 px-2.5 rounded-xl text-xs font-black tracking-wider bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 text-emerald-400" />
                  <span>R2 QUALIFIERS ({selectedQualifierIds.length})</span>
                </button>

                <button
                  onClick={() => setRound(3)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                    gameState.currentRound === 3
                      ? 'bg-rose-500/25 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                      : 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-900/50 text-rose-300'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>TIE BREAKER</span>
                </button>

                <button
                  onClick={() => setShowEndGameConfirm(true)}
                  className="py-2 px-2.5 rounded-xl text-xs font-black tracking-wider bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/70 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CROWN WINNERS</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Question & Clue Deck + Quick Score Updater (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Question Clues Box */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                    <span>ACTIVE QUESTION</span>
                    <span className="font-mono text-sm text-yellow-300 font-black">#{gameState.currentQuestionIndex + 1}</span>
                    <span className="text-slate-500 font-mono">/</span>
                    <span className="font-mono text-sm text-slate-200 font-bold">{totalQuestions || 1}</span>
                  </span>
                </div>
                {gameState.answerRevealed && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    REVEALED ON DISPLAY
                  </span>
                )}
              </div>

              {currentQuestion ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-black">Title</div>
                    <div className="text-lg font-black text-slate-100">{currentQuestion.title}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 uppercase font-black mb-2 flex items-center justify-between">
                      <span>Clues Status ({currentQuestion.clues?.length || 0} Total)</span>
                      {gameState.currentRound === 2 && (
                        <span className="text-[10px] text-purple-400 font-mono font-bold">
                          Step-by-Step Mode
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {currentQuestion.clues?.map((rawClue, idx) => {
                        const clue = parseClueItem(rawClue);
                        const isRound2 = gameState.currentRound === 2;
                        const isRevealed = !isRound2 || idx < (gameState.revealedCluesCount !== undefined ? gameState.revealedCluesCount : 1);

                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                              isRevealed
                                ? 'bg-slate-950/80 border-emerald-500/40 text-slate-100'
                                : 'bg-slate-950/40 border-purple-500/30 text-slate-400 opacity-75'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-amber-400 text-xs font-mono font-black shrink-0">
                                #{idx + 1}
                              </span>

                              {/* Thumbnail preview */}
                              {clue.video ? (
                                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400">
                                  <VideoIcon className="w-4 h-4" />
                                </div>
                              ) : clue.image ? (
                                <img
                                  src={clue.image}
                                  alt="Clue"
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : clue.emoji ? (
                                <span className="text-xl shrink-0">{clue.emoji}</span>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}

                              <span className="text-xs font-bold truncate">
                                {clue.text || `Clue ${idx + 1}`}
                              </span>
                            </div>

                            {/* Revealed Status Pill */}
                            <div className="shrink-0">
                              {isRound2 ? (
                                isRevealed ? (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> REVEALED
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> LOCKED (STEP {idx + 1})
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500 font-bold">
                                  DISPLAYED
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-xs font-black text-amber-400 uppercase mb-1">
                      Official Connection Answer
                    </div>
                    <div className="text-xl font-black text-amber-300">
                      {currentQuestion.answerText}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center justify-between font-mono">
                      <span>Points: +{currentQuestion.points || 10}</span>
                      <span>Audio: {currentQuestion.audioType?.toUpperCase() || 'TTS'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-sm font-medium">
                  No question loaded for this round.
                </div>
              )}
            </div>

            {/* Quick Live Score Updater */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
              <div className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3 flex items-center justify-between">
                <span>QUICK SCORE ADJUSTER</span>
                {selectedTeam && (
                  <span className="text-amber-400 font-mono font-bold">
                    Total: {selectedTeam.totalScore} pts
                  </span>
                )}
              </div>

              {/* Team Selector Dropdown */}
              <div className="mb-4">
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- Choose Team to Award Points --</option>
                  {teams.map(t => (
                    <option key={t.teamId} value={t.teamId}>
                      {t.character} #{t.teamNumber} {t.teamName} ({t.totalScore} pts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Delta Buttons */}
              <div className="grid grid-cols-5 gap-1.5 mb-4">
                {[
                  { delta: 10, label: '+10', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' },
                  { delta: 5, label: '+5', color: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30' },
                  { delta: 1, label: '+1', color: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20' },
                  { delta: -1, label: '-1', color: 'bg-rose-600/15 text-rose-400 border-rose-500/20' },
                  { delta: -5, label: '-5', color: 'bg-rose-600/20 text-rose-300 border-rose-500/30' },
                ].map(b => (
                  <button
                    key={b.label}
                    onClick={() => handleScoreChange(b.delta)}
                    className={`py-2 rounded-xl text-xs font-black border transition-all hover:scale-105 active:scale-95 ${b.color}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Direct Custom Score Form */}
              <form onSubmit={handleDirectScoreSubmit} className="flex gap-2">
                <input
                  type="number"
                  placeholder="Set Score..."
                  value={customScoreInput}
                  onChange={(e) => setCustomScoreInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  SET
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH DEDICATED LIVE TEAM SCORING DESK (20+ TEAMS) */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-wide">
                  LIVE TEAM SCORING DESK
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {teams.length} Teams Registered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Award marks to any team with 1 click. Marks immediately reflect on the Viewer / Smart Board Leaderboard in real time.
              </p>
            </div>

            {/* Smart Board Broadcast & Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Leaderboard View Toggle */}
              <button
                onClick={toggleLeaderboard}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider border transition-all flex items-center gap-2 ${
                  gameState.leaderboardVisible
                    ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/50'
                    : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>{gameState.leaderboardVisible ? 'HIDE LEADERBOARD ON DISPLAY' : 'SHOW LEADERBOARD ON DISPLAY'}</span>
              </button>

              {/* Fast Team Search */}
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search 20+ teams..."
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Active Selected Team Command Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                ACTIVE TEAM:
              </span>
              {selectedTeam ? (
                <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                  <span className="text-xl">{selectedTeam.character}</span>
                  <span className="text-sm font-black text-amber-300">
                    #{selectedTeam.teamNumber} {selectedTeam.teamName}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    {selectedTeam.totalScore} PTS
                  </span>
                </div>
              ) : (
                <span className="text-xs text-amber-400/80 font-bold italic">
                  (Click any team card below to select or award marks)
                </span>
              )}
            </div>

            {/* Quick Action Marks Pads */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleScoreChange(currentQuestion?.points || 10)}
                disabled={!selectedTeamId}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+{currentQuestion?.points || 10} QUESTION PTS</span>
              </button>

              <button
                onClick={() => handleScoreChange(5)}
                disabled={!selectedTeamId}
                className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-black text-xs disabled:opacity-40 transition-colors"
              >
                +5 BONUS
              </button>

              <button
                onClick={() => handleScoreChange(1)}
                disabled={!selectedTeamId}
                className="px-2.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs disabled:opacity-40 transition-colors"
              >
                +1
              </button>

              <button
                onClick={() => handleScoreChange(-5)}
                disabled={!selectedTeamId}
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-black text-xs disabled:opacity-40 transition-colors"
              >
                -5 PENALTY
              </button>

              {/* Direct Custom Set Form */}
              <form onSubmit={handleDirectScoreSubmit} className="flex items-center gap-1.5 ml-1">
                <input
                  type="number"
                  placeholder="Set..."
                  value={customScoreInput}
                  onChange={(e) => setCustomScoreInput(e.target.value)}
                  className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!selectedTeamId}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 disabled:opacity-40 transition-colors"
                >
                  SET
                </button>
              </form>
            </div>
          </div>

          {/* Grid of 20+ Teams */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {teams
              .filter(t => {
                if (!teamSearchQuery) return true;
                const q = teamSearchQuery.toLowerCase();
                return (
                  t.teamName?.toLowerCase().includes(q) ||
                  String(t.teamNumber).includes(q) ||
                  t.characterName?.toLowerCase().includes(q)
                );
              })
              .map((team) => {
                const isSelected = team.teamId === selectedTeamId;
                const globalRank = teams.findIndex(t => t.teamId === team.teamId) + 1;

                return (
                  <div
                    key={team.teamId}
                    onClick={() => setSelectedTeamId(team.teamId)}
                    className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Top Row: Rank & Avatar */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                        globalRank === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : globalRank <= 3
                          ? 'bg-slate-700/50 text-slate-300 border border-slate-600'
                          : 'bg-slate-900 text-slate-400'
                      }`}>
                        #{globalRank}
                      </span>

                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {team.character || '🦁'}
                      </span>
                    </div>

                    {/* Team Name */}
                    <div className="mb-2">
                      <div className="text-xs font-black text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                        {team.teamName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Team #{team.teamNumber}
                      </div>
                    </div>

                    {/* Score & 1-Click Fast Mark Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">Total</div>
                        <div className="text-sm font-black text-amber-400 font-mono">
                          {team.totalScore} pts
                        </div>
                      </div>

                      {/* Fast +QuestionPoints 1-Click Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeamId(team.teamId);
                          updateTeamScore(team.teamId, {
                            delta: currentQuestion?.points || 10,
                            round: gameState.currentRound || 1
                          });
                        }}
                        title={`Award +${currentQuestion?.points || 10} points directly`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-black tracking-wide shadow-sm hover:scale-105 active:scale-95 transition-all"
                      >
                        +{currentQuestion?.points || 10}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for End Game */}
      {showEndGameConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-amber-500/60 bg-slate-900 shadow-2xl">
            <h3 className="text-lg font-black text-amber-400 mb-2">
              🏆 END GAME & CROWN CHAMPIONS?
            </h3>
            <p className="text-sm text-slate-300 mb-3 leading-relaxed">
              This will trigger the Grand Champion celebration on the Smart Board with confetti and winner fanfare.
            </p>

            {/* Celebration Audio Information & Change Button */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-xs truncate max-w-[240px]">
                <Music className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-400">Audio:</span>
                <span className="font-bold text-amber-300 truncate">
                  {settings?.celebrationAudioUrl ? settings.celebrationAudioUrl.split('/').pop() : 'Official Fanfare'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEndGameConfirm(false);
                  setShowCelebrationAudioModal(true);
                }}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline shrink-0"
              >
                Change Audio
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEndGameConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  endGame();
                  setShowEndGameConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black tracking-wider transition-colors shadow-lg shadow-amber-500/20"
              >
                CONFIRM & CELEBRATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for End Round */}
      {showEndRoundConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-amber-500/60 bg-slate-900 shadow-2xl">
            <h3 className="text-lg font-black text-amber-400 mb-2">
              🏆 CONCLUDE ROUND {gameState.currentRound || 1}?
            </h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              This will finish Round {gameState.currentRound || 1} and broadcast the live Leaderboard to the Smart Board for all audience and contestants to see.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEndRoundConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  endRound();
                  setShowEndRoundConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black tracking-wider transition-colors shadow-lg shadow-amber-500/20"
              >
                CONFIRM & SHOW BOARD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Audio Controller Modal */}
      {showCelebrationAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CelebrationAudioController onClose={() => setShowCelebrationAudioModal(false)} />
          </div>
        </div>
      )}

      {/* Modal for Starting a New Game */}
      {showNewGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-cyan-500/50 bg-slate-900 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-cyan-300">
                  START NEW GAME SESSION
                </h3>
                <p className="text-xs text-slate-400">
                  Select reset mode for your symposium tournament
                </p>
              </div>
            </div>

            {/* Reassurance Guarantee Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="leading-snug">
                <strong>SAFE RESET:</strong> All {teams.length} registered teams, participant colleges, and question sets are <strong>100% PRESERVED</strong> and will never be deleted.
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Starting a new game will rewind the tournament back to Round 1 Question 1, lock all clues, and reset the question timer to IDLE.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  startNewGame({ resetScores: true });
                  setShowNewGameModal(false);
                }}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/40 to-slate-900/90 hover:border-emerald-500/60 border border-emerald-500/40 text-left transition-all group flex items-start gap-3 shadow-lg"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30 shrink-0 mt-0.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-300 group-hover:text-emerald-200">
                    FRESH GAME: RESET SCORES ONLY (SCORES TO 0)
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Zeroes all team scores to 0 and begins from Round 1 Question 1. Teams & questions remain untouched.
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  startNewGame({ resetScores: false });
                  setShowNewGameModal(false);
                }}
                className="w-full p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/60 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 shrink-0 mt-0.5">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100 group-hover:text-cyan-300">
                    RESTART QUESTIONS (KEEP CURRENT SCORES)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Restarts to Round 1 Question 1, but keeps all accumulated points and standings intact.
                  </div>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowNewGameModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Selecting Round 2 Qualifiers */}
      {showQualifiersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col p-6 rounded-3xl border border-emerald-500/50 bg-slate-900 shadow-2xl space-y-4 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <Star className="w-5 h-5 fill-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                    <span>SELECT QUALIFIERS FOR ROUND 2</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {selectedQualifierIds.length} SELECTED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pick teams advancing to Round 2. Broadcast directly to Smart Board to celebrate qualifiers.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">PRESETS:</span>
              {[4, 6, 8, 10, 12].map(count => {
                const sorted = [...teams].sort((a, b) => (b.round1Score || b.totalScore || 0) - (a.round1Score || a.totalScore || 0));
                const ids = sorted.slice(0, count).map(t => t.teamId);
                const isSelected = ids.length === selectedQualifierIds.length && ids.every(id => selectedQualifierIds.includes(id));

                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSelectedQualifierIds(ids)}
                    className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    TOP {count}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedQualifierIds(teams.map(t => t.teamId))}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 ml-auto"
              >
                SELECT ALL
              </button>

              <button
                type="button"
                onClick={() => setSelectedQualifierIds([])}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/50"
              >
                CLEAR
              </button>
            </div>

            {/* Scrollable Team List with Checkboxes */}
            <div className="flex-1 overflow-y-auto max-h-80 space-y-2 pr-1 border border-slate-800/80 rounded-2xl p-2 bg-slate-950/60">
              {[...teams]
                .sort((a, b) => (b.round1Score || b.totalScore || 0) - (a.round1Score || a.totalScore || 0))
                .map((team, idx) => {
                  const isChecked = selectedQualifierIds.includes(team.teamId);

                  const toggleCheck = () => {
                    if (isChecked) {
                      setSelectedQualifierIds(selectedQualifierIds.filter(id => id !== team.teamId));
                    } else {
                      setSelectedQualifierIds([...selectedQualifierIds, team.teamId]);
                    }
                  };

                  return (
                    <div
                      key={team.teamId}
                      onClick={toggleCheck}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-slate-100'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 text-emerald-400">
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                        </div>
                        <span className="text-xs font-mono font-black text-amber-400 w-6">
                          #{idx + 1}
                        </span>
                        <span className="text-xl shrink-0">{team.character || '🦁'}</span>
                        <div className="truncate">
                          <span className="font-bold text-xs sm:text-sm text-slate-200">
                            {team.teamName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 ml-1.5">
                            (#{team.teamNumber})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase mr-1">R1:</span>
                          <span className="font-bold text-amber-300">{team.round1Score || 0} pts</span>
                        </div>
                        <div className="hidden sm:block">
                          <span className="text-[10px] text-slate-500 uppercase mr-1">Total:</span>
                          <span className="font-bold text-slate-300">{team.totalScore || 0} pts</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowQualifiersModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                CANCEL
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setQualifiers(selectedQualifierIds, false);
                    setShowQualifiersModal(false);
                    showToast(`Saved ${selectedQualifierIds.length} qualifiers!`, 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                >
                  SAVE SELECTION ONLY
                </button>

                <button
                  onClick={() => {
                    setQualifiers(selectedQualifierIds, true);
                    setShowQualifiersModal(false);
                    showToast(`Broadcasted ${selectedQualifierIds.length} qualifiers to Smart Board!`, 'success');
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>BROADCAST TO SMART BOARD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Display Connection Required */}
      {showDisplayRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-cyan-500/50 bg-slate-900 shadow-2xl space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Monitor className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100">SMART BOARD DISPLAY NOT DETECTED</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                The Connection Game is configured to start only after the Smart Board / Projector Display is live so your audience sees the landing and questions properly.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Step 1: Open Display on projector / TV</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Step 2: Audience sees landing screen & timer</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Step 3: Starting game transitions to Question 1</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  handleLaunchDisplay();
                  setBypassDisplayCheck(true);
                  startGame();
                  setShowDisplayRequiredModal(false);
                  showToast('Smart Board Display launched and Game started!', 'success');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                <span>LAUNCH DISPLAY & START GAME</span>
              </button>

              <button
                onClick={() => {
                  setBypassDisplayCheck(true);
                  startGame();
                  setShowDisplayRequiredModal(false);
                  showToast('Started game in offline/solo test mode.', 'info');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
              >
                BYPASS (SOLO / OFFLINE TEST MODE)
              </button>

              <button
                onClick={() => setShowDisplayRequiredModal(false)}
                className="text-xs text-slate-500 hover:text-slate-400 font-medium py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </HostLayout>
  );
}
