const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  round: { type: Number, required: true },
  pointsDelta: { type: Number, required: true },
  previousScore: { type: Number, default: 0 },
  newScore: { type: Number, default: 0 },
  reason: { type: String, default: 'Question Points' },
  updatedBy: { type: String, default: 'Host' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', ScoreSchema);
