import React from 'react';
import { Wifi, WifiOff, Tv } from 'lucide-react';

export default function ConnectionStatus({
  role = 'display',
  isConnected = true,
  displayCount = 0,
  showLabel = true,
  className = ''
}) {
  if (role === 'host') {
    const hasDisplay = displayCount > 0;
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-wider transition-all select-none ${
          hasDisplay
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10'
            : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
        } ${className}`}
      >
        <span className="relative flex h-2 w-2">
          {hasDisplay && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              hasDisplay ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          ></span>
        </span>
        <Tv className="w-3.5 h-3.5" />
        {showLabel && (
          <span>
            {hasDisplay
              ? `DISPLAY CONNECTED (${displayCount})`
              : 'NO DISPLAY CONNECTED'}
          </span>
        )}
      </div>
    );
  }

  // Display Mode View
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-wider transition-all select-none ${
        isConnected
          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10'
          : 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        ></span>
      </span>
      {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
      {showLabel && <span>{isConnected ? 'LIVE' : 'RECONNECTING'}</span>}
    </div>
  );
}
