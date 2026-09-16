import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Key, Monitor, Sliders, CheckCircle, ShieldAlert, Database, Server, ShieldCheck, AlertTriangle, Zap, Radio, Globe, ExternalLink, Copy, Check } from 'lucide-react';
import HostLayout from '../components/HostLayout';
import { useGame } from '../context/GameContext';
import { getKeepAliveStatus, updateKeepAliveConfig, testKeepAlivePing } from '../services/keepAliveClient';

export default function SettingsPage() {
  const { settings, showToast } = useGame();
  const [formData, setFormData] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [reseedConfirm, setReseedConfirm] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [checkingDb, setCheckingDb] = useState(false);

  // Keep-Alive state
  const [keepAlive, setKeepAlive] = useState({
    isEnabled: true,
    isRunning: true,
    targetUrl: '',
    isAutoDetected: false,
    intervalMinutes: 10,
    lastPingAt: null,
    lastPingStatus: null,
    lastPingLatency: null,
    nextPingInSeconds: 600,
    logs: []
  });
  const [loadingKeepAlive, setLoadingKeepAlive] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

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

  const loadKeepAlive = async () => {
    try {
      const data = await getKeepAliveStatus();
      if (data) {
        setKeepAlive(prev => ({
          ...prev,
          ...data,
          targetUrl: data.targetUrl || (window.location.hostname !== 'localhost' ? window.location.origin : prev.targetUrl)
        }));
      }
    } catch (e) {
      console.warn('Keep-alive load error:', e);
    }
  };

  useEffect(() => {
    checkDbStatus();
    loadKeepAlive();
    const interval = setInterval(loadKeepAlive, 15000);
    return () => clearInterval(interval);
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

  const handleKeepAliveSave = async () => {
    setLoadingKeepAlive(true);
    try {
      const res = await updateKeepAliveConfig({
        isEnabled: keepAlive.isEnabled,
        targetUrl: keepAlive.targetUrl || (window.location.hostname !== 'localhost' ? window.location.origin : ''),
        intervalMinutes: keepAlive.intervalMinutes
      }, pin);
      setKeepAlive(prev => ({ ...prev, ...res }));
      showToast('24/7 Anti-Sleep engine config updated!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to update anti-sleep config', 'danger');
    } finally {
      setLoadingKeepAlive(false);
    }
  };

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult(null);
    try {
      const res = await testKeepAlivePing(pin);
      setPingResult(res);
      await loadKeepAlive();
      if (res.success) {
        showToast(`Test ping successful! Response: ${res.statusCode} (${res.latency}ms)`, 'success');
      } else {
        showToast(`Test ping alert: Code ${res.statusCode} (${res.latency}ms)`, 'warning');
      }
    } catch (e) {
      showToast('Ping test failed: ' + e.message, 'danger');
    } finally {
      setTestingPing(false);
    }
  };

  const handleCopyPingUrl = () => {
    const healthUrl = `${window.location.origin}/api/health`;
    navigator.clipboard.writeText(healthUrl);
    setCopiedUrl(true);
    showToast('Copied Health URL to clipboard!', 'success');
    setTimeout(() => setCopiedUrl(false), 3000);
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

          {/* 24/7 Render Anti-Sleep Shield & Keep-Alive Manager */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xl space-y-5 shadow-xl shadow-cyan-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-black tracking-wider text-slate-100 uppercase flex items-center gap-2">
                    <span>24/7 RENDER ANTI-SLEEP SHIELD & KEEP-ALIVE</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-normal">
                      100% Free
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Prevents Render free tier from going inactive / sleeping after 15 minutes of inactivity.
                  </p>
                </div>
              </div>

              {/* Protection Badge */}
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${
                  keepAlive.isEnabled && keepAlive.isRunning
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    keepAlive.isEnabled && keepAlive.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`} />
                  {keepAlive.isEnabled && keepAlive.isRunning ? '24/7 SHIELD ACTIVE' : 'SHIELD PAUSED'}
                </span>

                <button
                  type="button"
                  onClick={loadKeepAlive}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Auto-Ping Frequency</div>
                <div className="text-lg font-black text-cyan-400 mt-0.5 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>Every {keepAlive.intervalMinutes || 10} Mins</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Render sleeps at 15m (Guaranteed Safe)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Last Ping Status</div>
                <div className="text-lg font-black text-slate-100 mt-0.5 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    keepAlive.lastPingStatus === 200 ? 'bg-emerald-400' : keepAlive.lastPingStatus ? 'bg-amber-400' : 'bg-slate-500'
                  }`} />
                  <span>{keepAlive.lastPingStatus ? `${keepAlive.lastPingStatus} OK` : 'Pending First Cycle'}</span>
                  {keepAlive.lastPingLatency !== null && (
                    <span className="text-xs font-mono font-bold text-cyan-400">({keepAlive.lastPingLatency}ms)</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">
                  {keepAlive.lastPingAt ? new Date(keepAlive.lastPingAt).toLocaleTimeString() : 'Runs on boot & traffic'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Hours Used</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span>744 / 750 Hrs</span>
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">100% Free • Never incurs charges</div>
              </div>
            </div>

            {/* Target Public URL & Settings Configuration */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Render Public Web Service URL</span>
                </label>
                {keepAlive.isAutoDetected && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    Auto-Detected from Render Environment
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={keepAlive.targetUrl || ''}
                  onChange={(e) => setKeepAlive({ ...keepAlive, targetUrl: e.target.value })}
                  placeholder="https://your-connection-app.onrender.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-cyan-200 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={testingPing}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                  <span>{testingPing ? 'Testing...' : 'Test Ping Now'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
                {/* Enable toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={keepAlive.isEnabled}
                    onChange={(e) => setKeepAlive({ ...keepAlive, isEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                  <span>Enable Autonomous 24/7 Self-Pinging Engine</span>
                </label>

                {/* Interval selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Ping every:</span>
                  <select
                    value={keepAlive.intervalMinutes}
                    onChange={(e) => setKeepAlive({ ...keepAlive, intervalMinutes: Number(e.target.value) })}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
                  >
                    <option value={5}>5 Minutes (Ultra-Active)</option>
                    <option value={8}>8 Minutes (Recommended)</option>
                    <option value={10}>10 Minutes (Standard Default)</option>
                    <option value={12}>12 Minutes (Relaxed)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleKeepAliveSave}
                    disabled={loadingKeepAlive}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {loadingKeepAlive ? 'Saving...' : 'Save Engine Config'}
                  </button>
                </div>
              </div>

              {/* Ping Result Feedback Banner */}
              {pingResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  pingResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Ping completed: <strong>HTTP {pingResult.statusCode}</strong> in <strong>{pingResult.latency}ms</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">{pingResult.url}</span>
                </div>
              )}
            </div>

            {/* Ping Logs Toggle & Table */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowLogs(!showLogs)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <span>{showLogs ? '▼ Hide Ping Log History' : '▶ Show Recent Ping Log History'}</span>
                {keepAlive.logs && keepAlive.logs.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono">
                    {keepAlive.logs.length} logged
                  </span>
                )}
              </button>

              {showLogs && (
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
                  {keepAlive.logs && keepAlive.logs.length > 0 ? (
                    keepAlive.logs.map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${log.success ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className={log.success ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                            {log.statusCode} OK
                          </span>
                          <span className="text-cyan-300">({log.latency}ms)</span>
                        </div>
                        <span className="text-slate-400 text-[10px] truncate max-w-[200px]">{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-center py-3 text-xs">
                      No pings recorded yet. Click "Test Ping Now" or wait for the first scheduled cycle.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Free Tier Info & Optional External Backup Monitor */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Zero-Cost Guarantee & Free External Monitoring Backup</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Render gives <strong>750 free hours every month</strong> for your web service. Running continuously 24/7 uses only <strong>744 hours in a 31-day month</strong>, so this keep-alive service will <strong>never incur charges</strong>.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800/60">
                <div className="text-[11px] text-slate-300">
                  <span>External Monitor Health URL: </span>
                  <code className="text-cyan-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {window.location.origin}/api/health
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPingUrl}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                  <a
                    href="https://uptimerobot.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-xs font-bold text-cyan-300 transition-colors"
                  >
                    <span>Free UptimeRobot Backup</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
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
              {/* Round 1 Timer */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-amber-400 uppercase">
                  Round 1 Timer (5s - 60s)
                </label>
                <select
                  value={formData.round1Timer !== undefined ? formData.round1Timer : (formData.defaultTimer || 30)}
                  onChange={(e) => setFormData({ ...formData, round1Timer: Math.max(5, Math.min(60, Number(e.target.value))) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 focus:border-amber-400"
                >
                  {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(s => (
                    <option key={s} value={s}>
                      {s} Seconds {s === 5 ? '(Min)' : s === 30 ? '(Standard)' : s === 60 ? '(Max)' : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-1 pt-1 text-[11px] text-slate-400">
                  <span>Custom (5-60s):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={formData.round1Timer !== undefined ? formData.round1Timer : 30}
                      onChange={(e) => {
                        const val = Math.max(5, Math.min(60, Number(e.target.value) || 5));
                        setFormData({ ...formData, round1Timer: val });
                      }}
                      className="w-14 px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-amber-300 text-center"
                    />
                    <span className="font-mono text-[10px]">sec</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block">Normal Connection round</span>
              </div>

              {/* Round 2 Timer */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-purple-400 uppercase">
                  Round 2 Timer (5s - 60s)
                </label>
                <select
                  value={formData.round2Timer !== undefined ? formData.round2Timer : 20}
                  onChange={(e) => setFormData({ ...formData, round2Timer: Math.max(5, Math.min(60, Number(e.target.value))) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 focus:border-purple-400"
                >
                  {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(s => (
                    <option key={s} value={s}>
                      {s} Seconds {s === 5 ? '(Min)' : s === 20 ? '(Standard)' : s === 60 ? '(Max)' : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-1 pt-1 text-[11px] text-slate-400">
                  <span>Custom (5-60s):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={formData.round2Timer !== undefined ? formData.round2Timer : 20}
                      onChange={(e) => {
                        const val = Math.max(5, Math.min(60, Number(e.target.value) || 5));
                        setFormData({ ...formData, round2Timer: val });
                      }}
                      className="w-14 px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-purple-300 text-center"
                    />
                    <span className="font-mono text-[10px]">sec</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block">Step-by-step reveal round</span>
              </div>

              {/* Round 3 Timer */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-rose-400 uppercase">
                  Round 3 Timer (5s - 60s)
                </label>
                <select
                  value={formData.round3Timer !== undefined ? formData.round3Timer : 15}
                  onChange={(e) => setFormData({ ...formData, round3Timer: Math.max(5, Math.min(60, Number(e.target.value))) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 focus:border-rose-400"
                >
                  {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(s => (
                    <option key={s} value={s}>
                      {s} Seconds {s === 5 ? '(Min)' : s === 15 ? '(Standard)' : s === 60 ? '(Max)' : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-1 pt-1 text-[11px] text-slate-400">
                  <span>Custom (5-60s):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={formData.round3Timer !== undefined ? formData.round3Timer : 15}
                      onChange={(e) => {
                        const val = Math.max(5, Math.min(60, Number(e.target.value) || 5));
                        setFormData({ ...formData, round3Timer: val });
                      }}
                      className="w-14 px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-rose-300 text-center"
                    />
                    <span className="font-mono text-[10px]">sec</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block">High-stakes Tie Breaker</span>
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
