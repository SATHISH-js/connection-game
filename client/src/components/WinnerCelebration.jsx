import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Sparkles,
  Users,
  GraduationCap,
  Music,
  X
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function WinnerCelebration({ teams = [], onClose }) {
  const { settings, celebrationAudioEvent } = useGame();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  const sorted = [...teams].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  const winner = sorted[0] || {
    teamName: 'Champion Team',
    character: '🦁',
    totalScore: 100,
    collegeName: '',
    members: ['Alex Rivera', 'Devin Chen', 'Maya Patel']
  };
  const runnerUp = sorted[1] || {
    teamName: 'Runner Up',
    character: '🐯',
    totalScore: 85,
    collegeName: '',
    members: ['Sarah Connor', 'John Blake']
  };
  const third = sorted[2] || {
    teamName: 'Third Place',
    character: '🦅',
    totalScore: 70,
    collegeName: '',
    members: ['Gabriel Stone', 'Elena Gilbert']
  };

  useEffect(() => {
    // Continuous celebratory confetti bursts
    const duration = 8 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 }
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 }
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Auto-play celebration song if configured or selected by Host
    const url = celebrationAudioEvent?.url || settings.celebrationAudioUrl;
    if (url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = settings.masterVolume !== undefined ? settings.masterVolume : 0.85;
      audioRef.current = audio;

      audio.play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => console.log('Celebration audio autoplay restricted or loading:', e));

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [settings.celebrationAudioUrl, celebrationAudioEvent?.url, settings.masterVolume]);

  // Respond to host's audio control events (play, pause, stop, volume)
  useEffect(() => {
    if (!celebrationAudioEvent) return;
    const targetUrl = celebrationAudioEvent.url || settings.celebrationAudioUrl;

    if (celebrationAudioEvent.action === 'play') {
      if (!targetUrl) return;

      const currentSrc = audioRef.current ? audioRef.current.src : '';
      const isDifferentTrack = !currentSrc || (!currentSrc.endsWith(targetUrl) && currentSrc !== targetUrl);

      if (isDifferentTrack) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(targetUrl);
        audio.loop = true;
        const vol = celebrationAudioEvent.volume !== undefined ? celebrationAudioEvent.volume : (settings.masterVolume !== undefined ? settings.masterVolume : 0.85);
        audio.volume = vol;
        audioRef.current = audio;
        audio.play().then(() => setIsPlayingAudio(true)).catch((e) => console.log('Autoplay restriction:', e));
      } else {
        if (celebrationAudioEvent.volume !== undefined && audioRef.current) {
          audioRef.current.volume = celebrationAudioEvent.volume;
        }
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
      }
    } else if (celebrationAudioEvent.action === 'pause') {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
    } else if (celebrationAudioEvent.action === 'stop') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
      }
    } else if (celebrationAudioEvent.action === 'volume') {
      if (audioRef.current && celebrationAudioEvent.volume !== undefined) {
        audioRef.current.volume = celebrationAudioEvent.volume;
      }
    }
  }, [celebrationAudioEvent, settings.celebrationAudioUrl, settings.masterVolume]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl select-none overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto p-6 md:p-10 rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 shadow-[0_0_90px_rgba(245,158,11,0.5)] flex flex-col items-center text-center animate-scale-up">
        {/* Glow Orb */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/30 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button Top Right */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Institution & Symposium Header */}
        <div className="mb-3 space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-amber-400 uppercase tracking-widest">
            <GraduationCap className="w-4 h-4" />
            <span>{settings.collegeName || 'ANNAPOORANA ENGINEERING COLLEGE (AUTONOMOUS)'}</span>
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">
            {settings.departmentName || 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING'}
          </div>
          <div className="text-[10px] font-mono text-cyan-300">
            {settings.organisedBy || 'TECHFEST 2026'}
          </div>
        </div>

        {/* Top Trophy Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-[0_0_50px_rgba(245,158,11,0.8)] my-2 animate-bounce">
          <Trophy className="w-10 h-10 md:w-12 md:h-12" />
        </div>

        {/* Champion Avatar & Name */}
        <div className="my-1 flex flex-col items-center">
          <span className="text-5xl md:text-7xl my-1 transform hover:scale-125 transition-transform drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]">
            {winner.character || '🦁'}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100 tracking-tight drop-shadow">
            {winner.teamName}
          </h1>
          <div className="mt-2 px-5 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 font-mono font-black text-xl md:text-2xl text-amber-300">
            {winner.totalScore} POINTS
          </div>
        </div>

        {/* Champion Team Members Card */}
        {winner.members && winner.members.length > 0 && (
          <div className="mt-3 px-6 py-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-center max-w-xl shadow-lg">
            <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>CHAMPION TEAM MEMBERS</span>
            </div>
            <div className="text-sm md:text-base font-black text-slate-100">
              {winner.members.join(' • ')}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              {winner.collegeName || settings.collegeName}
            </div>
          </div>
        )}

        {/* Victory Music Indicator (Controlled from Host) */}
        {isPlayingAudio && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-xs text-purple-300 animate-pulse shadow-lg">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="font-black tracking-wider uppercase">VICTORY MUSIC PLAYING</span>
          </div>
        )}

        {/* Celebratory Subtitle */}
        <p className="text-base md:text-xl font-black text-slate-200 mt-4 tracking-wide">
          🎉 CONGRATULATIONS TO THE VICTORS! 🎉
        </p>

        {/* Podium Summary with Members & College */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          {/* Champion */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-left">
            <span className="text-2xl mt-0.5">🥇</span>
            <div className="min-w-0">
              <div className="text-[10px] font-black text-amber-400 uppercase">CHAMPION</div>
              <div className="font-black text-slate-100 text-sm truncate">{winner.teamName}</div>
              <div className="text-xs text-amber-300 font-mono font-bold">{winner.totalScore} pts</div>
              {winner.collegeName && (
                <div className="text-[10px] text-amber-200/90 font-semibold truncate mt-0.5">
                  🎓 {winner.collegeName}
                </div>
              )}
              {winner.members && (
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {winner.members.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Runner-Up */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5 text-left">
            <span className="text-2xl mt-0.5">🥈</span>
            <div className="min-w-0">
              <div className="text-[10px] font-black text-slate-300 uppercase">RUNNER-UP</div>
              <div className="font-black text-slate-100 text-sm truncate">{runnerUp.teamName}</div>
              <div className="text-xs text-slate-300 font-mono font-bold">{runnerUp.totalScore} pts</div>
              {runnerUp.collegeName && (
                <div className="text-[10px] text-cyan-400 font-semibold truncate mt-0.5">
                  🎓 {runnerUp.collegeName}
                </div>
              )}
              {runnerUp.members && (
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {runnerUp.members.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Third Place */}
          <div className="p-3 rounded-xl bg-amber-900/10 border border-amber-800/30 flex items-start gap-2.5 text-left">
            <span className="text-2xl mt-0.5">🥉</span>
            <div className="min-w-0">
              <div className="text-[10px] font-black text-amber-600 uppercase">THIRD PLACE</div>
              <div className="font-black text-slate-100 text-sm truncate">{third.teamName}</div>
              <div className="text-xs text-slate-400 font-mono font-bold">{third.totalScore} pts</div>
              {third.collegeName && (
                <div className="text-[10px] text-amber-500 font-semibold truncate mt-0.5">
                  🎓 {third.collegeName}
                </div>
              )}
              {third.members && (
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {third.members.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 px-8 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs tracking-wider border border-slate-700 transition-colors"
          >
            DISMISS CELEBRATION
          </button>
        )}
      </div>
    </div>
  );
}
