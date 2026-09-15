import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Lock,
  HelpCircle,
  Image as ImageIcon,
  Video as VideoIcon,
  Volume2,
  Globe,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { resolveMediaUrl } from '../utils/media';

function ClueImageRenderer({ src, alt }) {
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const resolvedUrl = resolveMediaUrl(src);

  if (hasError) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-950/90 z-10 select-none">
        <ImageIcon className="w-8 h-8 text-amber-500/50 mb-1.5 animate-pulse" />
        <span className="text-[11px] font-bold text-slate-300">Image Preview Unavailable</span>
        <span className="text-[9px] text-slate-500 font-mono mt-0.5 line-clamp-1 max-w-[180px]">
          {src}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setHasError(false);
            setRetryKey(k => k + 1);
          }}
          className="mt-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold flex items-center gap-1 border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const finalSrc = retryKey > 0 ? `${resolvedUrl}${resolvedUrl.includes('?') ? '&' : '?'}retry=${retryKey}` : resolvedUrl;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      <img
        src={finalSrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-125 pointer-events-none"
      />
      <img
        key={finalSrc}
        src={finalSrc}
        alt={alt}
        className="relative max-w-full max-h-full w-auto h-auto object-contain object-center drop-shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 z-10"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

/**
 * Parses a clue whether it is:
 * 1. An object: { text, image, video, mediaType, emoji }
 * 2. A video URL string: "https://...mp4"
 * 3. An image URL string: "https://..."
 * 4. An emoji string: "🍎 Red Apple"
 * 5. Plain text: "Gravity"
 */
export function parseClueItem(clue) {
  if (!clue) return { text: '', image: '', video: '', mediaType: 'text', emoji: '' };
  if (typeof clue === 'object') {
    const text = clue.text || '';
    const image = clue.image || '';
    const video = clue.video || '';
    const emoji = clue.emoji || '';
    const mediaType = clue.mediaType || (video ? 'video' : image ? 'image' : emoji ? 'emoji' : 'text');
    return { text, image, video, mediaType, emoji };
  }

  const str = String(clue).trim();
  const isVideoUrl = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(str);
  const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(str) || str.includes('images.unsplash.com');
  const isGenericUrl = str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/uploads/') || str.startsWith('data:');

  if (isVideoUrl) {
    return { text: '', image: '', video: str, mediaType: 'video', emoji: '' };
  }
  if (isImageUrl || isGenericUrl) {
    return { text: '', image: str, video: '', mediaType: 'image', emoji: '' };
  }

  // Detect leading emoji
  const emojiMatch = str.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|\p{Extended_Pictographic})/u);
  if (emojiMatch) {
    const emoji = emojiMatch[0];
    const text = str.slice(emoji.length).trim();
    return { text, image: '', video: '', mediaType: 'emoji', emoji };
  }

  return { text: str, image: '', video: '', mediaType: 'text', emoji: '' };
}

