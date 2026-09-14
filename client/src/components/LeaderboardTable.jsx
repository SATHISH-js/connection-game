import React, { useState, useEffect } from 'react';
import { Trophy, ChevronLeft, ChevronRight, Play, Pause, RotateCw } from 'lucide-react';

export default function LeaderboardTable({
  teams = [],
  pageSize = 5,
  autoRotate = true,
  rotationSeconds = 6,
  isHost = false,
  onScoreAdjust = null
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isRotating, setIsRotating] = useState(autoRotate);

  const totalPages = Math.max(1, Math.ceil(teams.length / pageSize));

  // Auto rotation effect
  useEffect(() => {
    if (!isRotating || totalPages <= 1) return;

    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages);
    }, rotationSeconds * 1000);

    return () => clearInterval(interval);
  }, [isRotating, totalPages, rotationSeconds]);

  const startIndex = currentPage * pageSize;
  const currentTeams = teams.slice(startIndex, startIndex + pageSize);

  const getRankBadge = (globalRank) => {
    if (globalRank === 1) return <span className="text-xl md:text-2xl drop-shadow">🥇</span>;
    if (globalRank === 2) return <span className="text-xl md:text-2xl drop-shadow">🥈</span>;
    if (globalRank === 3) return <span className="text-xl md:text-2xl drop-shadow">🥉</span>;
    return <span className="font-mono font-bold text-slate-400 text-sm md:text-base">#{globalRank}</span>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      {/* Table Header Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-wide">
            LIVE SYMPOSIUM LEADERBOARD
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {teams.length} Teams Registered
          </span>
        </div>

        {/* Pagination & Auto-Rotate Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? 'Pause auto rotation' : 'Resume auto rotation'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
              isRotating
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRotating ? `ROTATING (${rotationSeconds}s)` : 'ROTATION PAUSED'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentPage(p => (p - 1 + totalPages) % totalPages)}
              disabled={totalPages <= 1}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-300 px-2 font-mono">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => (p + 1) % totalPages)}
              disabled={totalPages <= 1}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table with Fixed Smart Board Height */}
      <div className={`w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex flex-col ${
        !isHost ? 'max-h-[calc(100vh-175px)]' : ''
      }`}>
        {/* Auto-rotation indicator bar */}
        {isRotating && totalPages > 1 && (
          <div className="w-full bg-slate-950/60 h-1 overflow-hidden">
            <div
              key={currentPage}
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 animate-progress"
              style={{ animationDuration: `${rotationSeconds}s` }}
            />
          </div>
        )}

        <div className="w-full overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-800 bg-slate-950/95 text-[11px] md:text-xs font-black tracking-widest text-slate-400 uppercase backdrop-blur-md">
                <th className="py-3 px-4 text-center w-16">RANK</th>
                <th className="py-3 px-4 w-16 text-center">AVATAR</th>
                <th className="py-3 px-4">TEAM NAME</th>
                <th className="py-3 px-4 text-center hidden sm:table-cell">ROUND 1</th>
                <th className="py-3 px-4 text-center hidden sm:table-cell">ROUND 2</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">TIE BREAKER</th>
                <th className="py-3 px-4 text-center">TOTAL SCORE</th>
                {isHost && <th className="py-3 px-4 text-center">SCORE ACTION</th>}
              </tr>
            </thead>
            <tbody key={currentPage} className="divide-y divide-slate-800/60 text-sm md:text-base font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
              {currentTeams.map((team, idx) => {
                const globalRank = startIndex + idx + 1;
                const isTop3 = globalRank <= 3;

                return (
                  <tr
                    key={team.teamId}
                    className={`transition-colors duration-150 ${
                      globalRank === 1
                        ? 'bg-amber-500/10 hover:bg-amber-500/15'
                        : globalRank === 2
                        ? 'bg-slate-300/5 hover:bg-slate-300/10'
                        : globalRank === 3
                        ? 'bg-amber-700/10 hover:bg-amber-700/15'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(globalRank)}
                      </div>
                    </td>

                    {/* Character Avatar */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-2xl md:text-3xl inline-block transform hover:scale-125 transition-transform">
                        {team.character || '🦁'}
                      </span>
                    </td>

                    {/* Team Name & Members */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-black text-slate-100 tracking-wide text-base md:text-lg flex items-center gap-2">
                          <span>{team.teamName}</span>
                          <span className="text-xs font-mono font-normal text-slate-500">
                            #{team.teamNumber}
                          </span>
                        </div>
                        {team.members && team.members.length > 0 && (
                          <div className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">
                            {team.members.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Round 1 */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-300 hidden sm:table-cell">
                      {team.round1Score || 0}
                    </td>

                    {/* Round 2 */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-300 hidden sm:table-cell">
                      {team.round2Score || 0}
                    </td>

                    {/* Tie Breaker */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-purple-300 hidden md:table-cell">
                      {team.tieBreakerScore || 0}
                    </td>

                    {/* Total Score */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl font-mono font-black text-base md:text-xl ${
                          isTop3
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                            : 'bg-slate-800/80 text-slate-200 border border-slate-700/60'
                        }`}
                      >
                        {team.totalScore || 0}
                      </span>
                    </td>

                    {/* Quick score buttons for Host view */}
                    {isHost && onScoreAdjust && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onScoreAdjust(team.teamId, 10)}
                            className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold text-xs border border-emerald-500/40"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => onScoreAdjust(team.teamId, 5)}
                            className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs border border-emerald-500/30"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => onScoreAdjust(team.teamId, -5)}
                            className="px-2 py-0.5 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-bold text-xs border border-rose-500/30"
                          >
                            -5
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
