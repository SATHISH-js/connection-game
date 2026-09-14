import React from 'react';
import { Volume2, Award, Sparkles, CheckCircle, X } from 'lucide-react';

export default function AnswerReveal({ isRevealed, answerText, points = 10, audioType = 'tts', onDismiss }) {
  if (!isRevealed) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl p-8 md:p-12 rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 shadow-[0_0_80px_rgba(245,158,11,0.35)] flex flex-col items-center text-center animate-scale-up"
      >
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
            title="Dismiss Answer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 bg-amber-500/20 blur-3xl rounded-full"></div>

        {/* Header Badge */}
        <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-sm md:text-base font-black tracking-widest uppercase mb-6 shadow-inner">
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          <span>OFFICIAL CONNECTION ANSWER</span>
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Hero Answer Typography */}
        <div className="my-6">
          <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]">
            {answerText || 'CONNECTION FOUND!'}
          </div>
        </div>

        {/* Audio / Voice Indicator */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-cyan-300 text-sm font-semibold mb-6">
          <Volume2 className="w-4 h-4 animate-pulse text-cyan-400" />
          <span>
            {audioType === 'upload' ? 'Playing Uploaded Audio...' : audioType === 'both' ? 'Playing Audio & Speech...' : 'Audio Announcement Active'}
          </span>
          <div className="flex items-center gap-0.5 ml-1">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
            <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></span>
          </div>
        </div>

        {/* Points Award Badge */}
        <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-extrabold text-lg md:text-xl shadow-lg shadow-emerald-950/40">
          <Award className="w-6 h-6 text-emerald-400" />
          <span>+{points} POINTS AWARDED</span>
        </div>
      </div>
    </div>
  );
}
