import React from 'react';
import { Trophy, Award, Sparkles } from 'lucide-react';

export default function Podium({ teams = [] }) {
  const sorted = [...teams].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  const first = sorted[0] || { teamName: 'First Place', character: '🥇', totalScore: 0 };
  const second = sorted[1] || { teamName: 'Second Place', character: '🥈', totalScore: 0 };
  const third = sorted[2] || { teamName: 'Third Place', character: '🥉', totalScore: 0 };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none animate-scale-up">
      {/* Header Trophy Banner */}
      <div className="flex items-center gap-2 mb-8">
        <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
        <h2 className="text-2xl md:text-4xl font-black text-center tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 drop-shadow">
          TOP 3 CHAMPIONS PODIUM
        </h2>
        <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
      </div>

      {/* 3D Stepped Pillars */}
      <div className="w-full grid grid-cols-3 gap-3 md:gap-6 items-end">
        {/* 2nd Place Pillar */}
        <div className="flex flex-col items-center">
          {/* Avatar & Info */}
          <div className="mb-3 text-center flex flex-col items-center">
            <span className="text-4xl md:text-6xl mb-1 transform hover:scale-110 transition-transform">
              {second.character || '🐯'}
            </span>
            <span className="text-sm md:text-lg font-black text-slate-200 truncate max-w-[120px] md:max-w-[180px]">
              {second.teamName}
            </span>
            {second.collegeName && (
              <span className="text-[10px] md:text-xs text-cyan-400 font-medium truncate max-w-[120px] md:max-w-[180px]">
                🎓 {second.collegeName}
              </span>
            )}
            <span className="font-mono font-bold text-slate-400 text-xs md:text-sm">
              {second.totalScore || 0} PTS
            </span>
          </div>

          {/* Pedestal */}
          <div className="w-full h-40 md:h-52 rounded-t-2xl border-t-2 border-x-2 border-slate-400/60 bg-gradient-to-b from-slate-400/20 via-slate-600/10 to-transparent backdrop-blur-lg flex flex-col items-center justify-start pt-4 shadow-xl">
            <span className="text-3xl md:text-5xl font-black text-slate-300 drop-shadow">
              🥈
            </span>
            <span className="text-xs md:text-sm font-black tracking-widest text-slate-300 mt-2 uppercase">
              2ND PLACE
            </span>
          </div>
        </div>

        {/* 1st Place Pillar (Tallest, Middle) */}
        <div className="flex flex-col items-center">
          {/* Champion Crown / Trophy */}
          <div className="mb-4 text-center flex flex-col items-center relative">
            <div className="absolute -top-7 text-amber-400 animate-bounce">
              👑
            </div>
            <span className="text-5xl md:text-7xl mb-1 transform scale-110 hover:scale-125 transition-transform drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              {first.character || '🦁'}
            </span>
            <span className="text-base md:text-2xl font-black text-amber-300 truncate max-w-[140px] md:max-w-[220px]">
              {first.teamName}
            </span>
            {first.collegeName && (
              <span className="text-xs md:text-sm text-amber-200/90 font-medium truncate max-w-[140px] md:max-w-[220px]">
                🎓 {first.collegeName}
              </span>
            )}
            <span className="font-mono font-black text-amber-400 text-sm md:text-lg">
              {first.totalScore || 0} PTS
            </span>
          </div>

          {/* Pedestal */}
          <div className="w-full h-52 md:h-68 rounded-t-2xl border-t-4 border-x-2 border-amber-400/80 bg-gradient-to-b from-amber-500/30 via-yellow-500/10 to-transparent backdrop-blur-xl flex flex-col items-center justify-start pt-6 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            <span className="text-4xl md:text-6xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
              🥇
            </span>
            <span className="text-sm md:text-base font-black tracking-widest text-amber-300 mt-2 uppercase">
              CHAMPION
            </span>
          </div>
        </div>

        {/* 3rd Place Pillar */}
        <div className="flex flex-col items-center">
          {/* Avatar & Info */}
          <div className="mb-3 text-center flex flex-col items-center">
            <span className="text-4xl md:text-6xl mb-1 transform hover:scale-110 transition-transform">
              {third.character || '🦅'}
            </span>
            <span className="text-sm md:text-lg font-black text-slate-200 truncate max-w-[120px] md:max-w-[180px]">
              {third.teamName}
            </span>
            {third.collegeName && (
              <span className="text-[10px] md:text-xs text-amber-400/80 font-medium truncate max-w-[120px] md:max-w-[180px]">
                🎓 {third.collegeName}
              </span>
            )}
            <span className="font-mono font-bold text-slate-400 text-xs md:text-sm">
              {third.totalScore || 0} PTS
            </span>
          </div>

          {/* Pedestal */}
          <div className="w-full h-32 md:h-44 rounded-t-2xl border-t-2 border-x-2 border-amber-700/60 bg-gradient-to-b from-amber-700/25 via-amber-900/10 to-transparent backdrop-blur-lg flex flex-col items-center justify-start pt-3 shadow-xl">
            <span className="text-3xl md:text-5xl font-black text-amber-600 drop-shadow">
              🥉
            </span>
            <span className="text-xs md:text-sm font-black tracking-widest text-amber-600 mt-2 uppercase">
              3RD PLACE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
