import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Trash2,
  Mic,
  Sliders,
  Sparkles,
  Music,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import HostLayout from '../components/HostLayout';
import CelebrationAudioController from '../components/CelebrationAudioController';
import { useGame } from '../context/GameContext';
import { audioEngine } from '../services/audioEngine';

export default function AudioPage() {
  const { gameState, settings, updateAudioSettings, triggerAudioEffect, stopAudio, showToast } = useGame();
  const [testText, setTestText] = useState('Gravity');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const pin = localStorage.getItem('host_auth_pin') || '1234';

  const soundEffectsList = [
    { id: 'game-start', label: 'Game Start Fanfare', icon: '🚀', desc: 'Rising brass chords' },
    { id: 'question-change', label: 'Question Change', icon: '🔄', desc: 'Electronic sweep swoosh' },
    { id: 'timer-start', label: 'Timer Start Chime', icon: '⏱️', desc: 'Two-tone alert bell' },
    { id: 'countdown', label: 'Countdown Tick (10s)', icon: '⚠️', desc: 'High-pitch urgency pip' },
    { id: 'time-up', label: "Time's Up Gong", icon: '🚨', desc: 'Dramatic buzzer gong' },
    { id: 'answer-reveal', label: 'Answer Reveal Sparkle', icon: '✨', desc: 'Ascending pentatonic shimmer' },
    { id: 'correct', label: 'Correct Answer', icon: '✅', desc: 'Triumphant major arpeggio' },
    { id: 'wrong', label: 'Wrong Answer', icon: '❌', desc: 'Descending disappointment tone' },
    { id: 'leaderboard', label: 'Leaderboard Brass', icon: '🏆', desc: 'Grand brass fanfare' },
    { id: 'tie-breaker', label: 'Tie Breaker Drone', icon: '⚔️', desc: 'Cinematic tension chord' },
    { id: 'winner', label: 'Winner Championship', icon: '🎉', desc: 'Championship celebration chords' }
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

  const fetchUploadedAudio = async () => {
    try {
      const res = await fetch('/api/audio/files');
      const data = await res.json();
      if (data.success) {
        setUploadedFiles(data.files);
      }
    } catch (err) {
      console.warn('Error fetching audio files:', err);
    }
  };

  useEffect(() => {
    fetchUploadedAudio();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('audio', selectedFile);

    setUploading(true);
    try {
      const res = await fetch('/api/audio/upload', {
        method: 'POST',
        headers: { 'x-host-pin': pin },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('Audio file uploaded successfully!', 'success');
        setSelectedFile(null);
        fetchUploadedAudio();
      } else {
        showToast(data.message || 'Upload failed', 'danger');
      }
    } catch (err) {
      showToast('Error uploading audio file', 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAudio = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;
    try {
      const res = await fetch(`/api/audio/${filename}`, {
        method: 'DELETE',
        headers: { 'x-host-pin': pin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Audio file removed.', 'info');
        fetchUploadedAudio();
      }
    } catch (err) {
      showToast('Error deleting audio file', 'danger');
    }
  };

  const currentMode = gameState.audioMode || settings.audioMode || 'full';
  const masterVolume = gameState.masterVolume !== undefined ? gameState.masterVolume : 0.85;

  return (
    <HostLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
              <Volume2 className="w-7 h-7 text-cyan-400" />
              <span>AUDIO SYSTEM & SMART BOARD SOUNDBOARD</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Zero-latency Web Audio API synthesizers, Text-to-Speech narration, and MP3/WAV file uploads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => audioEngine.playEffect('timer-start')}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider hover:bg-amber-500/30 transition-colors"
            >
              TEST TEST CHIME 🔔
            </button>
            <button
              onClick={stopAudio}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-black border border-rose-800 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>STOP ALL AUDIO</span>
            </button>
          </div>
        </div>

        {/* Master Control & Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Master Volume */}
          <div className="md:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>MASTER OUTPUT VOLUME</span>
              </span>
              <span className="text-sm font-mono font-black text-cyan-400">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => updateAudioSettings({ masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => updateAudioSettings({ masterVolume: 0 })}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                MUTE (0%)
              </button>
              <button
                onClick={() => updateAudioSettings({ masterVolume: 0.5 })}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                MID (50%)
              </button>
              <button
                onClick={() => updateAudioSettings({ masterVolume: 0.85 })}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
              >
                OPTIMAL (85%)
              </button>
              <button
                onClick={() => updateAudioSettings({ masterVolume: 1.0 })}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-colors"
              >
                MAX (100%)
              </button>
            </div>
          </div>

          {/* Audio Modes */}
          <div className="md:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 block">
              SYMPOSIUM AUDIO MODE
            </span>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'full', label: 'FULL AUDIO', desc: 'Effects + Spoken answers' },
                { id: 'effects', label: 'EFFECTS ONLY', desc: 'No TTS voice answers' },
                { id: 'silent', label: 'SILENT MODE', desc: 'Completely muted' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => updateAudioSettings({ audioMode: m.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    currentMode === m.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 24 Sound Effect Options Checkboxes */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>SOUND EFFECT ENABLERS & OPTIONS (SECTION 24)</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Uncheck to mute individual sound triggers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {soundOptions.map(opt => (
              <label
                key={opt.key}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs cursor-pointer select-none transition-all ${
                  soundEffects[opt.key] !== false
                    ? 'bg-slate-950/80 border-amber-500/40 text-slate-200 hover:border-amber-500'
                    : 'bg-slate-950/30 border-slate-800 text-slate-500 line-through'
                }`}
              >
                <input
                  type="checkbox"
                  checked={soundEffects[opt.key] !== false}
                  onChange={() => handleToggleEffect(opt.key)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="font-bold truncate">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Grand Championship Celebration Audio Controller */}
        <CelebrationAudioController />

        {/* 11 Procedural Sound Effects Soundboard */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              <span>LIVE SOUND EFFECTS SOUNDBOARD (TEST SPEAKERS BEFORE EVENT)</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Plays locally and broadcasts to Smart Board
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {soundEffectsList.map(effect => (
              <button
                key={effect.id}
                onClick={() => triggerAudioEffect(effect.id)}
                className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition-all group flex items-start justify-between active:scale-95 shadow-lg"
              >
                <div>
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {effect.icon}
                  </div>
                  <div className="text-sm font-black text-slate-200 group-hover:text-amber-300">
                    {effect.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {effect.desc}
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-600 group-hover:text-amber-400 mt-1 shrink-0 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Text-to-Speech Tester & MP3 Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TTS Speech Tester */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span>TEXT-TO-SPEECH (TTS) PREVIEW TESTER</span>
            </span>
            <p className="text-xs text-slate-400 mb-4">
              Enter any word or answer to test pronunciation through browser speech synthesis.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter word to speak..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => audioEngine.speakText(testText)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs tracking-wider transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>SPEAK</span>
              </button>
            </div>
          </div>

          {/* Custom MP3 Audio Upload */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>CUSTOM AUDIO UPLOADER (MP3 / WAV / OGG)</span>
            </span>
            <p className="text-xs text-slate-400 mb-4">
              Upload prerecorded answer audio clips for special connection rounds.
            </p>

            <form onSubmit={handleFileUpload} className="flex gap-2">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="flex-1 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
              />
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wider disabled:opacity-40 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'UPLOADING...' : 'UPLOAD'}</span>
              </button>
            </form>

            {/* List of uploaded files */}
            <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto">
              {uploadedFiles.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-2">
                  No custom audio files uploaded yet.
                </div>
              ) : (
                uploadedFiles.map(file => (
                  <div
                    key={file.filename}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <span className="truncate text-slate-300 max-w-[200px]">{file.filename}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => audioEngine.playAudioFile(file.url)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                      <button
                        onClick={() => handleDeleteAudio(file.filename)}
                        className="p-1 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </HostLayout>
  );
}
