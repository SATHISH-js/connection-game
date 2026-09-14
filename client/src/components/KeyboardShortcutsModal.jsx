import React from 'react';
import { Keyboard, X } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'SPACE', desc: 'Start / Pause Timer' },
    { key: 'N', desc: 'Next Question' },
    { key: 'P', desc: 'Previous Question' },
    { key: 'R', desc: 'Reset Timer to Default' },
    { key: 'A', desc: 'Reveal Answer on Smart Board' },
    { key: 'H', desc: 'Hide Answer Curtain' },
    { key: 'L', desc: 'Toggle Live Leaderboard' },
    { key: 'F', desc: 'Toggle Fullscreen Presentation' },
    { key: 'ESC', desc: 'Close Modals / Exit Fullscreen' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg p-6 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg">
            <Keyboard className="w-5 h-5" />
            <span>HOST KEYBOARD SHORTCUTS</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-sm font-semibold text-slate-300">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs font-black text-amber-300 shadow">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-3 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
          Hotkeys are active while on the Host Control Dashboard.
        </div>
      </div>
    </div>
  );
}
