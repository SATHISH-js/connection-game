import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Trash2, Edit2, RotateCcw, Award, Search, Check, X, Download, Upload } from 'lucide-react';
import HostLayout from '../components/HostLayout';
import AvatarSelector from '../components/AvatarSelector';
import { useGame } from '../context/GameContext';

export default function Teams() {
  const { updateTeamScore, showToast, gameState, teams: contextTeams } = useGame();
  const [teams, setTeams] = useState(contextTeams || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState(Number(gameState.currentRound) || 1);
  const fileInputRef = useRef(null);

  const pin = localStorage.getItem('host_auth_pin') || sessionStorage.getItem('host_auth_pin') || '1234';

  // Sync selectedRound with gameState.currentRound
  useEffect(() => {
    if (gameState.currentRound) {
      setSelectedRound(Number(gameState.currentRound));
    }
  }, [gameState.currentRound]);

  // Real-time synchronization from GameContext teams
  useEffect(() => {
    if (contextTeams && contextTeams.length > 0) {
      setTeams(contextTeams);
    }
  }, [contextTeams]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teams');
      const data = await res.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (err) {
      showToast('Error loading teams', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team permanently?')) return;
    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
        headers: { 'x-host-pin': pin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Team removed.', 'info');
        fetchTeams();
      }
    } catch (err) {
      showToast('Error removing team', 'danger');
    }
  };

  const handleResetScores = async () => {
    if (!window.confirm('Reset ALL team scores to 0?')) return;
    try {
      const res = await fetch('/api/teams/reset-scores', {
        method: 'POST',
        headers: { 'x-host-pin': pin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('All scores reset to 0.', 'success');
        fetchTeams();
      }
    } catch (err) {
      showToast('Error resetting scores', 'danger');
    }
  };

  const handleSaveTeam = async (formData) => {
    const isEdit = Boolean(formData.teamId);
    const endpoint = isEdit ? `/api/teams/${formData.teamId}` : '/api/teams';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-host-pin': pin
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Team ${isEdit ? 'updated' : 'registered'} successfully!`, 'success');
        setIsModalOpen(false);
        setEditingTeam(null);
        fetchTeams();
      } else {
        showToast(data.message || 'Error saving team', 'danger');
      }
    } catch (err) {
      showToast('Network error saving team', 'danger');
    }
  };

  const handleExportTeams = () => {
    const blob = new Blob([JSON.stringify(teams, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `connection-teams-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Teams roster exported successfully!', 'success');
  };

  const handleImportTeams = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result);
        if (!Array.isArray(parsed)) {
          showToast('Invalid JSON: expected array of teams', 'danger');
          return;
        }
        let imported = 0;
        for (const t of parsed) {
          if (t.teamName) {
            await fetch('/api/teams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-host-pin': pin },
              body: JSON.stringify(t)
            });
            imported++;
          }
        }
        showToast(`Successfully imported ${imported} teams!`, 'success');
        fetchTeams();
      } catch (err) {
        showToast('Error parsing team JSON file', 'danger');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredTeams = teams.filter(t =>
    t.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.characterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.collegeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.members?.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <HostLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
              <Users className="w-7 h-7 text-purple-400" />
              <span>TEAM ROSTER MANAGEMENT</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Supports 20+, 50+, 100+ symposium teams. Configure avatars, team rosters, and scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportTeams}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={handleExportTeams}
              title="Download backup file of team roster"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Teams</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload JSON roster file to add/import teams"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import Teams</span>
            </button>

            <button
              onClick={handleResetScores}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-bold border border-rose-800/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET ALL SCORES</span>
            </button>

            <button
              onClick={() => {
                setEditingTeam({
                  teamName: '',
                  character: '🦁',
                  characterName: 'Lion',
                  collegeName: '',
                  members: ''
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs tracking-wider shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>REGISTER TEAM</span>
            </button>
          </div>
        </div>

        {/* Search bar, total count & Round Scoring selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs font-black text-slate-400 tracking-wider uppercase">
              TOTAL REGISTERED: <span className="text-purple-400 font-mono text-sm">{teams.length} TEAMS</span>
            </div>

            {/* Active Round Selector for Score Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] font-black text-slate-400 uppercase px-2">SCORING ROUND:</span>
              {[
                { round: 1, label: 'Round 1' },
                { round: 2, label: 'Round 2' },
                { round: 3, label: 'Tie Breaker' }
              ].map(r => (
                <button
                  key={r.round}
                  type="button"
                  onClick={() => setSelectedRound(r.round)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedRound === r.round
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search team name, members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm font-medium">
            Loading symposium teams...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-500">
            No teams found matching search. Click "REGISTER NEW TEAM" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTeams.map((team, idx) => (
              <div
                key={team.teamId}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-3xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                      {team.character || '🦁'}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-500 block">
                        #{team.teamNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-black text-sm">
                        {team.totalScore || 0} PTS
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-100 mb-0.5">
                    {team.teamName}
                  </h3>
                  {team.collegeName && (
                    <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mb-1 truncate" title={team.collegeName}>
                      <span>🎓</span>
                      <span className="truncate">{team.collegeName}</span>
                    </div>
                  )}
                  <div className="text-xs text-slate-400 font-medium line-clamp-2 mb-3">
                    {team.members?.length > 0 ? team.members.join(', ') : 'No members listed'}
                  </div>

                  {/* Round breakdown */}
                  <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-center font-mono">
                    <div>
                      <div className="text-slate-500 text-[9px] uppercase font-sans">R1</div>
                      <div className="text-slate-300 font-bold">{team.round1Score || 0}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[9px] uppercase font-sans">R2</div>
                      <div className="text-slate-300 font-bold">{team.round2Score || 0}</div>
                    </div>
                    <div>
                      <div className="text-purple-400 text-[9px] uppercase font-sans">TIE</div>
                      <div className="text-purple-300 font-bold">{team.tieBreakerScore || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Score and action bar */}
                <div className="pt-4 mt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await updateTeamScore(team.teamId, { delta: 10, round: selectedRound });
                        fetchTeams();
                      }}
                      className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-bold border border-emerald-500/30"
                      title={`Add 10 points to Round ${selectedRound === 3 ? 'Tie Breaker' : selectedRound}`}
                    >
                      +10 (R{selectedRound === 3 ? 'T' : selectedRound})
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await updateTeamScore(team.teamId, { delta: 5, round: selectedRound });
                        fetchTeams();
                      }}
                      className="px-2 py-1 rounded bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/20"
                      title={`Add 5 points to Round ${selectedRound === 3 ? 'Tie Breaker' : selectedRound}`}
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await updateTeamScore(team.teamId, { delta: -5, round: selectedRound });
                        fetchTeams();
                      }}
                      className="px-2 py-1 rounded bg-rose-600/15 hover:bg-rose-600/30 text-rose-300 text-[11px] font-bold border border-rose-500/20"
                      title={`Deduct 5 points from Round ${selectedRound === 3 ? 'Tie Breaker' : selectedRound}`}
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await updateTeamScore(team.teamId, { directScore: 0, round: selectedRound });
                        fetchTeams();
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-bold"
                      title={`Reset Round ${selectedRound === 3 ? 'Tie Breaker' : selectedRound} score to 0`}
                    >
                      Clr R{selectedRound === 3 ? 'T' : selectedRound}
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingTeam({
                          ...team,
                          members: Array.isArray(team.members) ? team.members.join(', ') : team.members
                        });
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>EDIT</span>
                    </button>
                    <button
                      onClick={() => handleDelete(team.teamId)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Team Editor */}
        {isModalOpen && editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <h2 className="text-lg font-black text-purple-400">
                  {editingTeam.teamId ? 'EDIT TEAM DETAILS' : 'REGISTER NEW TEAM'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTeam(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveTeam(editingTeam);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cyber Lions"
                    value={editingTeam.teamName}
                    onChange={(e) => setEditingTeam({ ...editingTeam, teamName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100"
                    required
                  />
                </div>

                {/* Avatar Character Picker */}
                <AvatarSelector
                  selected={editingTeam.character}
                  onSelect={(emoji, name) => setEditingTeam({ ...editingTeam, character: emoji, characterName: name })}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    College / Institution Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. St. Xavier's Engineering College / MIT"
                    value={editingTeam.collegeName || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, collegeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Team Members (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera, Devin Chen, Maya Patel"
                    value={editingTeam.members || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, members: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTeam(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs tracking-wider shadow-lg shadow-purple-600/30"
                  >
                    SAVE TEAM
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </HostLayout>
  );
}
