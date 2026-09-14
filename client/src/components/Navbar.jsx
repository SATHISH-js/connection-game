import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Maximize, Minimize, Volume2, VolumeX, Radio, Shield, Monitor, Sparkles, Sun, Moon } from 'lucide-react';
import { useGame } from '../context/GameContext';
import TimerDisplay from './TimerDisplay';

export default function Navbar({ isDisplay = false }) {
  const { isConnected, displayCount, settings, audioUnlocked, unlockAudio, theme, toggleTheme, gameState } = useGame();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="w-full bg-[#0d131f]/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between z-30 select-none">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wider text-slate-100 flex items-center gap-2">
              <span>{settings.eventName || 'CONNECTION GAME'}</span>
              {isDisplay && (
                <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Smart Board
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide">
              {settings.eventSubtitle || 'Think. Connect. Win.'}
            </div>
          </div>
        </Link>
      </div>

      {/* Center Live Clock & Display Timer Badge */}
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 text-xs font-mono tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{currentTime}</span>
        </div>

        {isDisplay && gameState?.stageView === 'question' && !gameState?.answerRevealed && (
          <TimerDisplay compact={true} />
        )}
      </div>

      {/* Right Controls & Status */}
      <div className="flex items-center gap-2.5">
        {/* Connection Status Badge */}
        {isDisplay ? (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <span>{isConnected ? 'LIVE' : 'RECONNECTING'}</span>
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
            displayCount > 0
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            <Monitor className="w-3.5 h-3.5" />
            <span>{displayCount > 0 ? `DISPLAY CONNECTED (${displayCount})` : 'NO DISPLAY CONNECTED'}</span>
          </div>
        )}

        {/* Audio Unlock Button if blocked */}
        {!audioUnlocked ? (
          <button
            onClick={unlockAudio}
            title="Enable Audio Playback"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-colors animate-pulse"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>ENABLE AUDIO</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-400 text-xs font-medium">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">AUDIO ON</span>
          </div>
        )}

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-amber-300 hover:text-amber-200 hover:bg-slate-750 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/70 transition-colors"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Mode Switcher Shortcut */}
        {!isDisplay ? (
          <Link
            to="/display"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-600/30 transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>LAUNCH DISPLAY ↗</span>
          </Link>
        ) : (
          <Link
            to="/host"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/50 text-slate-400 border border-slate-700 text-xs font-medium hover:text-slate-200"
          >
            <Shield className="w-3 h-3" />
            <span>HOST LOGIN</span>
          </Link>
        )}
      </div>
    </header>
  );
}
