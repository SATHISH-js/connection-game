const { v4: uuidv4 } = require('uuid');
const { storage } = require('../services/storage');
const { broadcastStateChange } = require('../socket/gameSocket');

exports.getQuestions = async (req, res) => {
  try {
    const round = req.query.round ? Number(req.query.round) : null;
    const questions = await storage.getQuestions(round);
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await storage.getQuestion(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sanitizeClue = (c) => {
  if (!c) return null;
  if (typeof c === 'object') {
    const text = c.text ? String(c.text).trim() : '';
    const image = c.image ? String(c.image).trim() : '';
    const video = c.video ? String(c.video).trim() : '';
    const emoji = c.emoji ? String(c.emoji).trim() : '';
    // A clue is valid if it has at least one of text, image, video, or emoji
    if (!text && !image && !video && !emoji) return null;
    return {
      text,
      image,
      video,
      mediaType: c.mediaType || (video ? 'video' : image ? 'image' : 'text'),
      emoji
    };
  }
  const str = String(c).trim();
  return str.length > 0 ? { text: str, image: '', video: '', mediaType: 'text' } : null;
};

exports.createQuestion = async (req, res) => {
  try {
    const {
      round,
      questionNumber,
      title,
      clues,
      answerText,
      points,
      timerDuration,
      answerAudio,
      answerAudioEnabled,
      audioType,
      englishText,
      tamilText,
      ttsClue,
      revealAllAtStart
    } = req.body;

    if (!title || (!answerText && !answerAudio)) {
      return res.status(400).json({
        success: false,
        message: 'Title and either Answer Text or Answer Audio file are required.'
      });
    }

    // Process clues; if question is a text passage question without separate cards, create default clue
    let cleanClues = Array.isArray(clues) ? clues.map(sanitizeClue).filter(Boolean) : [];
    if (cleanClues.length === 0) {
      if (englishText || tamilText || ttsClue) {
        cleanClues = [{
          text: ttsClue || englishText || tamilText || 'Passage Question',
          image: '',
          video: '',
          mediaType: 'text'
        }];
      } else {
        return res.status(400).json({
          success: false,
          message: 'At least one clue (text or image/video) is required.'
        });
      }
    }

    const roundNum = Number(round) || 1;
    const existing = await storage.getQuestions(roundNum);
    const qNum = questionNumber
      ? Number(questionNumber)
      : (existing.length > 0 ? Math.max(...existing.map(q => q.questionNumber || 0)) + 1 : 1);

    const resolvedAudioType = audioType || (answerAudio ? 'upload' : 'tts');

    const newQuestion = {
      id: `q-r${roundNum}-${uuidv4().substring(0, 8)}`,
      round: roundNum,
      questionNumber: qNum,
      title: title.trim(),
      clues: cleanClues,
      answerText: (answerText || (answerAudio ? 'Audio Answer' : '')).trim(),
      englishText: englishText ? String(englishText).trim() : '',
      tamilText: tamilText ? String(tamilText).trim() : '',
      ttsClue: ttsClue ? String(ttsClue).trim() : '',
      revealAllAtStart: Boolean(revealAllAtStart),
      points: Number(points) || 10,
      timerDuration: Number(timerDuration) || 30,
      answerAudio: answerAudio || null,
      answerAudioEnabled: answerAudioEnabled !== undefined ? Boolean(answerAudioEnabled) : true,
      audioType: resolvedAudioType,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const saved = await storage.createQuestion(newQuestion);
    broadcastStateChange();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const {
      round,
      questionNumber,
      title,
      clues,
      answerText,
      points,
      timerDuration,
      answerAudio,
      answerAudioEnabled,
      audioType,
      englishText,
      tamilText,
      ttsClue,
      revealAllAtStart
    } = req.body;

    const updates = {};
    if (round !== undefined) updates.round = Number(round);
    if (questionNumber !== undefined) updates.questionNumber = Number(questionNumber);
    if (title !== undefined) updates.title = title.trim();
    if (clues !== undefined && Array.isArray(clues)) {
      updates.clues = clues.map(sanitizeClue).filter(Boolean);
    }
    if (answerText !== undefined) updates.answerText = answerText.trim();
    if (englishText !== undefined) updates.englishText = String(englishText).trim();
    if (tamilText !== undefined) updates.tamilText = String(tamilText).trim();
    if (ttsClue !== undefined) updates.ttsClue = String(ttsClue).trim();
    if (revealAllAtStart !== undefined) updates.revealAllAtStart = Boolean(revealAllAtStart);
    if (points !== undefined) updates.points = Number(points);
    if (timerDuration !== undefined) updates.timerDuration = Number(timerDuration);
    if (answerAudio !== undefined) updates.answerAudio = answerAudio;
    if (answerAudioEnabled !== undefined) updates.answerAudioEnabled = Boolean(answerAudioEnabled);
    if (audioType !== undefined) updates.audioType = audioType;

    const updated = await storage.updateQuestion(req.params.id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'Question not found' });

    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const deleted = await storage.deleteQuestion(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Question not found' });

    broadcastStateChange();
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.duplicateQuestion = async (req, res) => {
  try {
    const original = await storage.getQuestion(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Question not found' });

    const existing = await storage.getQuestions(original.round);
    const nextQNum = existing.length > 0 ? Math.max(...existing.map(q => q.questionNumber || 0)) + 1 : 1;

    const duplicate = {
      ...original,
      id: `q-r${original.round}-${uuidv4().substring(0, 8)}`,
      questionNumber: nextQNum,
      title: `${original.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    delete duplicate._id;

    const saved = await storage.createQuestion(duplicate);
    broadcastStateChange();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reorderQuestion = async (req, res) => {
  try {
    const { id, direction } = req.body; // 'up' or 'down'
    const currentQ = await storage.getQuestion(id);
    if (!currentQ) return res.status(404).json({ success: false, message: 'Question not found' });

    const roundQuestions = await storage.getQuestions(currentQ.round);
    const currentIdx = roundQuestions.findIndex(q => q.id === id);
    if (currentIdx === -1) return res.status(404).json({ success: false, message: 'Question not found in round' });

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= roundQuestions.length) {
      return res.json({ success: true, message: 'Question is already at the boundary' });
    }

    const targetQ = roundQuestions[targetIdx];
    const tempNum = currentQ.questionNumber;
    await storage.updateQuestion(currentQ.id, { questionNumber: targetQ.questionNumber });
    await storage.updateQuestion(targetQ.id, { questionNumber: tempNum });

    broadcastStateChange();
    res.json({ success: true, message: 'Questions reordered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportQuestions = async (req, res) => {
  try {
    const questions = await storage.getQuestions();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: questions.length,
      data: questions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.importQuestions = async (req, res) => {
  try {
    const rawData = req.body;
    const questions = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.questions) ? rawData.questions : (Array.isArray(rawData.data) ? rawData.data : null));

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload: Array of questions required' });
    }

    // Sanitize imported questions
    const sanitized = questions.map((q, idx) => {
      const roundNum = Number(q.round) || 1;
      return {
        id: q.id || `q-r${roundNum}-${uuidv4().substring(0, 8)}`,
        round: roundNum,
        questionNumber: Number(q.questionNumber) || (idx + 1),
        title: (q.title || `Question ${idx + 1}`).trim(),
        clues: Array.isArray(q.clues) ? q.clues.map(sanitizeClue).filter(Boolean) : [],
        answerText: (q.answerText || '').trim(),
        englishText: q.englishText ? String(q.englishText).trim() : '',
        tamilText: q.tamilText ? String(q.tamilText).trim() : '',
        ttsClue: q.ttsClue ? String(q.ttsClue).trim() : '',
        revealAllAtStart: Boolean(q.revealAllAtStart),
        points: Number(q.points) || 10,
        timerDuration: Number(q.timerDuration) || 30,
        answerAudio: q.answerAudio || null,
        answerAudioEnabled: q.answerAudioEnabled !== undefined ? Boolean(q.answerAudioEnabled) : true,
        audioType: q.audioType || 'tts',
        updatedAt: new Date()
      };
    });

    await storage.importQuestions(sanitized);
    broadcastStateChange();
    res.json({
      success: true,
      message: `Successfully imported ${sanitized.length} questions into database.`,
      count: sanitized.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

