import { resolveMediaUrl } from '../utils/media';

// Web Audio API Synthesizer + SpeechSynthesis + Audio File Player
class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.volume = 0.85;
    this.audioMode = 'full'; // 'full' | 'effects' | 'silent'
    this.isUnlocked = false;
    this.activeAudioElement = null;
    this.soundEffects = {
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
  }

  // Initialize and unlock Web Audio context on user gesture
  unlockAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Play an inaudible 1ms buffer to satisfy strict browser autoplay policies
    if (this.audioCtx && this.audioCtx.state === 'running') {
      try {
        const buffer = this.audioCtx.createBuffer(1, 1, 22050);
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start(0);
      } catch (e) {}
    }

    this.isUnlocked = true;
    return true;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, Number(vol)));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  setAudioMode(mode) {
    this.audioMode = mode; // 'full', 'effects', 'silent'
  }

  setSoundEffects(effects) {
    if (effects && typeof effects === 'object') {
      this.soundEffects = { ...this.soundEffects, ...effects };
    }
  }

  isEffectEnabled(effectName) {
    if (this.audioMode === 'silent') return false;
    const effectMap = {
      'game-start': 'gameStart',
      'question-change': 'questionChange',
      'timer-start': 'timerStart',
      'countdown': 'countdown',
      'time-up': 'timeUp',
      'answer-reveal': 'answerReveal',
      'spoken-answer': 'spokenAnswer',
      'correct': 'correctAnswer',
      'wrong': 'wrongAnswer',
      'leaderboard': 'leaderboard',
      'tie-breaker': 'tieBreaker',
      'winner': 'winner'
    };
    const key = effectMap[effectName] || effectName;
    return this.soundEffects[key] !== false;
  }

  stopAll() {
    if (this.activeAudioElement) {
      this.activeAudioElement.pause();
      this.activeAudioElement = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // Play synthesized procedural sound effects
  playEffect(effectName) {
    if (!this.isEffectEnabled(effectName)) return;
    this.unlockAudio();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.connect(this.masterGain);

    switch (effectName) {
      case 'game-start': {
        // Triumphant rising brass chords
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          noteGain.gain.setValueAtTime(0, now + i * 0.08);
          noteGain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.65);
        });
        break;
      }

      case 'question-change': {
        // Futuristic whoosh sweep
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.35, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(filter);
        filter.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'timer-start': {
        // Two-tone start chime
        [880, 1320].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          noteGain.gain.setValueAtTime(0.4, now + idx * 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);

          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.3);
        });
        break;
      }

      case 'countdown': {
        // Sharp high-pitch tick pip for final 10 seconds
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now); // C6

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'time-up': {
        // Dramatic buzzer gong
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(140, now);
        osc2.frequency.setValueAtTime(130, now);

        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
        break;
      }

      case 'answer-reveal': {
        // Magical shimmering pentatonic sparkle
        const shimmerNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; // C5 to G6
        shimmerNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          noteGain.gain.setValueAtTime(0, now + idx * 0.07);
          noteGain.gain.linearRampToValueAtTime(0.3, now + idx * 0.07 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);

          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.55);
        });
        break;
      }

      case 'correct': {
        // Cheerful victory chime
        const victoryNotes = [523.25, 659.25, 783.99, 1046.5];
        victoryNotes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.09);

          noteGain.gain.setValueAtTime(0.35, now + i * 0.09);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.4);

          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.45);
        });
        break;
      }

      case 'wrong': {
        // Disappointment descending buzz
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);

        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }

      case 'leaderboard': {
        // Grand brass fanfare chords
        const chords = [
          [261.63, 329.63, 392.00], // C
          [349.23, 440.00, 523.25], // F
          [392.00, 493.88, 587.33], // G
          [523.25, 659.25, 783.99]  // High C
        ];
        chords.forEach((chord, step) => {
          chord.forEach(freq => {
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + step * 0.2);

            noteGain.gain.setValueAtTime(0.2, now + step * 0.2);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + step * 0.2 + (step === 3 ? 0.8 : 0.25));

            osc.connect(noteGain);
            noteGain.connect(gainNode);
            osc.start(now + step * 0.2);
            osc.stop(now + step * 0.2 + 0.9);
          });
        });
        break;
      }

      case 'tie-breaker': {
        // Cinematic tense pulse
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(110, now); // A2
        osc2.frequency.setValueAtTime(116.54, now); // Bb2 (tense clash)

        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
        break;
      }

      case 'winner': {
        // Epic championship fanfare
        const winnerNotes = [
          { f: 523.25, t: 0.0, d: 0.15 },
          { f: 523.25, t: 0.15, d: 0.15 },
          { f: 523.25, t: 0.3, d: 0.15 },
          { f: 659.25, t: 0.45, d: 0.3 },
          { f: 587.33, t: 0.8, d: 0.15 },
          { f: 659.25, t: 0.95, d: 0.15 },
          { f: 783.99, t: 1.15, d: 0.8 }
        ];

        winnerNotes.forEach(n => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now + n.t);

          noteGain.gain.setValueAtTime(0.35, now + n.t);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + n.t);
          osc.stop(now + n.t + n.d + 0.1);
        });
        break;
      }

      default:
        console.warn('Unknown effect:', effectName);
    }
  }

  // Play uploaded audio file (MP3/WAV/OGG)
  playAudioFile(url) {
    if (this.audioMode === 'silent' || !url) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        this.stopAll();
        const resolvedUrl = resolveMediaUrl(url);
        const audio = new Audio(resolvedUrl);
        audio.volume = this.volume;
        this.activeAudioElement = audio;

        audio.onended = () => {
          this.activeAudioElement = null;
          resolve();
        };
        audio.onerror = (err) => {
          console.warn('Audio file playback failed, skipping:', err);
          this.activeAudioElement = null;
          resolve();
        };

        audio.play().catch(e => {
          console.warn('Autoplay blocked or play failed:', e);
          resolve();
        });
      } catch (err) {
        console.error('playAudioFile exception:', err);
        resolve();
      }
    });
  }

  // Speak text using Web SpeechSynthesis (supports multilingual including Tamil & English)
  speakText(text, lang = 'en-US') {
    if (this.audioMode === 'silent' || this.audioMode === 'effects') {
      return Promise.resolve();
    }
    if (this.soundEffects && this.soundEffects.spokenAnswer === false) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !text) {
        return resolve();
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = lang.startsWith('ta') ? 0.9 : 0.95;
      utterance.pitch = 1.05;
      utterance.lang = lang;

      // Select matching voice for language
      const voices = window.speechSynthesis.getVoices();
      if (lang.startsWith('ta')) {
        const tamilVoice = voices.find(v => v.lang.startsWith('ta') || v.lang === 'ta-IN' || v.name.toLowerCase().includes('tamil'));
        if (tamilVoice) utterance.voice = tamilVoice;
      } else {
        const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Enhanced')));
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('Speech synthesis error, continuing game:', e);
        resolve();
      };

      // Timeout fallback in case browser speech gets stuck
      setTimeout(() => resolve(), 8000);

      window.speechSynthesis.speak(utterance);
    });
  }

  // Master handler for Answer Reveal based on question audio settings
  async handleAnswerRevealAudio({ answerText, answerAudio, audioType, answerAudioEnabled }) {
    if (!answerAudioEnabled || this.audioMode === 'silent') return;

    // Reveal chime effect first
    this.playEffect('answer-reveal');

    // Wait 400ms for reveal shimmer to complete before speech/audio
    await new Promise(r => setTimeout(r, 450));

    if (this.audioMode === 'effects') return;

    if (audioType === 'upload' && answerAudio) {
      await this.playAudioFile(answerAudio);
    } else if (audioType === 'both') {
      if (answerAudio) {
        await this.playAudioFile(answerAudio);
      }
      if (answerText && answerText !== 'Audio Answer') {
        await this.speakText(answerText);
      }
    } else if (answerAudio && (!answerText || answerText === 'Audio Answer' || answerText === 'Audio Reveal')) {
      // If external audio is provided without custom text, prioritize playing external audio
      await this.playAudioFile(answerAudio);
    } else if (audioType === 'tts' && answerText) {
      await this.speakText(answerText);
    } else if (answerAudio) {
      await this.playAudioFile(answerAudio);
    }
  }
}

export const audioEngine = new AudioEngine();
