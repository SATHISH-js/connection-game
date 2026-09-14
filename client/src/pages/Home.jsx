import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Monitor, Sparkles, Trophy, Radio, Volume2, Users, Layers, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar isDisplay={false} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 relative overflow-hidden">
        {/* Glow ambient background orbs */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 right-10 w-[500px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center z-10">
          {/* Symposium Event Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs md:text-sm font-extrabold tracking-widest uppercase mb-6 backdrop-blur-md shadow-lg shadow-amber-500/10 animate-fade-in">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
            <span>COLLEGE SYMPOSIUM LIVE QUIZ ARENA</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-slate-100 drop-shadow-2xl">
            CONNECTION <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">GAME</span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-400/90 tracking-widest uppercase mt-4 mb-3">
            “Think. Connect. Win.”
          </p>

          <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            A real-time connection quiz platform engineered for high-energy symposium events. Managed seamlessly from the Host laptop and projected on the auditorium Smart Board.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <Link
              to="/host-login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base md:text-lg tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
            >
              <Shield className="w-5 h-5" />
              <span>HOST / MANAGE MODE</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/display"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-extrabold text-base md:text-lg tracking-wider border-2 border-cyan-500/40 hover:border-cyan-400 shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
            >
              <Monitor className="w-5 h-5 text-cyan-400" />
              <span>SMART BOARD DISPLAY</span>
            </Link>
          </div>

          {/* 6 Feature Pillars */}
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 text-left">
            {[
              { icon: <Layers className="w-5 h-5 text-amber-400" />, title: '3 Rounds', desc: 'Round 1, 2 & Tie Breaker' },
              { icon: <Radio className="w-5 h-5 text-cyan-400" />, title: 'Socket.IO', desc: 'Real-time host sync' },
              { icon: <Users className="w-5 h-5 text-purple-400" />, title: '20+ Teams', desc: 'Scalable pagination' },
              { icon: <Trophy className="w-5 h-5 text-emerald-400" />, title: 'Leaderboard', desc: 'Live auto-rotation' },
              { icon: <Volume2 className="w-5 h-5 text-rose-400" />, title: 'Audio & Voice', desc: 'Synthesizer & TTS' },
              { icon: <Monitor className="w-5 h-5 text-blue-400" />, title: 'Smart Board', desc: 'Optimized 1080p / 4K' },
            ].map((card, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md hover:border-slate-700 transition-colors"
              >
                <div className="p-2 rounded-xl bg-slate-800/50 w-fit mb-2">
                  {card.icon}
                </div>
                <div className="font-extrabold text-slate-200 text-sm tracking-wide">
                  {card.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {card.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Smart Board Local Network Help callout */}
          <div className="mt-12 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Auditorium Wi-Fi Ready: Connect Smart Board via LAN IP address</span>
            </div>
            <code className="px-2 py-0.5 rounded bg-slate-950 font-mono text-cyan-400">
              http://&lt;laptop-ip&gt;:3000/display
            </code>
          </div>
        </div>
      </main>
    </div>
  );
}
