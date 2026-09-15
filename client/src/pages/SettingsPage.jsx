import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Key, Monitor, Sliders, CheckCircle, ShieldAlert, Database, Server, ShieldCheck, AlertTriangle } from 'lucide-react';
import HostLayout from '../components/HostLayout';
import { useGame } from '../context/GameContext';

export default function SettingsPage() {
  const { settings, showToast } = useGame();
  const [formData, setFormData] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [reseedConfirm, setReseedConfirm] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [checkingDb, setCheckingDb] = useState(false);

  const pin = localStorage.getItem('host_auth_pin') || '1234';

  const checkDbStatus = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch('/api/settings/db-status');
      const data = await res.json();
      if (data.success) {
        setDbStatus(data.data);
      }
    } catch (e) {
      console.warn('DB status error', e);
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-host-pin': pin
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Settings saved successfully!', 'success');
        if (formData.hostPin && formData.hostPin !== pin) {
          localStorage.setItem('host_auth_pin', formData.hostPin);
        }
      } else {
        showToast(data.message || 'Failed to save settings', 'danger');
      }
    } catch (err) {
      showToast('Error saving settings', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleReseed = async () => {
    try {
      const res = await fetch('/api/game/reseed', {
        method: 'POST',
        headers: { 'x-host-pin': pin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Restored 25 demo teams and questions!', 'success');
        setReseedConfirm(false);
      }
    } catch (err) {
      showToast('Error restoring demo data', 'danger');
    }
  };

  return (
    <HostLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-amber-400" />
            <span>EVENT CONFIGURATION & PREFERENCES</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Customize symposium branding, security PIN, default durations, and leaderboard rotation.
          </p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Event Branding */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="text-xs font-black tracking-widest text-amber-400 uppercase">
              SYMPOSIUM BRANDING
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={formData.eventName || ''}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100"
                placeholder="CONNECTION GAME"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Event Subtitle / Motto
              </label>
              <input
                type="text"
                value={formData.eventSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, eventSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100"
                placeholder="Think. Connect. Win."
                required
              />
            </div>
          </div>

          {/* Security PIN */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="text-xs font-black tracking-widest text-cyan-400 uppercase flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>SECURITY & ACCESS</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Host Authorization PIN
              </label>
              <input
                type="text"
                value={formData.hostPin || ''}
                onChange={(e) => setFormData({ ...formData, hostPin: e.target.value })}
                className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-amber-400"
                placeholder="1234"
                maxLength={8}
                required
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Required for logging into Host Mode. Default is 1234.
              </span>
            </div>
          </div>

          {/* Database Connection Health & Persistence Status */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black tracking-widest text-emerald-400 uppercase flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>DATABASE PERSISTENCE & CLOUD HEALTH</span>
              </div>
              <button
                type="button"
                onClick={checkDbStatus}
                disabled={checkingDb}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Re-check Status</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-cyan-400 shadow-[0_0_10px_#38bdf8]'}`} />
                  <span className="text-sm font-black text-slate-100">
                    {dbStatus?.databaseType || 'Render Local JSON Persistence (store.json)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  {dbStatus?.connected ? 'MONGODB ATLAS CONNECTED' : 'RENDER PERSISTENCE ACTIVE'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {dbStatus?.message || 'Running on Render Local JSON database (store.json) with redundant backup protection (store.backup.json). Questions and teams are tracked and persisted.'}
              </p>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200/90 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-cyan-300">Continuous Question Persistence Guaranteed: </span>
                  <p className="text-[11px] text-slate-300">
                    Questions, teams, and game settings are committed directly to your repository and stored in <code className="text-cyan-300 font-mono">store.json</code>. You can also use the <strong>Export JSON</strong> button on the Questions page anytime to download an instant offline backup file.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timer & Round Defaults Options */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="text-xs font-black tracking-widest text-purple-400 uppercase flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <span>ROUND DEFAULT TIMERS & SMART BOARD ROTATION</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                  Round 1 Default Timer
                </label>
                <select
                  value={formData.round1Timer !== undefined ? formData.round1Timer : (formData.defaultTimer || 30)}
                  onChange={(e) => setFormData({ ...formData, round1Timer: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                >
                  <option value={15}>15 Seconds</option>
                  <option value={20}>20 Seconds</option>
                  <option value={30}>30 Seconds (Standard)</option>
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Normal Connection round</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-400 uppercase mb-1">
                  Round 2 Default Timer
                </label>
                <select
                  value={formData.round2Timer !== undefined ? formData.round2Timer : 20}
                  onChange={(e) => setFormData({ ...formData, round2Timer: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                >
                  <option value={15}>15 Seconds</option>
                  <option value={20}>20 Seconds (Standard)</option>
                  <option value={25}>25 Seconds</option>
                  <option value={30}>30 Seconds</option>
                  <option value={45}>45 Seconds</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Step-by-step unlock round</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-400 uppercase mb-1">
                  Round 3 Default Timer
                </label>
                <select
                  value={formData.round3Timer !== undefined ? formData.round3Timer : 15}
                  onChange={(e) => setFormData({ ...formData, round3Timer: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                >
                  <option value={10}>10 Seconds (Fast)</option>
                  <option value={15}>15 Seconds (Standard)</option>
                  <option value={20}>20 Seconds</option>
                  <option value={30}>30 Seconds</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">High-stakes Tie Breaker</span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.autoStartTimerOnNext !== false}
                  onChange={(e) => setFormData({ ...formData, autoStartTimerOnNext: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <div>
                  <span className="text-sm font-bold text-slate-200 block">
                    Auto-start timer automatically when advancing to next question
                  </span>
                  <span className="text-xs text-slate-400 block">
                    Begins countdown immediately when clicking Next Question so the host does not have to click Start every time.
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Leaderboard Page Rotation (Seconds)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={30}
                    value={formData.leaderboardRotationTime || 6}
                    onChange={(e) => setFormData({ ...formData, leaderboardRotationTime: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoRotateLeaderboard !== false}
                      onChange={(e) => setFormData({ ...formData, autoRotateLeaderboard: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      Auto-cycle leaderboard pages on Smart Board
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Defaults & Toggles (Section 46) */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="text-xs font-black tracking-widest text-cyan-400 uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>AUDIO CONFIGURATION & TOGGLES (SECTION 46)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Audio Mode
                </label>
                <select
                  value={formData.audioMode || 'full'}
                  onChange={(e) => setFormData({ ...formData, audioMode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                >
                  <option value="full">Full Audio (Sound Effects & Voice)</option>
                  <option value="effects">Effects Only (No Voice)</option>
                  <option value="silent">Silent (All Audio Muted)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">
                    Master Volume
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {Math.round((formData.masterVolume !== undefined ? formData.masterVolume : 0.85) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.masterVolume !== undefined ? formData.masterVolume : 0.85}
                  onChange={(e) => setFormData({ ...formData, masterVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.effectsEnabled !== false}
                  onChange={(e) => setFormData({ ...formData, effectsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Sound Effects ON/OFF</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.spokenAnswerEnabled !== false}
                  onChange={(e) => setFormData({ ...formData, spokenAnswerEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Spoken Answer ON/OFF</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.countdownSoundEnabled !== false}
                  onChange={(e) => setFormData({ ...formData, countdownSoundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Countdown Beep ON/OFF</span>
              </label>
            </div>
          </div>

          {/* Theme & Display Mode */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <div className="text-xs font-black tracking-widest text-emerald-400 uppercase">
              THEME & PRESENTATION
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Symposium Theme
                </label>
                <select
                  value={formData.theme || 'dark'}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                >
                  <option value="dark">Midnight Dark (Default)</option>
                  <option value="high-contrast">High-Contrast Smart Board</option>
                  <option value="cyber-blue">Cyber Arena Blue</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.displayFullscreen || false}
                    onChange={(e) => setFormData({ ...formData, displayFullscreen: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Suggest Fullscreen Mode on Display load</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between p-4">
            <button
              type="button"
              onClick={() => setReseedConfirm(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Demo Data (25 Teams & Questions)</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'SAVING...' : 'SAVE SETTINGS'}</span>
            </button>
          </div>
        </form>

        {/* Reseed confirmation modal */}
        {reseedConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-2xl border border-amber-500/50 bg-slate-900 shadow-2xl">
              <h3 className="text-lg font-black text-amber-400 mb-2">
                RESTORE 25 DEMO TEAMS & SAMPLE QUESTIONS?
              </h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                This will reset the database with 25 pre-populated symposium teams, character avatars, and connection questions for Rounds 1, 2, and 3.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setReseedConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleReseed}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black"
                >
                  CONFIRM RESTORE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HostLayout>
  );
}
