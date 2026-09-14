const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  round: { type: Number, required: true }, // 1, 2, or 3
  questionNumber: { type: Number, required: true },
  title: { type: String, required: true },
  clues: [{ type: mongoose.Schema.Types.Mixed, default: [] }],
  answerText: { type: String, default: '' },
  englishText: { type: String, default: '' },
  tamilText: { type: String, default: '' },
  ttsClue: { type: String, default: '' },
  revealAllAtStart: { type: Boolean, default: false },
  points: { type: Number, default: 10 },
  timerDuration: { type: Number, default: 30 },
  answerAudio: { type: String, default: null },
  answerAudioEnabled: { type: Boolean, default: true },
  audioType: { type: String, enum: ['none', 'upload', 'tts', 'both'], default: 'tts' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('Question', QuestionSchema);
