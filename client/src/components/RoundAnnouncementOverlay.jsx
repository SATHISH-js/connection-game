import React, { useEffect } from 'react';
import { Sparkles, Trophy, Swords, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function RoundAnnouncementOverlay() {
  const { gameState, dismissAnnouncement } = useGame();

  const announcement = gameState.roundAnnouncement;
  if (!announcement) return null;

  return (
    <div
      onClick={dismissAnnouncement}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md cursor-pointer animate-in fade-in zoom-in-95 duration-500"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl p-8 md:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-[#04060c] border-2 border-amber-500/80 shadow-2xl shadow-amber-500/30 text-center select-none"
      >
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={dismissAnnouncement}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase mb-4 shadow-lg shadow-amber-500/20 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>OFFICIAL ROUND ANNOUNCEMENT</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-100 tracking-tight uppercase mb-3 drop-shadow-2xl">
          {announcement.title || `ROUND ${announcement.round || 1} COMMENCING`}
        </h2>

        {/* Subtitle / Rules hint */}
        <p className="text-base sm:text-xl font-extrabold text-amber-400 font-mono tracking-wide mb-6">
          {announcement.subtitle || 'Get ready for the next connection challenge!'}
        </p>

        {/* Action instruction */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <span>Click anywhere to dismiss</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </div>
      </div>
    </div>
  );
}
