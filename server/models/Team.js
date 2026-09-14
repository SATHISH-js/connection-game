const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  teamNumber: { type: Number, required: true },
  teamName: { type: String, required: true },
  character: { type: String, default: '🦁' },
  characterName: { type: String, default: 'Lion' },
  members: [{ type: String }],
  collegeName: { type: String, default: '' },
  round1Score: { type: Number, default: 0 },
  round2Score: { type: Number, default: 0 },
  tieBreakerScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', TeamSchema);
