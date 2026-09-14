import React from 'react';
import { Trophy, Award, Sparkles, Star, ChevronRight } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function RoundQualifiersScreen() {
  const { gameState, teams } = useGame();

  const qualifiedTeamIds = gameState.qualifiedTeams || [];

  // Find the team objects in order
  const qualifiedTeams = teams.filter(t => qualifiedTeamIds.includes(t.teamId));

  return (
    <div className="w-full h-full flex flex-col justify-between items-center text-center px-4 md:px-10 py-6 select-none animate-in zoom-in-95 duration-700">
      {/* Top Celebratory Header */}
      <div className="max-w-4xl space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase shadow-lg shadow-amber-500/10 animate-bounce">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>ROUND 1 CONCLUDED • OFFICIAL RESULTS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-100 tracking-tight uppercase drop-shadow-2xl">
          🎉 CONGRATULATIONS QUALIFIERS! 🎉
        </h1>

        <p className="text-sm sm:text-base md:text-lg font-bold text-amber-400 tracking-wide">
          The following {qualifiedTeams.length} teams have officially qualified for <span className="underline decoration-amber-500 decoration-2">ROUND 2: STEP-BY-STEP CONNECTION</span>
        </p>

        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
      </div>

      {/* Grid of Qualified Teams */}
      <div className="w-full max-w-6xl my-auto py-4">
        {qualifiedTeams.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-pulse" />
            <div className="text-lg font-bold">Host is selecting qualifying teams...</div>
          </div>
        ) : (
          <div className={`grid gap-3 sm:gap-4 ${
            qualifiedTeams.length <= 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : qualifiedTeams.length <= 6
              ? 'grid-cols-2 sm:grid-cols-3'
              : qualifiedTeams.length <= 8
              ? 'grid-cols-2 sm:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
          }`}>
            {qualifiedTeams.map((team, idx) => (
              <div
                key={team.teamId}
                className="relative p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-amber-500/50 hover:border-amber-400 shadow-xl shadow-amber-500/10 flex flex-col items-center justify-between group hover:scale-105 transition-all duration-300"
              >
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-amber-500/5 rounded-2xl pointer-events-none" />

                {/* Qualify Rank Pill */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    QUALIFIED #{idx + 1}
                  </span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                </div>

                {/* Team Avatar */}
                <div className="text-4xl sm:text-5xl my-2 transform group-hover:scale-110 transition-transform">
                  {team.character || '🦁'}
                </div>

                {/* Team Name */}
                <div className="text-center w-full">
                  <div className="font-black text-sm sm:text-base text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                    {team.teamName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Team #{team.teamNumber}
                  </div>
                </div>

                {/* Score */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">R1 Score:</span>
                  <span className="font-black text-amber-400 text-sm">
                    {team.round1Score || team.totalScore || 0} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="w-full max-w-4xl">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs sm:text-sm font-bold text-slate-300">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Round 2 will begin with sequential clue unlocking. Best of luck teams!</span>
        </div>
      </div>
    </div>
  );
}
