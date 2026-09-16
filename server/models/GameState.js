const mongoose = require('mongoose');

const GameStateSchema = new mongoose.Schema({
  key: { type: String, default: 'active_game_state', unique: true },
  currentRound: { type: Number, default: 1 },
  currentQuestionIndex: { type: Number, default: 0 },
  gameStatus: { type: String, enum: ['READY', 'RUNNING', 'PAUSED', 'FINISHED'], default: 'READY' },
  timer: {
    duration: { type: Number, default: 30 },
    startedAt: { type: Number, default: null },
    pausedAt: { type: Number, default: null },
    status: { type: String, enum: ['IDLE', 'RUNNING', 'PAUSED', 'FINISHED'], default: 'IDLE' }
  },
  answerRevealed: { type: Boolean, default: false },
  revealedCluesCount: { type: Number, default: 4 },
  leaderboardVisible: { type: Boolean, default: false },
  podiumVisible: { type: Boolean, default: false },
  tieDetected: { type: Boolean, default: false },
  activeTieBreakerTeams: [{ type: String }],
  audioMode: { type: String, default: 'full' },
  masterVolume: { type: Number, default: 0.85 },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('GameState', GameStateSchema);
