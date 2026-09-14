import React from 'react';
import { Timer, AlertCircle, CheckCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function TimerDisplay({ compact = false }) {
  const { timerRemaining, gameState } = useGame();

  const isAnswerRevealed = gameState.answerRevealed === true;
  const isStopped = gameState.timer?.status === 'STOPPED' || isAnswerRevealed;
  const isRunning = gameState.timer?.status === 'RUNNING' && !isStopped;
  const isPaused = gameState.timer?.status === 'PAUSED';
  const isFinished = (gameState.timer?.status === 'FINISHED' || timerRemaining <= 0) && !isStopped;
  const isWarning = timerRemaining <= 10 && timerRemaining > 0 && isRunning;

  // Format as MM:SS
  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-sm transition-all ${
        isStopped
          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
          : isFinished
          ? 'bg-rose-950/40 border-rose-500/60 text-rose-400'
          : isWarning
          ? 'bg-amber-950/40 border-amber-500/70 text-amber-300 animate-pulse'
          : isRunning
          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
          : 'bg-slate-900/40 border-slate-800 text-slate-400'
      }`}>
        <Timer className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        <span className="font-mono font-black text-lg tracking-wider">
          {isStopped ? "STOPPED" : isFinished ? "TIME'S UP" : formattedTime}
        </span>
        {isStopped && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            REVEALED
          </span>
        )}
        {isPaused && !isStopped && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
            PAUSED
          </span>
        )}
      </div>
    );
  }

  // Large Smart Board Presentation Mode
  return (
    <div className="flex flex-col items-center justify-center select-none shrink-0">
      <div
        className={`relative flex items-center justify-center px-6 sm:px-8 py-1.5 sm:py-2.5 rounded-2xl border-2 transition-all duration-300 backdrop-blur-xl shadow-2xl ${
          isStopped
            ? 'bg-emerald-950/80 border-emerald-500/70 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
            : isFinished
            ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.5)] scale-105'
            : isWarning
            ? 'bg-amber-950/70 border-amber-500 shadow-[0_0_45px_rgba(245,158,11,0.6)] animate-pulse'
            : isRunning
            ? 'bg-slate-900/90 border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
            : 'bg-slate-900/70 border-slate-800 shadow-xl'
        }`}
      >
        {isStopped ? (
          <div className="flex items-center gap-2.5 text-emerald-300">
            <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
            <span className="font-black text-xl md:text-2xl lg:text-3xl tracking-widest uppercase">
              TIMER STOPPED
            </span>
          </div>
        ) : isFinished ? (
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 animate-bounce" />
            <span className="font-black text-2xl md:text-4xl lg:text-5xl tracking-widest uppercase animate-pulse">
              TIME'S UP!
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter ${
                isWarning
                  ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                  : isRunning
                  ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'text-slate-300'
              }`}
            >
              {formattedTime}
            </span>
            {isPaused && (
              <span className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PAUSED
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