export default function QuestionCard({
  question,
  currentRound = 1,
  questionNumber = 1,
  totalQuestions = 0,
  revealedCluesCount = 4
}) {
  if (!question) {
    return (
      <div className="w-full max-w-5xl mx-auto py-20 px-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl flex flex-col items-center justify-center text-center">
        <Sparkles className="w-14 h-14 text-amber-400 mb-4 animate-pulse" />
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-200">
          READY FOR CONNECTION ROUND
        </h2>
        <p className="text-slate-400 mt-2 max-w-md">
          Waiting for the Host coordinator to start the next question...
        </p>
      </div>
    );
  }

  const roundNames = {
    1: 'ROUND 1 — NORMAL CONNECTION',
    2: 'ROUND 2 — STEP-BY-STEP CONNECTION',
    3: 'ROUND 3 — TIE BREAKER'
  };

  const rawClues = question.clues || [];
  const parsedClues = rawClues.map(parseClueItem);

  // In Round 2, clues reveal one by one based on revealedCluesCount UNLESS revealAllAtStart is true
  const isRound2 = currentRound === 2;
  const isRevealAll = question.revealAllAtStart || !isRound2;
  const activeRevealedLimit = isRevealAll ? parsedClues.length : (revealedCluesCount || 1);

  return (
    <div className="w-full h-full max-w-[98vw] 2xl:max-w-[1820px] mx-auto flex flex-col items-center justify-between min-h-0 select-none">
      {/* Round & Question Header Metadata */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-1.5 shrink-0">
        <div className={`px-3.5 py-1 rounded-full text-xs md:text-sm font-extrabold tracking-widest uppercase border ${
          currentRound === 3
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/10'
            : isRound2
            ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 shadow-lg shadow-purple-500/10'
            : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
        }`}>
          {roundNames[currentRound] || `ROUND ${currentRound}`}
        </div>

        <div className="px-4 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-100 text-xs md:text-sm font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md">
          <span>QUESTION</span>
          <span className="text-amber-400 font-mono font-black text-sm md:text-base">
            {questionNumber || (question && Number(question.questionNumber)) || 1}
          </span>
          <span className="text-slate-500 font-mono text-sm">/</span>
          <span className="text-slate-200 font-mono font-bold text-sm md:text-base">
            {(totalQuestions && Number(totalQuestions) > 0) ? Number(totalQuestions) : (question && Number(question.totalQuestions)) || 1}
          </span>
        </div>

        {isRound2 && !question.revealAllAtStart && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs md:text-sm font-black animate-pulse">
            <span>CLUES REVEALED: {Math.min(activeRevealedLimit, parsedClues.length)} / {parsedClues.length}</span>
          </div>
        )}

        {question.revealAllAtStart && (
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs md:text-sm font-black">
            ALL CLUES REVEALED
          </span>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs md:text-sm font-extrabold">
          <Award className="w-4 h-4" />
          <span>+{question.points || 10} POINTS</span>
        </div>
      </div>

      {/* Question Title */}
      <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-center text-slate-100 mb-1 tracking-wide drop-shadow-md px-4 shrink-0 line-clamp-2 max-w-5xl leading-tight">
        {question.title}
      </h1>

      {/* Bilingual Tamil/English & Speech Passage Banner if provided */}
      {(question.englishText || question.tamilText || question.ttsClue) && (
        <div className="w-full max-w-4xl mx-auto my-1 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-cyan-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg backdrop-blur-md animate-fade-in">
          <div className="flex-1 min-w-[220px] space-y-1 text-left">
            {question.englishText && (
              <p className="text-sm md:text-base font-bold text-slate-100 flex items-start gap-2">
                <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded mt-0.5 shrink-0">EN</span>
                <span>{question.englishText}</span>
              </p>
            )}
            {question.tamilText && (
              <p className="text-sm md:text-base font-bold text-amber-300 flex items-start gap-2">
                <span className="text-[10px] font-mono font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded mt-0.5 shrink-0">தமிழ்</span>
                <span>{question.tamilText}</span>
              </p>
            )}
          </div>
          {question.ttsClue && (
            <button
              type="button"
              onClick={() => audioEngine.speak(question.ttsClue)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
              title="Speak Clue"
            >
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Listen Clue</span>
            </button>
          )}
        </div>
      )}

      {/* Flexible Clues Grid: 1 Clue = 100% Full Screen, 2 Clues = 50% Each, 3 Clues = 33%, 4 Clues = 25% */}
      {parsedClues.length > 0 && (
      <div className={`w-full flex-1 min-h-0 grid px-2 sm:px-4 items-center justify-center ${
        parsedClues.length === 1
          ? 'grid-cols-1 w-full max-w-5xl mx-auto'
          : parsedClues.length === 2
          ? 'grid-cols-1 md:grid-cols-2 w-full max-w-[96vw] 2xl:max-w-[1850px] mx-auto gap-4 md:gap-6'
          : parsedClues.length === 3
          ? 'grid-cols-1 sm:grid-cols-3 w-full max-w-[96vw] 2xl:max-w-[1850px] mx-auto gap-3.5 md:gap-4'
          : 'grid-cols-2 lg:grid-cols-4 w-full max-w-[98vw] 2xl:max-w-[1850px] mx-auto gap-3'
      }`}>
        {parsedClues.map((clue, idx) => {
          const isRevealed = isRevealAll || idx < activeRevealedLimit;
          const isNewlyRevealed = isRound2 && !isRevealAll && idx === activeRevealedLimit - 1;
          const hasBilingual = Boolean(question.englishText || question.tamilText);

          // Fluid height within flex containment: fills available space without spilling over timer or title
          const cardHeightClass = parsedClues.length === 1
            ? (hasBilingual ? 'h-full max-h-[52vh] min-h-[200px]' : 'h-full max-h-[58vh] min-h-[220px]')
            : parsedClues.length === 2
            ? (hasBilingual ? 'h-full max-h-[48vh] min-h-[180px]' : 'h-full max-h-[54vh] min-h-[200px]')
            : parsedClues.length === 3
            ? (hasBilingual ? 'h-full max-h-[44vh] min-h-[160px]' : 'h-full max-h-[50vh] min-h-[180px]')
            : (hasBilingual ? 'h-full max-h-[40vh] min-h-[140px]' : 'h-full max-h-[46vh] min-h-[160px]');

          if (!isRevealed) {
            // Mystery Locked Card in Round 2
            return (
              <div
                key={idx}
                className={`group relative flex flex-col ${cardHeightClass} rounded-3xl border-2 border-dashed border-purple-500/30 bg-gradient-to-b from-slate-900/60 to-purple-950/20 backdrop-blur-xl shadow-2xl p-3 sm:p-4 items-center justify-center text-center transition-all duration-500 hover:border-purple-500/60 overflow-hidden animate-in fade-in`}
              >
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-purple-600/5 group-hover:bg-purple-600/10 transition-colors" />

                {/* Locked Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-xs font-black tracking-widest uppercase text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-xl border border-purple-500/30 flex items-center gap-1 shadow-md">
                    <Lock className="w-3 h-3" />
                    <span>CLUE {idx + 1}</span>
                  </span>
                </div>

                {/* Locked Graphic */}
                <div className="relative flex flex-col items-center justify-center space-y-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-300">
                      MYSTERY CLUE
                    </h4>
                    <p className="text-[11px] text-purple-400/80 font-bold mt-0.5 font-mono">
                      Reveal step {idx + 1}
                    </p>
                  </div>
                </div>

                {/* Subtle Shimmer Bar at bottom */}
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                    LOCKED UNTIL REVEALED
                  </span>
                </div>
              </div>
            );
          }

          // Revealed Image/Video Multimedia Clue Card with animation & maximized image
          return (
            <div
              key={idx}
              className={`group relative flex flex-col ${cardHeightClass} rounded-3xl border border-slate-700/70 bg-gradient-to-b from-slate-800/80 to-slate-900/95 backdrop-blur-2xl shadow-2xl p-2.5 sm:p-3 transition-all duration-500 hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/20 overflow-hidden animate-in fade-in zoom-in-95 ${
                isNewlyRevealed
                  ? 'ring-4 ring-amber-400 scale-[1.02] duration-700 shadow-2xl shadow-amber-500/40 z-20'
                  : ''
              }`}
            >
              {/* Top Bar: Clue Index Pill & Newly Revealed Badge */}
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 shrink-0 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-xl border border-amber-500/40 shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>CLUE {idx + 1}</span>
                  </span>
                  {isNewlyRevealed && (
                    <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 shadow-md animate-pulse">
                      ✨ REVEALED!
                    </span>
                  )}
                </div>

                <span className="text-slate-400 group-hover:text-amber-300 text-[11px] sm:text-xs font-mono font-black transition-colors flex items-center gap-1">
                  {clue.video ? (
                    <span className="flex items-center gap-1 text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                      <VideoIcon className="w-3 h-3" /> VIDEO
                    </span>
                  ) : clue.image ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      #0{idx + 1}
                    </span>
                  ) : (
                    `#0${idx + 1}`
                  )}
                </span>
              </div>

              {/* Clue Multimedia Frame: Maximized, Uncropped, High-Impact Image/Video */}
              <div className="relative flex-1 min-h-0 w-full rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center mb-1.5 group-hover:border-amber-500/50 transition-colors">
                {clue.video ? (
                  <video
                    src={resolveMediaUrl(clue.video)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-contain object-center bg-black"
                    onError={(e) => {
                      console.warn('Video error for clue:', clue.video);
                    }}
                  />
                ) : clue.image ? (
                  <ClueImageRenderer
                    src={clue.image}
                    alt={clue.text || `Clue ${idx + 1}`}
                  />
                ) : clue.emoji ? (
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-6xl sm:text-7xl md:text-8xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      {clue.emoji}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 p-4">
                    <ImageIcon className="w-10 h-10 mb-1.5 text-amber-500/40" />
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                      Connection Clue #{idx + 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Clue Label / Text Caption (Properly Aligned at Bottom) */}
              <div className="shrink-0 text-center px-2 py-0.5">
                <p className="text-sm sm:text-base md:text-lg font-black text-slate-100 tracking-tight leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
                  {clue.text || (clue.emoji ? `${clue.emoji} Clue` : `Clue ${idx + 1}`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
