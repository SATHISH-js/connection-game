import React, { useState, useEffect } from 'react';
import { Swords, AlertCircle, Play, Trophy, CheckCircle, RefreshCw, Timer, Award } from 'lucide-react';
import HostLayout from '../components/HostLayout';
import { useGame } from '../context/GameContext';

export default function TieBreakerPage() {
  const {
    teams,
    gameState,
    setRound,
    startTimer,
    selectTieBreakerTeams,
    updateTeamScore,
    triggerAudioEffect,
    showToast
  } = useGame();

  const [detectedTies, setDetectedTies] = useState([]);
  const [selectedTeamsForMatch, setSelectedTeamsForMatch] = useState([]);

  // Detect ties among top teams
  useEffect(() => {
    if (teams.length >= 2) {
      const topScore = teams[0]?.totalScore || 0;
      const tied = teams.filter(t => t.totalScore === topScore && topScore > 0);
      setDetectedTies(tied);

      // Pre-select tied teams if not already chosen
      if (tied.length >= 2 && selectedTeamsForMatch.length === 0) {
        setSelectedTeamsForMatch(tied.map(t => t.teamId));
      }
    }
  }, [teams, selectedTeamsForMatch.length]);

  const toggleTeamSelection = (teamId) => {
    if (selectedTeamsForMatch.includes(teamId)) {
      setSelectedTeamsForMatch(prev => prev.filter(id => id !== teamId));
    } else {
      setSelectedTeamsForMatch(prev => [...prev, teamId]);
    }
  };

  const handleLaunchTieBreaker = () => {
    if (selectedTeamsForMatch.length < 2) {
      showToast('Please select at least 2 teams for the tie-breaker.', 'warning');
      return;
    }

    selectTieBreakerTeams(selectedTeamsForMatch);
    setRound(3);
    triggerAudioEffect('tie-breaker');
    showToast('TIE BREAKER ROUND 3 ACTIVATED ON SMART BOARD!', 'success');
  };

  const activeTeams = teams.filter(t => selectedTeamsForMatch.includes(t.teamId));

  return (
    <HostLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-widest mb-2">
              <Swords className="w-3.5 h-3.5" />
              <span>ROUND 3 SPECIAL ARENA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
              <span>TIE BREAKER CONTROL CENTER</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Resolve equal scores from Round 1 & 2. Launch high-stakes sudden-death questions for tied contenders.
            </p>
          </div>

          <button
            onClick={handleLaunchTieBreaker}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm tracking-wider shadow-xl shadow-rose-600/30 transition-all hover:scale-105"
          >
            <Swords className="w-4 h-4" />
            <span>START TIE BREAKER ROUND</span>
          </button>
        </div>

        {/* Tie Detection Alert Card */}
        {detectedTies.length >= 2 ? (
          <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-amber-500/30">
                ⚖️
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-300">
                  TIE DETECTED FOR 1ST PLACE ({detectedTies[0]?.totalScore} PTS)
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  {detectedTies.map(t => `${t.character} ${t.teamName}`).join(' & ')} share the top score!
                </p>
              </div>
            </div>

            <button
              onClick={handleLaunchTieBreaker}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-500/20"
            >
              LAUNCH TIE-BREAKER NOW
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Scores currently have a single clear leader. You can still manually select teams below if desired.</span>
          </div>
        )}

        {/* Selected Tie Contenders Arena Box */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="text-xs font-black tracking-widest text-slate-400 uppercase">
              ACTIVE TIE-BREAKER CONTENDERS ({activeTeams.length})
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Select/deselect teams below
            </span>
          </div>

          {activeTeams.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">
              No teams selected for the tie-breaker. Select at least 2 teams below.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTeams.map(team => (
                <div
                  key={team.teamId}
                  className="p-5 rounded-2xl bg-slate-950/80 border-2 border-rose-500/40 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{team.character || '🦁'}</span>
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 font-mono font-black text-rose-300 text-sm">
                        {team.totalScore} PTS
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-slate-100 mb-1">{team.teamName}</h4>
                    <div className="text-xs text-slate-400 mb-3">
                      Tie Breaker Score: <span className="text-purple-400 font-mono font-bold">+{team.tieBreakerScore || 0}</span>
                    </div>
                  </div>

                  {/* Quick Tie Score Modifier */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1">
                    <button
                      onClick={() => updateTeamScore(team.teamId, { delta: 15, round: 3 })}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-black text-xs border border-emerald-500/40"
                    >
                      +15 PTS
                    </button>
                    <button
                      onClick={() => updateTeamScore(team.teamId, { delta: 5, round: 3 })}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-black text-xs border border-emerald-500/30"
                    >
                      +5 PTS
                    </button>
                    <button
                      onClick={() => updateTeamScore(team.teamId, { delta: -5, round: 3 })}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-black text-xs border border-rose-500/30"
                    >
                      -5 PTS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Selection Grid */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">
            ALL SYMPOSIUM TEAMS (CLICK TO TOGGLE PARTICIPATION IN TIE BREAKER)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto p-1">
            {teams.map(team => {
              const isSelected = selectedTeamsForMatch.includes(team.teamId);
              return (
                <button
                  key={team.teamId}
                  onClick={() => toggleTeamSelection(team.teamId)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500 shadow-md shadow-rose-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{team.character || '🦁'}</span>
                    <span className="font-mono text-xs font-bold text-slate-400">{team.totalScore}p</span>
                  </div>
                  <div className="text-xs font-black text-slate-200 truncate">{team.teamName}</div>
                  <div className="text-[10px] text-slate-500">#{team.teamNumber}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </HostLayout>
  );
}
