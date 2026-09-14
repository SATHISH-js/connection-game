import React, { useState } from 'react';
import { Play, Pause, Volume2, Square } from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

export default function AudioPlayer({ src, title, duration, onPlay, onStop }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (!src) return;
    setIsPlaying(true);
    if (onPlay) onPlay();
    try {
      await audioEngine.playAudioFile(src);
    } finally {
      setIsPlaying(false);
      if (onStop) onStop();
    }
  };

  const handleStop = () => {
    audioEngine.stopAll();
    setIsPlaying(false);
    if (onStop) onStop();
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200">
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          className={`p-2.5 rounded-xl transition-all ${
            isPlaying
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
          }`}
        >
          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
        <div>
          <div className="text-xs font-black text-slate-100">{title || 'Audio Clip'}</div>
          {duration && <div className="text-[10px] text-slate-500 font-mono">{duration}s</div>}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
        <span>{isPlaying ? 'PLAYING' : 'READY'}</span>
      </div>
    </div>
  );
}
