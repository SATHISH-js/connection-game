import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  HelpCircle,
  Users,
  Trophy,
  Swords,
  Volume2,
  Settings,
  Monitor,
  Keyboard,
  LogOut,
  RotateCcw,
  Sparkles,
  Play,
  Sun,
  Moon
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import Navbar from './Navbar';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import AudioControlModal from './AudioControlModal';
import DisplayMiniPreview from './DisplayMiniPreview';

export default function HostLayout({ children }) {
  const { gameState, resetGame, showToast, theme, toggleTheme, showMiniPreview, toggleMiniPreview } = useGame();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('host_auth_pin');
    localStorage.removeItem('host_auth_pin');
    showToast('Logged out of Host mode.', 'info');
    navigate('/host-login');
  };

  const confirmResetGame = () => {
    resetGame();
    setShowResetConfirm(false);
  };

  const navItems = [
    { to: '/host', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/host/landing', label: 'Landing Screen', icon: <Monitor className="w-4 h-4" /> },
    { to: '/host/questions', label: 'Questions', icon: <HelpCircle className="w-4 h-4" /> },
    { to: '/host/teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
    { to: '/host/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { to: '/host/tiebreaker', label: 'Tie Breaker', icon: <Swords className="w-4 h-4" /> },
    { to: '/host/audio', label: 'Audio', icon: <Volume2 className="w-4 h-4" /> },
    { to: '/host/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen w-screen bg-[#070a10] text-slate-100 flex flex-col overflow-hidden">
      <Navbar isDisplay={false} />

      <div className="flex-1 flex overflow-hidden">
        {/* Strictly Fixed Sidebar (Does not scroll with page content) */}
        <aside className="w-64 border-r border-slate-800/80 bg-[#0c111c]/90 flex flex-col justify-between p-4 hidden md:flex shrink-0 h-full overflow-y-auto">
          <div>
            {/* Round & Status quick pill */}
            <div className="p-3 mb-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">ROUND</div>
                <div className="text-sm font-black text-amber-400">ROUND {gameState.currentRound || 1}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">STATUS</div>
                <div className="text-xs font-bold text-cyan-400">{gameState.gameStatus || 'READY'}</div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Sidebar bottom action tools */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => {
                const w = window.open('/display', 'SmartBoardDisplay', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
                if (w) w.focus();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 text-xs font-bold border border-cyan-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5" />
                <span>Open Display Window</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">↗</span>
            </button>

            <button
              onClick={toggleMiniPreview}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                showMiniPreview
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Toggle Live Smart Board Mini Floating Window"
            >
              <div className="flex items-center gap-2">
                <Monitor className={`w-3.5 h-3.5 ${showMiniPreview ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Mini TV Preview</span>
              </div>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                showMiniPreview ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                {showMiniPreview ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => setShowAudioModal(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audio Testing</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">85%</span>
            </button>

            <button
              onClick={() => setShowShortcuts(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Keyboard Shortcuts</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
              title="Toggle Light / Dark Mode"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
                <span>Theme</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">
                {theme}
              </span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-400 text-xs font-bold border border-rose-900/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Host Mode</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#080b12] to-[#04060a]">
          {children}
        </main>
      </div>

      {/* Confirmation Modal for Reset Game */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-rose-500/50 bg-slate-900 shadow-2xl">
            <h3 className="text-lg font-black text-rose-400 mb-2">
              ⚠️ RESET GAME STATE & SCORES?
            </h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              This will reset the active question to Question 1, stop the timer, clear round progress, and reset all team scores to 0.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={confirmResetGame}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black tracking-wider transition-colors shadow-lg shadow-rose-600/30"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <AudioControlModal isOpen={showAudioModal} onClose={() => setShowAudioModal(false)} />
      <DisplayMiniPreview />
    </div>
  );
}
