const mongoose = require('mongoose');

const GameSettingSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
  eventName: { type: String, default: 'CONNECTION GAME' },
  eventSubtitle: { type: String, default: 'Think. Connect. Win.' },
  defaultTimer: { type: Number, default: 30 },
  round1Timer: { type: Number, default: 30 },
  round2Timer: { type: Number, default: 20 },
  round3Timer: { type: Number, default: 15 },
  autoStartTimerOnNext: { type: Boolean, default: true },
  hostPin: { type: String, default: '1234' },
  audioMode: { type: String, enum: ['full', 'effects', 'silent'], default: 'full' },
  masterVolume: { type: Number, default: 0.85 },
  effectsEnabled: { type: Boolean, default: true },
  spokenAnswerEnabled: { type: Boolean, default: true },
  countdownSoundEnabled: { type: Boolean, default: true },
  soundEffects: {
    gameStart: { type: Boolean, default: true },
    questionChange: { type: Boolean, default: true },
    timerStart: { type: Boolean, default: true },
    countdown: { type: Boolean, default: true },
    timeUp: { type: Boolean, default: true },
    answerReveal: { type: Boolean, default: true },
    spokenAnswer: { type: Boolean, default: true },
    correctAnswer: { type: Boolean, default: true },
    wrongAnswer: { type: Boolean, default: true },
    leaderboard: { type: Boolean, default: true },
    tieBreaker: { type: Boolean, default: true },
    winner: { type: Boolean, default: true }
  },
  autoRotateLeaderboard: { type: Boolean, default: true },
  leaderboardRotationTime: { type: Number, default: 6 },
  collegeName: { type: String, default: 'ANNAPOORANA ENGINEEING COLLEGE (AUTONOMOUS)' },
  departmentName: { type: String, default: 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING' },
  organisedBy: { type: String, default: 'CODEX — AURA 2026' },
  gameRules: [{ type: String }],
  landingCountdownMinutes: { type: Number, default: 15 },
  landingCountdownTarget: { type: Number, default: null },
  landingCountdownActive: { type: Boolean, default: false },
  displayFullscreen: { type: Boolean, default: false },
  theme: { type: String, default: 'dark' },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('GameSetting', GameSettingSchema);
