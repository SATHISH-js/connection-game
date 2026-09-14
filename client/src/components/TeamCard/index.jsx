import React from 'react';
import { Users, Award, Plus, Minus } from 'lucide-react';

export default function TeamCard({
  team,
  rank,
  onScoreAdjust,
  onEdit,
  onDelete,
  currentRound = 1,
  showActions = true
}) {
  if (!team) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
              {team.character || '🦁'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                {rank && (
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    #{rank}
                  </span>
                )}
                <h4 className="text-base font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                  {team.teamName}
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Team #{team.teamNumber} • {team.characterName || 'Animal'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-black font-mono text-amber-400">
              {team.totalScore || 0}
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">
              Total Pts
            </span>
          </div>
        </div>

        {/* Member list */}
        {team.members && team.members.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60">
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{team.members.join(', ')}</span>
          </div>
        )}

        {/* Round scores breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 mb-3 text-xs">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">R1</div>
            <div className="font-mono font-bold text-slate-300">{team.round1Score || 0}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">R2</div>
            <div className="font-mono font-bold text-slate-300">{team.round2Score || 0}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Tie</div>
            <div className="font-mono font-bold text-amber-300">{team.tieBreakerScore || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Score Adjustment Buttons */}
      {showActions && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onScoreAdjust && onScoreAdjust(team.teamId, 10, currentRound)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-black font-mono transition-colors"
            >
              +10
            </button>
            <button
              onClick={() => onScoreAdjust && onScoreAdjust(team.teamId, 5, currentRound)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-black font-mono transition-colors"
            >
              +5
            </button>
            <button
              onClick={() => onScoreAdjust && onScoreAdjust(team.teamId, -5, currentRound)}
              className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-black font-mono transition-colors"
            >
              -5
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(team)}
                className="text-[11px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(team.teamId)}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-950/40"
              >
                Del
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
