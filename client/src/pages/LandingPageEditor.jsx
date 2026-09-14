import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Clock,
  Building,
  GraduationCap,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Eye,
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import HostLayout from '../components/HostLayout';
import { useGame } from '../context/GameContext';

export default function LandingPageEditor() {
  const {
    settings,
    gameState,
    updateLandingSettings,
    triggerLandingCountdown,
    setStageView,
    showToast
  } = useGame();

  const [collegeName, setCollegeName] = useState(settings.collegeName || '');
  const [departmentName, setDepartmentName] = useState(settings.departmentName || '');
  const [organisedBy, setOrganisedBy] = useState(settings.organisedBy || '');
  const [eventName, setEventName] = useState(settings.eventName || 'CONNECTION GAME');
  const [eventSubtitle, setEventSubtitle] = useState(settings.eventSubtitle || 'Think. Connect. Win.');
  const [rules, setRules] = useState(
    settings.gameRules && settings.gameRules.length > 0
      ? settings.gameRules
      : [
          'Each round presents visual & multimedia clues linked to a hidden connecting entity.',
          'Round 1: Normal Connection (10 Points per question). All 20+ teams compete.',
          'Top qualifying teams advance to Round 2 based on Round 1 score rankings.',
          'Round 2: Sequential Clue Unlocking — clues unlock step-by-step with points for early answers.',
          'Round 3: High-Stakes Tie Breaker to determine the podium champions.',
          'Electronic devices strictly prohibited during buzzer rounds. Quiz Master decisions are final.'
        ]
  );
  const [countdownMinutes, setCountdownMinutes] = useState(settings.landingCountdownMinutes || 15);
  const [newRuleText, setNewRuleText] = useState('');

  // Keep local state in sync when settings update from server
  useEffect(() => {
    if (settings.collegeName) setCollegeName(settings.collegeName);
    if (settings.departmentName) setDepartmentName(settings.departmentName);
    if (settings.organisedBy) setOrganisedBy(settings.organisedBy);
    if (settings.eventName) setEventName(settings.eventName);
    if (settings.eventSubtitle) setEventSubtitle(settings.eventSubtitle);
    if (settings.gameRules) setRules(settings.gameRules);
    if (settings.landingCountdownMinutes) setCountdownMinutes(settings.landingCountdownMinutes);
  }, [settings]);

  const handleSaveSettings = () => {
    updateLandingSettings({
      collegeName,
      departmentName,
      organisedBy,
      eventName,
      eventSubtitle,
      gameRules: rules,
      landingCountdownMinutes: Number(countdownMinutes)
    });
    showToast('Landing Page details saved & broadcasted!', 'success');
  };

  const handleStartCountdown = (mins) => {
    const m = mins !== undefined ? mins : Number(countdownMinutes);
    triggerLandingCountdown(m);
    showToast(`Smart Board event countdown started for ${m} minutes!`, 'success');
  };

  const handleResetCountdown = () => {
    triggerLandingCountdown(0);
    showToast('Event countdown stopped / reset.', 'info');
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleText.trim()) return;
    setRules([...rules, newRuleText.trim()]);
    setNewRuleText('');
  };

  const handleRemoveRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleUpdateRule = (index, value) => {
    const updated = [...rules];
    updated[index] = value;
    setRules(updated);
  };

  const isLandingActive = gameState.stageView === 'landing' || gameState.landingVisible;

  return (
    <HostLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-wide flex items-center gap-2">
                  <span>SMART BOARD LANDING SCREEN EDITOR</span>
                  {isLandingActive && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      LIVE ON DISPLAY
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure college banner, department info, symposium details, game rules, and start countdown.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stage View Switchers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                const w = window.open('/display', 'SmartBoardDisplay', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
                if (w) w.focus();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open Display Window</span>
            </button>

            <button
              onClick={() => setStageView(isLandingActive ? 'question' : 'landing')}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider border transition-all flex items-center gap-2 ${
                isLandingActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-600/20'
              }`}
            >
              <Eye className="w-4 h-4 fill-current" />
              <span>{isLandingActive ? 'EXIT LANDING SCREEN (TO QUESTION)' : 'SHOW LANDING ON SMART BOARD'}</span>
            </button>
          </div>
        </div>

        {/* 2 Column Layout: Left Form Editor, Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Configuration Fields (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Institution & Event Details */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-3">
                <Building className="w-4 h-4" />
                <span>INSTITUTION & SYMPOSIUM HEADERS</span>
              </div>

              {/* College Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>College Name (Displayed at top of Smart Board)</span>
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. K.S.R. COLLEGE OF ENGINEERING (AUTONOMOUS)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Department Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>Department Name (Displayed below College)</span>
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Organised By */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Organised By / Association / Event Name</span>
                </label>
                <input
                  type="text"
                  value={organisedBy}
                  onChange={(e) => setOrganisedBy(e.target.value)}
                  placeholder="e.g. ASSOCIATION OF COMPUTER SCIENCE & ENGINEERING — TECHFEST 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Event Name & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                    Game Title
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="CONNECTION GAME"
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={eventSubtitle}
                    onChange={(e) => setEventSubtitle(e.target.value)}
                    placeholder="Think. Connect. Win."
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Event Start Countdown Station */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-widest">
                  <Clock className="w-4 h-4" />
                  <span>EVENT COMMENCEMENT COUNTDOWN</span>
                </div>
                {settings.landingCountdownActive && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                    COUNTDOWN RUNNING
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Display a dramatic countdown clock on the Smart Board showing: <span className="font-mono text-cyan-300 font-bold">&quot;Game is going to start in ...&quot;</span>
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setCountdownMinutes(mins);
                      handleStartCountdown(mins);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      Number(countdownMinutes) === mins && settings.landingCountdownActive
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {mins} MINS
                  </button>
                ))}

                <div className="flex items-center gap-1.5 ml-auto">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={countdownMinutes}
                    onChange={(e) => setCountdownMinutes(e.target.value)}
                    className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 text-center"
                  />
                  <span className="text-xs text-slate-400 font-bold">MIN</span>

                  <button
                    onClick={() => handleStartCountdown()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START</span>
                  </button>

                  <button
                    onClick={handleResetCountdown}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>STOP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Game Rules Manager */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest">
                  <BookOpen className="w-4 h-4" />
                  <span>GAME RULES & INSTRUCTIONS ({rules.length})</span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-mono font-bold text-amber-400 mt-1 shrink-0">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => handleUpdateRule(idx, e.target.value)}
                      className="flex-1 bg-transparent text-xs text-slate-200 border-0 focus:outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Rule Form */}
              <form onSubmit={handleAddRule} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add a new rule or instruction..."
                  value={newRuleText}
                  onChange={(e) => setNewRuleText(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold text-xs border border-purple-500/40 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD RULE</span>
                </button>
              </form>
            </div>

            {/* Save & Apply Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleSaveSettings}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>SAVE & BROADCAST TO SMART BOARD</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Live Preview of Smart Board Screen (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>SMART BOARD LIVE PREVIEW</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  16:9 PROPORTION
                </span>
              </div>

              {/* Simulated Smart Board Frame */}
              <div className="rounded-3xl border-2 border-slate-700 bg-gradient-to-b from-[#070a12] via-[#05070d] to-[#020306] p-5 shadow-2xl overflow-hidden relative text-center">
                {/* Ambient lights */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-48 h-20 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

                {/* College Name */}
                <div className="text-[11px] sm:text-xs font-black tracking-widest text-amber-400 uppercase drop-shadow mb-1">
                  {collegeName || 'COLLEGE NAME'}
                </div>

                {/* Department Name */}
                <div className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-slate-300 uppercase mb-2">
                  {departmentName || 'DEPARTMENT NAME'}
                </div>

                {/* Organised By */}
                <div className="text-[9px] font-bold text-slate-400 tracking-wide mb-4">
                  {organisedBy || 'ORGANISED BY'}
                </div>

                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-4" />

                {/* Big Game Title */}
                <div className="text-xl sm:text-2xl font-black text-slate-100 tracking-wider mb-1 drop-shadow">
                  {eventName || 'CONNECTION GAME'}
                </div>
                <div className="text-xs text-amber-400/90 font-mono tracking-widest mb-5">
                  {eventSubtitle || 'Think. Connect. Win.'}
                </div>

                {/* Simulated Live Countdown Clock */}
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 mb-5 max-w-xs mx-auto">
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">
                    GAME IS GOING TO START IN
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 tracking-wider">
                    {String(countdownMinutes).padStart(2, '0')}:00
                  </div>
                </div>

                {/* Game Rules Preview Box */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-purple-400" />
                    <span>GAME RULES & GUIDELINES:</span>
                  </div>
                  <ul className="space-y-1 text-[10px] text-slate-300 list-disc list-inside leading-relaxed max-h-40 overflow-hidden">
                    {rules.slice(0, 4).map((r, i) => (
                      <li key={i} className="truncate">
                        {r}
                      </li>
                    ))}
                    {rules.length > 4 && (
                      <li className="text-slate-500 italic">
                        +{rules.length - 4} more rules displayed on Smart Board
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HostLayout>
  );
}
