import React from 'react';

export const AVATAR_CHARACTERS = [
  { emoji: '🦁', name: 'Lion' },
  { emoji: '🐯', name: 'Tiger' },
  { emoji: '🐼', name: 'Panda' },
  { emoji: '🦊', name: 'Fox' },
  { emoji: '🐺', name: 'Wolf' },
  { emoji: '🦅', name: 'Eagle' },
  { emoji: '🐉', name: 'Dragon' },
  { emoji: '🐵', name: 'Monkey' },
  { emoji: '🐻', name: 'Bear' },
  { emoji: '🐨', name: 'Koala' },
  { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🐸', name: 'Frog' },
  { emoji: '🐧', name: 'Penguin' },
  { emoji: '🦉', name: 'Owl' },
  { emoji: '🐙', name: 'Octopus' },
  { emoji: '🦈', name: 'Shark' },
  { emoji: '🐬', name: 'Dolphin' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🐝', name: 'Bee' },
  { emoji: '🦖', name: 'Dinosaur' },
  { emoji: '🦚', name: 'Peacock' },
  { emoji: '🐆', name: 'Leopard' },
  { emoji: '🐘', name: 'Elephant' },
  { emoji: '🦩', name: 'Flamingo' },
  { emoji: '🦘', name: 'Kangaroo' },
  { emoji: '🦔', name: 'Hedgehog' }
];

export default function AvatarSelector({ selected = '🦁', onSelect }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-black tracking-wider text-slate-400 uppercase mb-2">
        TEAM CHARACTER / AVATAR
      </label>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 max-h-48 overflow-y-auto">
        {AVATAR_CHARACTERS.map(char => (
          <button
            key={char.name}
            type="button"
            onClick={() => onSelect(char.emoji, char.name)}
            title={char.name}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              selected === char.emoji
                ? 'bg-amber-500/20 border-2 border-amber-400 scale-110 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800/80 hover:bg-slate-800 hover:scale-105'
            }`}
          >
            <span className="text-2xl">{char.emoji}</span>
            <span className="text-[10px] text-slate-400 truncate w-full text-center mt-1">
              {char.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
