import React from 'react';
import { Volume2, VolumeX, Square, Play, X, Sliders, Music } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { audioEngine } from '../services/audioEngine';

export default function AudioControlModal({ isOpen, onClose }) {
  const { gameState, settings, updateAudioSettings, triggerAudioEffect, stopAudio } = useGame();

  if (!isOpen) return null;

  const currentMode = gameState.audioMode || settings.audioMode || 'full';
  const masterVolume = gameState.masterVolume !== undefined ? gameState.masterVolume : 0.85;

  const soundEffectsList = [
    { id: 'game-start', label: 'Game Start', icon: '🚀' },
    { id: 'question-change', label: 'Question Change', icon: '🔄' },
    { id: 'timer-start', label: 'Timer Start', icon: '⏱️' },
    { id: 'countdown', label: 'Countdown (10s)', icon: '⚠️' },
    { id: 'time-up', label: "Time's Up", icon: '🚨' },
    { id: 'answer-reveal', label: 'Answer Reveal', icon: '✨' },
    { id: 'correct', label: 'Correct Answer', icon: '✅' },
    { id: 'wrong', label: 'Wrong Answer', icon: '❌' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'tie-breaker', label: 'Tie Breaker', icon: '⚔️' },
    { id: 'winner', label: 'Winner Celebration', icon: '🎉' }
  ];

  const soundOptions = [
    { key: 'gameStart', label: 'Game Start' },
    { key: 'questionChange', label: 'Question Transition' },
    { key: 'timerStart', label: 'Timer Start' },
    { key: 'countdown', label: 'Countdown' },
    { key: 'timeUp', label: "Time's Up" },
    { key: 'answerReveal', label: 'Answer Reveal' },
    { key: 'spokenAnswer', label: 'Spoken Answer' },
    { key: 'correctAnswer', label: 'Correct Answer' },
    { key: 'wrongAnswer', label: 'Wrong Answer' },
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'tieBreaker', label: 'Tie Breaker' },
    { key: 'winner', label: 'Winner' }
  ];

  const soundEffects = settings.soundEffects || {
    gameStart: true,
    questionChange: true,
    timerStart: true,
    countdown: true,
    timeUp: true,
    answerReveal: true,
    spokenAnswer: true,
    correctAnswer: true,
    wrongAnswer: true,
    leaderboard: true,
    tieBreaker: true,
    winner: true
  };

  const handleToggleEffect = (key) => {
    const updated = {
      ...soundEffects,
      [key]: soundEffects[key] === false ? true : false
    };
    updateAudioSettings({ soundEffects: updated });
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    updateAudioSettings({ masterVolume: val });
  };

  const handleModeSelect = (mode) => {
    updateAudioSettings({ audioMode: mode });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl p-6 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg">
            <Sliders className="w-5 h-5" />
            <span>AUDIO CONTROL & TEST PANEL</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Volume & Modes */}
        <div className="mt-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Master Volume</span>
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={handleVolumeChange}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
              <button
                onClick={() => audioEngine.playEffect('timer-start')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>TEST AUDIO</span>
              </button>
              <button
                onClick={() => updateAudioSettings({ masterVolume: 0 })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>MUTE</span>
              </button>
              <button
                onClick={() => updateAudioSettings({ masterVolume: 0.85 })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>UNMUTE (85%)</span>
              </button>
              <button
                onClick={stopAudio}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>STOP AUDIO</span>
              </button>
            </div>
          </div>

          {/* Audio Modes */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase mb-2 block">
              AUDIO MODE
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'full', label: 'FULL AUDIO', desc: 'Effects & Voice' },
                { id: 'effects', label: 'EFFECTS ONLY', desc: 'No Spoken Answers' },
                { id: 'silent', label: 'SILENT MODE', desc: 'All Audio Off' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentMode === mode.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">{mode.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 24 Sound Effect Options Checkboxes */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                SOUND EFFECT TOGGLES
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                Live options from Section 24
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {soundOptions.map(opt => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                    soundEffects[opt.key] !== false
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={soundEffects[opt.key] !== false}
                    onChange={() => handleToggleEffect(opt.key)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="font-semibold truncate">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Audio Test Panel */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                TEST SMART BOARD SPEAKER EFFECTS
              </span>
              <button
                onClick={() => audioEngine.playEffect('timer-start')}
                className="text-xs text-amber-400 hover:underline font-bold"
              >
                Test Volume Chime 🔔
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {soundEffectsList.map(effect => (
                <button
                  key={effect.id}
                  onClick={() => triggerAudioEffect(effect.id)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-200 text-xs font-semibold transition-all group active:scale-95"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">{effect.icon}</span>
                  <span className="truncate">{effect.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
          <a
            href="/host/audio"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Open Full Audio & Celebration Console</span>
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-amber-500/20 transition-all"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
