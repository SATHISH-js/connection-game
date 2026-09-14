import React, { useState } from 'react';
import { Trophy, Award, Monitor, Play, RotateCw } from 'lucide-react';
import HostLayout from '../components/HostLayout';
import LeaderboardTable from '../components/LeaderboardTable';
import Podium from '../components/Podium';
import { useGame } from '../context/GameContext';

export default function LeaderboardPage() {
  const { teams, updateTeamScore, toggleLeaderboard, togglePodium, gameState, triggerAudioEffect } = useGame();
  const [showPodiumPreview, setShowPodiumPreview] = useState(false);

  return (
    <HostLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
              <Trophy className="w-7 h-7 text-amber-400" />
              <span>LIVE SYMPOSIUM LEADERBOARD</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Real-time sorted rankings across all rounds. Control Smart Board projection and view top 3 podium.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerAudioEffect('leaderboard');
                toggleLeaderboard();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider border transition-all ${
                gameState.leaderboardVisible
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>{gameState.leaderboardVisible ? 'BROADCASTING ON DISPLAY' : 'PROJECT TO SMART BOARD'}</span>
            </button>

            <button
              onClick={() => setShowPodiumPreview(!showPodiumPreview)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-black hover:bg-purple-600/40 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>{showPodiumPreview ? 'HIDE PODIUM PREVIEW' : 'TOP 3 PODIUM PREVIEW'}</span>
            </button>
          </div>
        </div>

        {/* Podium Preview Section if toggled */}
        {showPodiumPreview && (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl">
            <Podium teams={teams} />
          </div>
        )}

        {/* Host Leaderboard Table with quick score buttons */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <LeaderboardTable
            teams={teams}
            pageSize={10}
            autoRotate={true}
            rotationSeconds={6}
            isHost={true}
            onScoreAdjust={(teamId, delta) => updateTeamScore(teamId, { delta, round: gameState.currentRound || 1 })}
          />
        </div>
      </div>
    </HostLayout>
  );
}
