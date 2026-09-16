import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
  Trophy,
  Award,
  Timer,
  Clock,
  Eye,
  GraduationCap,
  Star,
  CheckCircle,
  GripHorizontal,
  Music,
  Scaling,
  X
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { parseClueItem } from './QuestionCard';

const PRESET_SIZES = {
  S: { width: 320, height: 220 },
  M: { width: 420, height: 285 },
  L: { width: 560, height: 380 },
  XL: { width: 700, height: 460 }
};

export default function DisplayMiniPreview() {
  const {
    gameState,
    settings,
    currentQuestion,
    teams,
    timerRemaining,
    displayCount,
    celebrationAudioEvent,
    showMiniPreview,
    setMiniPreviewOpen
  } = useGame();

  const [isMinimized, setIsMinimized] = useState(false);
  const isOpen = !!showMiniPreview;
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const [sizePreset, setSizePreset] = useState(() => {
    return localStorage.getItem('smartboard_preview_preset') || 'M';
  });

  const [customSize, setCustomSize] = useState(() => {
    try {
      const saved = localStorage.getItem('smartboard_preview_size');
      return saved ? JSON.parse(saved) : PRESET_SIZES.M;
    } catch {
      return PRESET_SIZES.M;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartboard_preview_size', JSON.stringify(customSize));
      localStorage.setItem('smartboard_preview_preset', sizePreset);
    } catch {}
  }, [customSize, sizePreset]);

  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ startX: 0, startY: 0, startW: 0, startH: 0 });
  const containerRef = useRef(null);

  // Apply size preset
  const applySizePreset = (presetKey) => {
    if (PRESET_SIZES[presetKey]) {
      setCustomSize(PRESET_SIZES[presetKey]);
      setSizePreset(presetKey);
    }
  };

  // Clamping within window boundaries on drag
  const handlePointerDown = (e) => {
    // Ignore button clicks
    if (e.target.closest('button')) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX: rect.left,
      posY: rect.top
    };

    setIsDragging(true);

    const onPointerMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - dragStartRef.current.pointerX;
      const deltaY = moveEvt.clientY - dragStartRef.current.pointerY;
      const width = rect.width;
      const height = rect.height;
      const maxX = Math.max(0, window.innerWidth - width - 10);
      const maxY = Math.max(0, window.innerHeight - height - 10);

      const clampedX = Math.min(Math.max(10, dragStartRef.current.posX + deltaX), maxX);
      const clampedY = Math.min(Math.max(10, dragStartRef.current.posY + deltaY), maxY);

      setPosition({ x: clampedX, y: clampedY });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Corner Drag-to-Resize Handler
  const handleResizePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height
    };

    setIsResizing(true);

    const onResizeMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - resizeStartRef.current.startX;
      const deltaY = moveEvt.clientY - resizeStartRef.current.startY;
      const newW = Math.max(280, Math.min(window.innerWidth - 20, resizeStartRef.current.startW + deltaX));
      const newH = Math.max(180, Math.min(window.innerHeight - 20, resizeStartRef.current.startH + deltaY));
      setCustomSize({ width: Math.round(newW), height: Math.round(newH) });
      setSizePreset('custom');
    };

    const onResizeUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onResizeMove);
      window.removeEventListener('pointerup', onResizeUp);
    };

    window.addEventListener('pointermove', onResizeMove);
    window.addEventListener('pointerup', onResizeUp);
  };

  if (!isOpen) {
    return null;
  }

  const isCelebrationView = gameState.gameStatus === 'FINISHED';
  const isLandingView = !isCelebrationView && (gameState.stageView === 'landing' || gameState.landingVisible);
  const isQualifiersView = !isCelebrationView && (gameState.stageView === 'qualifiers' || gameState.qualifiersVisible);
  const isLeaderboardView = !isCelebrationView && (gameState.stageView === 'leaderboard' || (gameState.leaderboardVisible && !isLandingView && !isQualifiersView));
  const isPodiumView = !isCelebrationView && (gameState.stageView === 'podium' || (gameState.podiumVisible && !gameState.leaderboardVisible && !isLandingView && !isQualifiersView));

  const activeStageLabel = isCelebrationView
    ? '🏆 WINNERS CELEBRATION'
    : isLandingView
    ? 'LANDING SCREEN'
    : isQualifiersView
    ? 'R2 QUALIFIERS'
    : isLeaderboardView
    ? 'LEADERBOARD'
    : isPodiumView
    ? 'TOP 3 PODIUM'
    : `ROUND ${gameState.currentRound || 1} QUESTION`;

  const parsedClues = (currentQuestion?.clues || []).map(parseClueItem);

  const sortedTeams = [...teams].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  const champion = sortedTeams[0];
  const runnerUp = sortedTeams[1];
  const thirdPlace = sortedTeams[2];

  const currentWidth = isMinimized ? 290 : customSize.width;
  const currentHeight = isMinimized ? 52 : customSize.height;

  const containerStyle = {
    ...(position
      ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' }
      : { right: '16px', bottom: '16px' }),
    width: `${currentWidth}px`,
    height: `${currentHeight}px`
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={`fixed z-40 rounded-2xl border-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col select-none transition-shadow ${
        isDragging || isResizing
          ? 'ring-2 ring-cyan-400 shadow-cyan-500/30'
          : 'ring-1 ring-black/80'
      } ${
        displayCount > 0
          ? 'border-cyan-500/70 bg-gradient-to-b from-[#181e2b] via-[#0d121c] to-[#080a10]'
          : 'border-amber-500/60 bg-gradient-to-b from-[#1d1b16] via-[#12110e] to-[#0a0907]'
      }`}
    >
      {/* TV Frame Top Bezel / Draggable Titlebar */}
      <div
        onPointerDown={handlePointerDown}
        className={`flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 text-xs shrink-0 rounded-t-xl ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Click & Drag to reposition Smart Board preview anywhere on screen"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Grip Icon */}
          <GripHorizontal className="w-4 h-4 text-slate-500 shrink-0 hover:text-cyan-400 transition-colors" />

          {/* Realistic Power Status LED */}
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              displayCount > 0
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            }`}
            title={displayCount > 0 ? 'Smart Board Display Connected & Live' : 'Waiting for Display connection'}
          />

          <span className="font-black text-slate-100 tracking-wider text-[11px] truncate">
            SMART BOARD
          </span>

          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 shrink-0">
            {activeStageLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {/* Size Preset Buttons */}
          {!isMinimized && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 mr-1">
              {['S', 'M', 'L', 'XL'].map((p) => (
                <button
                  key={p}
                  onClick={() => applySizePreset(p)}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                    sizePreset === p
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Resize to ${p} (${PRESET_SIZES[p].width}x${PRESET_SIZES[p].height})`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              const w = window.open(
                '/display',
                'SmartBoardDisplay',
                'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
              );
              if (w) w.focus();
            }}
            title="Open Fullscreen Display in New Window"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand TV Screen' : 'Minimize to Bezel'}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setMiniPreviewOpen(false)}
            title="Close Preview Window"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Body */}
      {!isMinimized && (
        <div className="flex-1 m-1 rounded-lg border border-slate-800/80 p-2.5 overflow-hidden flex flex-col justify-between text-slate-100 relative bg-[#04060b] shadow-inner">
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-t-lg" />
          {/* Active Round Announcement Banner if active */}
          {gameState.roundAnnouncement && (
            <div className="absolute inset-0 z-30 bg-black/90 p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black uppercase text-amber-400 animate-bounce">
                📢 ROUND ANNOUNCEMENT
              </span>
              <div className="text-sm font-black text-slate-100">
                {gameState.roundAnnouncement.title}
              </div>
            </div>
          )}

          {/* VIEW 0: Grand Championship Celebration Live Mirror */}
          {isCelebrationView && (
            <div className="h-full flex flex-col justify-between items-center text-center p-2 bg-gradient-to-b from-amber-950/40 via-purple-950/30 to-slate-950 rounded-lg relative overflow-hidden">
              <div className="flex items-center justify-between w-full pb-1 border-b border-amber-500/30">
                <span className="text-[10px] font-black tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>🏆 GRAND CELEBRATION</span>
                </span>
                {celebrationAudioEvent?.action === 'play' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 animate-pulse">
                    <Music className="w-2.5 h-2.5" /> MUSIC ON
                  </span>
                )}
              </div>

              <div className="my-auto flex flex-col items-center py-1">
                <div className="text-3xl sm:text-4xl animate-bounce mb-1">
                  {champion?.character || '🦁'}
                </div>
                <div className="text-sm sm:text-base font-black text-amber-300 truncate max-w-[280px]">
                  {champion?.teamName || 'Champion Team'}
                </div>
                {champion?.collegeName && (
                  <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1 truncate max-w-[260px] mt-0.5">
                    <GraduationCap className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{champion.collegeName}</span>
                  </div>
                )}
                <div className="text-xs font-black text-amber-400 font-mono mt-1">
                  👑 1ST PLACE • {champion?.totalScore || 0} PTS
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800 text-[9px]">
                <div className="p-1 rounded bg-slate-900/80 border border-slate-800 truncate text-left">
                  <span className="text-slate-400">🥈 2nd:</span> <span className="font-bold text-slate-200">{runnerUp?.teamName || 'Runner Up'}</span>
                </div>
                <div className="p-1 rounded bg-slate-900/80 border border-slate-800 truncate text-left">
                  <span className="text-slate-400">🥉 3rd:</span> <span className="font-bold text-slate-200">{thirdPlace?.teamName || 'Third Place'}</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 1: Landing Page Mini */}
          {isLandingView && (
            <div className="h-full flex flex-col justify-between items-center text-center p-1">
              <div className="w-full">
                <div className="text-[9px] font-black text-amber-400 uppercase truncate">
                  {settings.collegeName || 'COLLEGE NAME'}
                </div>
                <div className="text-[8px] text-slate-400 uppercase truncate">
                  {settings.departmentName || 'DEPARTMENT'}
                </div>
              </div>

              <div className="my-auto">
                <div className="text-base font-black text-slate-100 tracking-wider">
                  {settings.eventName || 'CONNECTION GAME'}
                </div>
                <div className="text-[9px] font-mono text-cyan-300 font-bold mt-1">
                  {settings.landingCountdownActive ? '⏳ COUNTDOWN RUNNING' : 'STANDBY MODE'}
                </div>
              </div>

              <div className="text-[8px] text-slate-500 font-mono">
                {settings.gameRules?.length || 0} Competition Rules on Board
              </div>
            </div>
          )}

          {/* VIEW 2: Round 2 Qualifiers Mini */}
          {isQualifiersView && (
            <div className="h-full flex flex-col justify-between items-center text-center p-1">
              <div className="text-[10px] font-black text-amber-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>ROUND 2 QUALIFIERS</span>
              </div>

              <div className="grid grid-cols-4 gap-1 w-full my-auto">
                {(gameState.qualifiedTeams || []).slice(0, 8).map((tId, idx) => {
                  const t = teams.find((x) => x.teamId === tId);
                  return (
                    <div
                      key={idx}
                      className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] text-center truncate"
                    >
                      <span>{t?.character || '🦁'}</span>
                      <div className="truncate font-bold text-slate-200">{t?.teamName || `T#${idx + 1}`}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[9px] font-mono text-slate-400">
                {(gameState.qualifiedTeams || []).length} Teams Advanced
              </div>
            </div>
          )}

          {/* VIEW 3: Leaderboard Mini */}
          {isLeaderboardView && (
            <div className="h-full flex flex-col justify-between p-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 border-b border-slate-800 pb-1">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>LEADERBOARD</span>
                </span>
                <span className="text-[9px] font-mono text-slate-400">5 Teams / Page</span>
              </div>

              <div className="space-y-1 my-1">
                {teams.slice(0, 4).map((t, idx) => (
                  <div
                    key={t.teamId}
                    className="flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
                  >
                    <span className="font-mono text-amber-400 w-4">#{idx + 1}</span>
                    <span className="truncate flex-1 font-bold text-slate-200">
                      {t.character} {t.teamName}
                    </span>
                    <span className="font-mono font-bold text-amber-300">{t.totalScore} pts</span>
                  </div>
                ))}
              </div>

              <div className="text-[8px] font-mono text-slate-500 text-center">
                Auto-rotating across {teams.length} teams
              </div>
            </div>
          )}

          {/* VIEW 4: Podium Mini */}
          {isPodiumView && (
            <div className="h-full flex flex-col justify-between items-center text-center p-1">
              <div className="text-[10px] font-black text-amber-400 flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>TOP 3 PODIUM</span>
              </div>

              <div className="flex items-end justify-center gap-2 my-auto">
                <div className="text-[9px] text-center">
                  <div>🥈</div>
                  <div className="truncate w-14 font-bold text-slate-300">{teams[1]?.teamName || '2nd'}</div>
                </div>
                <div className="text-[10px] text-center pb-2">
                  <div className="text-lg">🥇</div>
                  <div className="truncate w-16 font-black text-amber-400">{teams[0]?.teamName || '1st'}</div>
                </div>
                <div className="text-[9px] text-center">
                  <div>🥉</div>
                  <div className="truncate w-14 font-bold text-slate-400">{teams[2]?.teamName || '3rd'}</div>
                </div>
              </div>

              <div className="text-[8px] text-slate-400 font-mono">Championship Standings</div>
            </div>
          )}

          {/* VIEW 5: Question & Clues Mini */}
          {!isLandingView && !isQualifiersView && !isLeaderboardView && !isPodiumView && (
            <div className="h-full flex flex-col justify-between p-1">
              <div className="flex items-center justify-between text-[10px] pb-1 border-b border-slate-800">
                <span className="font-black text-amber-400 truncate">
                  R{Number(gameState.currentRound) || 1} • Q{(Number(gameState.currentQuestionIndex) || 0) + 1}/{totalQuestions || 1}
                </span>
                <span className="font-mono font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/40">
                  ⏱ {timerRemaining}s
                </span>
              </div>

              {/* Clues row */}
              <div className="my-auto py-1">
                <div className="text-[10px] font-bold text-slate-200 truncate mb-1">
                  {currentQuestion?.title || 'Waiting for Question...'}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {parsedClues.map((c, i) => {
                    const isRev =
                      gameState.currentRound !== 2 ||
                      i < (gameState.revealedCluesCount !== undefined ? gameState.revealedCluesCount : 1);
                    return (
                      <div
                        key={i}
                        className={`h-9 rounded flex items-center justify-center text-[10px] font-mono font-bold border ${
                          isRev
                            ? 'bg-slate-900 border-amber-500/50 text-amber-300'
                            : 'bg-purple-950/40 border-purple-800/40 text-purple-400'
                        }`}
                      >
                        {isRev ? c.emoji || `#${i + 1}` : '🔒'}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Answer Banner if revealed */}
              {gameState.answerRevealed ? (
                <div className="p-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-300 text-center truncate">
                  ✨ ANSWER: {currentQuestion?.answerText}
                </div>
              ) : (
                <div className="text-[8px] text-slate-500 font-mono text-center">
                  Answer hidden on Smart Board
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Realistic TV Bottom Chin / Bezel with Resize Handle */}
      {!isMinimized && (
        <div className="px-3 py-1 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400 shrink-0 rounded-b-xl select-none">
          <div className="flex items-center gap-2">
            <span className="tracking-wider">IFP 4K • {customSize.width}×{customSize.height}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              LIVE MIRROR
            </span>

            {/* Corner Drag-to-Resize Handle */}
            <div
              onPointerDown={handleResizePointerDown}
              className="cursor-se-resize flex items-center p-0.5 text-slate-500 hover:text-cyan-400 active:text-cyan-300 transition-colors"
              title="Drag this corner to freely resize preview window"
            >
              <Scaling className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
