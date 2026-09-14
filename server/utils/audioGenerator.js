const fs = require('fs');
const path = require('path');

// Helper to create a valid 16-bit PCM Mono WAV buffer with synth tone
function createWavBuffer(frequencies, durationSeconds = 0.5, sampleRate = 44100, shape = 'sine') {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // num channels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const freqArray = Array.isArray(frequencies) ? frequencies : [frequencies];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    freqArray.forEach((freq, idx) => {
      // Basic frequency synthesis
      let val = Math.sin(2 * Math.PI * freq * t);
      if (shape === 'saw') val = (2 * (t * freq - Math.floor(t * freq + 0.5)));
      else if (shape === 'triangle') val = 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1;

      // Envelope: attack and exponential decay
      const env = Math.exp(-3 * (t / durationSeconds));
      sample += (val * env) / freqArray.length;
    });

    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

function generateDefaultAudioFiles() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const effectsDir = path.join(uploadsDir, 'effects');
  const answersDir = path.join(uploadsDir, 'answers');

  [uploadsDir, effectsDir, answersDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const effects = [
    { name: 'game-start.wav', freqs: [261.63, 329.63, 392.00, 523.25], dur: 0.8, shape: 'triangle' },
    { name: 'question-change.wav', freqs: [440, 880], dur: 0.35, shape: 'sine' },
    { name: 'timer-start.wav', freqs: [880, 1320], dur: 0.4, shape: 'sine' },
    { name: 'countdown.wav', freqs: [1046.5], dur: 0.15, shape: 'sine' },
    { name: 'time-up.wav', freqs: [140, 130], dur: 1.2, shape: 'saw' },
    { name: 'answer-reveal.wav', freqs: [523.25, 659.25, 783.99, 1046.5], dur: 0.7, shape: 'sine' },
    { name: 'correct.wav', freqs: [523.25, 659.25, 783.99, 1046.5], dur: 0.5, shape: 'triangle' },
    { name: 'wrong.wav', freqs: [220, 110], dur: 0.6, shape: 'saw' },
    { name: 'leaderboard.wav', freqs: [349.23, 440.00, 523.25, 659.25], dur: 0.9, shape: 'triangle' },
    { name: 'tie-breaker.wav', freqs: [110, 116.54], dur: 1.2, shape: 'saw' },
    { name: 'winner.wav', freqs: [523.25, 659.25, 783.99, 1046.5, 1318.5], dur: 1.5, shape: 'triangle' }
  ];

  effects.forEach(ef => {
    const filePath = path.join(effectsDir, ef.name);
    if (!fs.existsSync(filePath)) {
      const buf = createWavBuffer(ef.freqs, ef.dur, 44100, ef.shape);
      fs.writeFileSync(filePath, buf);
    }
  });

  const answers = [
    { name: 'gravity.wav', freqs: [440, 554.37, 659.25], dur: 0.8 },
    { name: 'rainbow.wav', freqs: [523.25, 659.25, 783.99], dur: 0.8 },
    { name: 'computer.wav', freqs: [392, 493.88, 587.33], dur: 0.8 }
  ];

  answers.forEach(ans => {
    const filePath = path.join(answersDir, ans.name);
    if (!fs.existsSync(filePath)) {
      const buf = createWavBuffer(ans.freqs, ans.dur, 44100, 'sine');
      fs.writeFileSync(filePath, buf);
    }
  });

  console.log('✅ Generated sample audio WAV files for effects/ and answers/');
}

module.exports = {
  createWavBuffer,
  generateDefaultAudioFiles
};
