import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building,
  Users,
  BookOpen,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function WelcomeScreen() {
  const { settings } = useGame();

  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Compute countdown remaining from settings.landingCountdownTarget
  useEffect(() => {
    if (!settings.landingCountdownTarget || !settings.landingCountdownActive) {
      setSecondsRemaining(0);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((settings.landingCountdownTarget - now) / 1000));
      setSecondsRemaining(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings.landingCountdownTarget, settings.landingCountdownActive]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const rules = settings.gameRules && settings.gameRules.length > 0
    ? settings.gameRules
    : [
        'Each round presents visual & multimedia clues linked to a hidden connecting entity.',
        'Round 1: Normal Connection (10 Points per question). All 20+ teams compete.',
        'Top qualifying teams advance to Round 2 based on Round 1 score rankings.',
        'Round 2: Sequential Clue Unlocking — clues unlock step-by-step with points for early answers.',
        'Round 3: High-Stakes Tie Breaker to determine the podium champions.',
        'Electronic devices strictly prohibited during buzzer rounds. Quiz Master decisions are final.'
      ];

  return (
    <div className="w-full h-full flex flex-col justify-between items-center text-center px-4 md:px-12 py-6 select-none animate-in fade-in duration-700">
      {/* Top Section: College, Department, Organised By */}
      <div className="w-full max-w-5xl space-y-2">
        {/* College Name */}
        <div className="flex items-center justify-center gap-2">
          <GraduationCap className="w-6 h-6 text-amber-400 shrink-0" />
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-amber-400 tracking-wider uppercase drop-shadow-lg">
            {settings.collegeName || 'K.S.R. COLLEGE OF ENGINEERING (AUTONOMOUS)'}
          </h1>
        </div>

        {/* Department Name */}
        <div className="text-sm sm:text-lg md:text-xl font-black text-slate-200 uppercase tracking-wide">
          {settings.departmentName || 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING'}
        </div>

        {/* Organised By */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm font-bold text-cyan-300 shadow-md">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>{settings.organisedBy || 'ASSOCIATION OF COMPUTER SCIENCE & ENGINEERING — TECHFEST 2026'}</span>
        </div>

        {/* Golden Divider */}
        <div className="w-36 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
      </div>

      {/* Middle Section: Big Game Title & Live Countdown Timer */}
      <div className="my-auto py-4 flex flex-col items-center">
        <div className="relative inline-block mb-3">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 blur-2xl rounded-3xl pointer-events-none" />
          <h2 className="relative text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-100 uppercase drop-shadow-2xl">
            {settings.eventName || 'CONNECTION GAME'}
          </h2>
        </div>

        <p className="text-base sm:text-xl md:text-2xl font-black text-amber-400/90 font-mono tracking-widest uppercase mb-6">
          ⚡ {settings.eventSubtitle || 'Think. Connect. Win.'} ⚡
        </p>

        {/* Live Start Countdown Clock */}
        {settings.landingCountdownActive && secondsRemaining > 0 ? (
          <div className="flex flex-col items-center p-5 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl animate-pulse">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black tracking-widest text-cyan-400 uppercase mb-1">
              <Clock className="w-4 h-4" />
              <span>THE GAME IS GOING TO START IN</span>
            </div>
            <div className="text-4xl sm:text-6xl md:text-7xl font-black font-mono text-cyan-300 tracking-widest drop-shadow-md">
              {formattedCountdown}
            </div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              GET READY TEAMS!
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-xl">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-sm sm:text-base font-black tracking-wider uppercase">
              STANDBY — GAME COMMENCING SHORTLY
            </span>
          </div>
        )}
      </div>

      {/* Bottom Section: Game Rules & Format Carousel / Cards */}
      <div className="w-full max-w-6xl mt-auto">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl text-left">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-black text-slate-200 tracking-wider uppercase">
                OFFICIAL GAME RULES & COMPETITION GUIDELINES
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
              3 EXCITING ROUNDS • BUZZER SYSTEM
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition-colors"
              >
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0 mt-0.5">
                  #{idx + 1}
                </span>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
