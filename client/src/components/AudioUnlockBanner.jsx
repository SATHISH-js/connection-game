import React from 'react';
import { Volume2, VolumeX, AlertTriangle, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function AudioUnlockBanner() {
  const { audioUnlocked, unlockAudio } = useGame();

  if (audioUnlocked) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-600/90 via-amber-500/95 to-amber-600/90 text-slate-950 px-4 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 z-30 animate-pulse-fast">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-slate-950/20 text-slate-950">
          <VolumeX className="w-5 h-5" />
        </div>
        <div>
          <div className="font-black text-sm md:text-base tracking-wide flex items-center gap-1.5">
            <span>AUDIO SETUP REQUIRED FOR SMART BOARD</span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-950 text-amber-300">
              ACTION NEEDED
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-900 opacity-90">
            Browser autoplay policies require one click to activate sound effects, chimes, and spoken answers.
          </div>
        </div>
      </div>

      <button
        onClick={unlockAudio}
        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-sm shadow-lg shadow-black/30 border border-amber-400/40 hover:scale-105 active:scale-95 transition-all"
      >
        <Volume2 className="w-4 h-4" />
        <span>ENABLE GAME AUDIO</span>
      </button>
    </div>
  );
}
