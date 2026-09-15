import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, Swords, X, Play, Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { audioEngine } from '../services/audioEngine';

export default function RoundAnnouncementOverlay() {
  const { gameState, dismissAnnouncement, startGame } = useGame();
  const [countdown, setCountdown] = useState(5);
  const announcement = gameState.roundAnnouncement;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!announcement) {
      setCountdown(5);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCountdown(5);
    audioEngine.playEffect('countdown');

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        if (next > 0) {
          audioEngine.playEffect('countdown');
          return next;
        } else {
          clearInterval(timerRef.current);
          // When countdown hits 0, auto-start Question 1
          startGame({ round: announcement.round || 1 });
          dismissAnnouncement();
          return 0;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcement?.timestamp]);

  if (!announcement) return null;

  const handleStartImmediately = (e) => {
    e.stopPropagation();
    if (timerRef.current) clearInterval(timerRef.current);
    startGame({ round: announcement.round || 1 });
    dismissAnnouncement();
  };

  return (
    <div
      onClick={dismissAnnouncement}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl cursor-pointer animate-in fade-in zoom-in-95 duration-500"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl p-8 md:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-[#04060c] border-2 border-amber-500/80 shadow-2xl shadow-amber-500/30 text-center select-none"
      >
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/25 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={dismissAnnouncement}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          title="Dismiss Announcement"
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
          {announcement.message || announcement.subtitle || 'Get ready for the connection challenges!'}
        </p>

        {/* 5-Second Animated Auto-Start Countdown Meter */}
        <div className="my-6 p-6 rounded-2xl bg-slate-950/80 border border-amber-500/40 shadow-inner flex flex-col items-center justify-center">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>STARTING QUESTION 1 AUTOMATICALLY IN</span>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <span className="text-6xl sm:text-7xl md:text-8xl font-black font-mono text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse">
              {countdown}s
            </span>
          </div>

          {/* Animated Progress Dots */}
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-500 ${
                  step <= (6 - countdown)
                    ? 'w-8 bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartImmediately}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START IMMEDIATELY</span>
          </button>
          <button
            onClick={dismissAnnouncement}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
