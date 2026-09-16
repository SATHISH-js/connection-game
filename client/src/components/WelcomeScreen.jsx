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
    <div className="w-full h-full flex flex-col justify-between items-center text-center px-3 sm:px-6 md:px-10 py-3 sm:py-4 select-none animate-in fade-in duration-700 min-h-0">
      {/* Top Section: College, Department, Organised By */}
      <div className="w-full max-w-5xl space-y-1 sm:space-y-1.5 shrink-0">
        {/* College Name */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <GraduationCap className="w-5 h-5 sm:w-6 h-6 text-amber-400 shrink-0" />
          <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-amber-400 tracking-wider uppercase drop-shadow-md">
            {settings.collegeName || 'ANNAPOORANA ENGINEERING COLLEGE (AUTONOMOUS)'}
          </h1>
        </div>

        {/* Department Name */}
        <div className="text-xs sm:text-sm md:text-base font-extrabold text-slate-200 uppercase tracking-wide">
          {settings.departmentName || 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING'}
        </div>

        {/* Organised By */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] sm:text-xs font-bold text-cyan-300 shadow-md">
          <Users className="w-3 h-3 sm:w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{settings.organisedBy || 'CODEX — AURA 2026'}</span>
        </div>

        {/* Golden Divider */}
        <div className="w-24 sm:w-36 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-1 sm:mt-1.5" />
      </div>

      {/* Middle Section: Big Game Title & Live Countdown Timer */}
      <div className="my-auto py-1 sm:py-2 flex flex-col items-center shrink-0">
        <div className="relative inline-block mb-1 sm:mb-2">
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 blur-xl rounded-3xl pointer-events-none" />
          <h2 className={`relative font-black tracking-tight text-slate-100 uppercase drop-shadow-2xl transition-all ${settings.landingCountdownActive && secondsRemaining > 0
              ? 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl'
              : 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl'
            }`}>
            {settings.eventName || 'CONNECTION GAME'}
          </h2>
        </div>

        <p className="text-xs sm:text-sm md:text-lg font-black text-amber-400/90 font-mono tracking-widest uppercase mb-2 sm:mb-3">
          ⚡ {settings.eventSubtitle || 'Think. Connect. Win.'} ⚡
        </p>

        {/* Live Start Countdown Clock - Sleek Horizontal Glassmorphic Banner */}
        {settings.landingCountdownActive && secondsRemaining > 0 ? (
          <div className="inline-flex items-center gap-2.5 sm:gap-5 px-4 sm:px-7 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 border-2 border-cyan-400/70 shadow-2xl shadow-cyan-500/25 backdrop-blur-xl animate-pulse">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Clock className="w-4 h-4 sm:w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase whitespace-nowrap">
                STARTING IN:
              </span>
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono text-cyan-300 tracking-widest drop-shadow-md">
              {formattedCountdown}
            </div>
            <div className="hidden sm:inline-flex items-center text-[10px] sm:text-xs font-black text-cyan-200 uppercase tracking-wider bg-cyan-950/80 border border-cyan-600/50 px-3 py-1 rounded-full">
              GET READY TEAMS!
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
              STANDBY — GAME COMMENCING SHORTLY
            </span>
          </div>
        )}
      </div>

      {/* Bottom Section: Game Rules & Format Cards */}
      <div className="w-full max-w-6xl mt-auto shrink min-h-0">
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/85 backdrop-blur-xl p-2.5 sm:p-3.5 md:p-4 shadow-2xl text-left flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 border-b border-slate-800/80 pb-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <h3 className="text-[11px] sm:text-xs md:text-sm font-black text-slate-200 tracking-wider uppercase">
                OFFICIAL GAME RULES & COMPETITION GUIDELINES
              </h3>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 font-bold uppercase hidden sm:inline-block">
              3 EXCITING ROUNDS • BUZZER SYSTEM
            </span>
          </div>

          <div className="max-h-[34vh] sm:max-h-[26vh] md:max-h-[28vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 transition-colors"
                >
                  <span className="text-[10px] sm:text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
