const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  gameId: { type: String, default: 'main_game', unique: true },
  title: { type: String, default: 'CONNECTION GAME' },
  activeRound: { type: Number, default: 1 },
  totalRounds: { type: Number, default: 3 },
  status: { type: String, enum: ['READY', 'RUNNING', 'PAUSED', 'FINISHED'], default: 'READY' },
  currentQuestionId: { type: String, default: null },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', GameSchema);
