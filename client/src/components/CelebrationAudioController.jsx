import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Square,
  Upload,
  Volume2,
  Radio,
  CheckCircle2,
  Headphones,
  Link as LinkIcon,
  Sparkles,
  Trophy,
  Disc3,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useGame } from '../context/GameContext';

const CELEBRATION_PRESETS = [
  {
    id: 'winner-wav',
    name: '🏆 Grand Fanfare (Official)',
    desc: 'Ceremonial brass victory fanfare',
    url: '/uploads/effects/winner.wav'
  },
  {
    id: 'wild-theme',
    name: '🎵 Wild Champion Anthem',
    desc: 'High-energy celebration BGM',
    url: '/uploads/answers/1789318523592-The-Wild-Theme-Bgm__1_.mp3'
  },
  {
    id: 'victory-stadium',
    name: '🎉 Victory Stadium Chime',
    desc: 'Uplifting celebratory applause synth',
    url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'
  },
  {
    id: 'brass-march',
    name: '🎺 Coronation Brass March',
    desc: 'Royal majestic trumpet fanfare',
    url: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
  },
  {
    id: 'royal-triumph',
    name: '👑 Royal Triumph Climax',
    desc: 'Dramatic championship brass flourish',
    url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
  }
];

export default function CelebrationAudioController({ compact = false, onClose }) {
  const {
    settings,
    celebrationAudioEvent,
    setCelebrationAudio,
    controlCelebrationAudio,
    showToast
  } = useGame();

  const pin = localStorage.getItem('host_auth_pin') || '1234';

  const [customUrl, setCustomUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localPlaying, setLocalPlaying] = useState(false);
  const [volume, setVolume] = useState(settings.masterVolume !== undefined ? settings.masterVolume : 0.85);
  const [recentUploads, setRecentUploads] = useState([]);
  const localAudioRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeUrl = settings.celebrationAudioUrl || '/uploads/effects/winner.wav';
  const isSmartBoardPlaying = celebrationAudioEvent?.action === 'play';
  const isSmartBoardPaused = celebrationAudioEvent?.action === 'pause';

  // Stop local preview when unmounting
  useEffect(() => {
    return () => {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current.src = '';
      }
    };
  }, []);

  // Fetch recent audio uploads from server
  const fetchUploadedAudios = async () => {
    try {
      const res = await fetch('/api/audio/files?type=effect');
      const data = await res.json();
      if (data.success && data.files) {
        setRecentUploads(data.files);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUploadedAudios();
  }, []);

  const handleSelectTrack = (url, name) => {
    setCelebrationAudio(url);
    showToast(`Celebration Song set: ${name || 'Custom Track'}`, 'success');
  };

  const handleSaveCustomUrl = (e) => {
    if (e) e.preventDefault();
    if (!customUrl.trim()) return;
    setCelebrationAudio(customUrl.trim());
    showToast('External celebration audio stream URL saved!', 'success');
    setCustomUrl('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0] || selectedFile;
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await fetch('/api/audio/upload?type=effect', {
        method: 'POST',
        headers: { 'x-host-pin': pin },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCelebrationAudio(data.url);
        showToast(`Celebration song "${file.name}" uploaded and set!`, 'success');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchUploadedAudios();
      } else {
        showToast(data.message || 'Upload failed', 'danger');
      }
    } catch (err) {
      showToast('Failed to upload celebration song: ' + err.message, 'danger');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocalPreviewToggle = () => {
    if (!activeUrl) return;

    if (localPlaying) {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      setLocalPlaying(false);
    } else {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      const audio = new Audio(activeUrl);
      audio.volume = volume;
      audio.onended = () => setLocalPlaying(false);
      audio.onerror = () => {
        setLocalPlaying(false);
        showToast('Error playing audio file locally', 'warning');
      };
      localAudioRef.current = audio;
      audio.play()
        .then(() => setLocalPlaying(true))
        .catch((e) => {
          setLocalPlaying(false);
          showToast('Local playback preview restricted by browser', 'warning');
        });
    }
  };

  const handleRemotePlay = () => {
    controlCelebrationAudio('play', activeUrl, volume);
    showToast('Sent PLAY command to Smart Board Display!', 'success');
  };

  const handleRemotePause = () => {
    controlCelebrationAudio('pause');
    showToast('Sent PAUSE command to Smart Board Display!', 'info');
  };

  const handleRemoteStop = () => {
    controlCelebrationAudio('stop');
    showToast('Sent STOP & RESET command to Smart Board Display!', 'info');
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    controlCelebrationAudio('volume', activeUrl, newVol);
    if (localAudioRef.current) {
      localAudioRef.current.volume = newVol;
    }
  };

  // Find track label
  const activePreset = CELEBRATION_PRESETS.find(p => p.url === activeUrl);
  const trackLabel = activePreset ? activePreset.name : (activeUrl ? activeUrl.split('/').pop() : 'Default Fanfare');

  if (compact) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900/90 border border-amber-500/40 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span>SMART BOARD CELEBRATION AUDIO</span>
                {isSmartBoardPlaying && (
                  <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    <Radio className="w-2.5 h-2.5" /> LIVE PLAYING
                  </span>
                )}
                {isSmartBoardPaused && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    PAUSED
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-200 truncate max-w-xs">
                {trackLabel}
              </div>
            </div>
          </div>

          {/* Remote Playback Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRemotePlay}
              className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 transition-all shadow-md ${
                isSmartBoardPlaying
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 active:scale-95'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSmartBoardPlaying ? 'REPLAY' : 'PLAY'}</span>
            </button>

            <button
              onClick={handleRemotePause}
              disabled={!isSmartBoardPlaying}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors border border-slate-700"
              title="Pause Smart Board Audio"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRemoteStop}
              className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/50 transition-colors"
              title="Stop & Reset Audio"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              onClick={handleLocalPreviewToggle}
              className={`p-1.5 rounded-xl border transition-colors ${
                localPlaying
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Test Listen Locally on Host Headphones"
            >
              <Headphones className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-amber-500/50 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-wide text-amber-400">
                CHAMPIONSHIP CELEBRATION AUDIO CONSOLE
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                HOST CONTROLLED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control victory music, upload external songs, or paste stream links broadcast exclusively to the Smart Board.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Active Track Banner & Smart Board Remote Controls */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950 border border-amber-500/40 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Disc3 className={`w-4 h-4 text-amber-400 ${isSmartBoardPlaying ? 'animate-spin' : ''}`} />
              <span>ACTIVE CELEBRATION TRACK ON SMART BOARD</span>
            </div>
            <div className="text-base font-black text-amber-300 flex items-center gap-2">
              <span>{trackLabel}</span>
            </div>
            <div className="text-xs font-mono text-slate-400 truncate max-w-md">
              {activeUrl}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">STATUS:</span>
            {isSmartBoardPlaying ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                PLAYING LIVE ON SMART BOARD
              </span>
            ) : isSmartBoardPaused ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                PAUSED ON SMART BOARD
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                READY / STOPPED
              </span>
            )}
          </div>
        </div>

        {/* Remote Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/20">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRemotePlay}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isSmartBoardPlaying ? 'RESTART ON SMART BOARD' : '▶ PLAY ON SMART BOARD'}</span>
            </button>

            <button
              onClick={handleRemotePause}
              disabled={!isSmartBoardPlaying}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 font-bold text-xs tracking-wider flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSE</span>
            </button>

            <button
              onClick={handleRemoteStop}
              className="px-4 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-bold text-xs tracking-wider flex items-center gap-1.5 border border-rose-900/50 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP & RESET</span>
            </button>
          </div>

          {/* Local Host Preview Button & Volume */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLocalPreviewToggle}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                localPlaying
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
              }`}
              title="Preview sound locally through host speakers or headphones"
            >
              <Headphones className="w-4 h-4" />
              <span>{localPlaying ? 'STOP LOCAL PREVIEW' : 'TEST ON HOST'}</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
                title="Celebration volume"
              />
              <span className="text-[10px] font-mono font-bold text-slate-400 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Track Selection Section: Presets, Custom Link, & File Uploader */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Presets (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>CURATED VICTORY PRESETS</span>
          </div>

          <div className="space-y-2">
            {CELEBRATION_PRESETS.map((preset) => {
              const isSelected = activeUrl === preset.url;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectTrack(preset.url, preset.name)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                      }`}
                    >
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-200 group-hover:text-amber-300 flex items-center gap-2">
                        <span>{preset.name}</span>
                        {isSelected && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {preset.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 text-xs font-bold transition-all"
                      >
                        SELECT
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Upload Custom Song & Paste External URL (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Direct File Upload */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>UPLOAD CELEBRATION SONG (MP3 / WAV)</span>
            </div>
            <p className="text-xs text-slate-400">
              Upload any celebration anthem from your device. It will be stored on the server and broadcast to the Smart Board.
            </p>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />

              <button
                type="button"
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider disabled:opacity-40 flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>UPLOADING TO SERVER...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>UPLOAD & SET AS CELEBRATION SONG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Paste External Audio Link / Stream */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span>EXTERNAL AUDIO STREAM / LINK</span>
            </div>
            <p className="text-xs text-slate-400">
              Paste an external audio stream, online MP3 link, or LAN network URL.
            </p>

            <form onSubmit={handleSaveCustomUrl} className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/celebration.mp3"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!customUrl.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-xs tracking-wide transition-colors"
              >
                APPLY
              </button>
            </form>
          </div>

          {/* Recent Uploads Quick List */}
          {recentUploads.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>RECENT SERVER UPLOADS</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {recentUploads.slice(0, 5).map((file) => (
                  <div
                    key={file.filename}
                    onClick={() => handleSelectTrack(file.url, file.filename)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer text-xs group"
                  >
                    <span className="truncate text-slate-300 group-hover:text-amber-300 max-w-[180px]">
                      {file.filename}
                    </span>
                    <span className="text-[10px] font-bold text-cyan-400 group-hover:underline">
                      {activeUrl === file.url ? 'ACTIVE' : 'USE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
