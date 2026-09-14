const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireHostAuth } = require('../middleware/auth');
const audioController = require('../controllers/audioController');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const ANSWERS_DIR = path.join(UPLOADS_DIR, 'answers');
const EFFECTS_DIR = path.join(UPLOADS_DIR, 'effects');

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type === 'effect' ? EFFECTS_DIR : ANSWERS_DIR;
    cb(null, type);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files (MP3, WAV, OGG, M4A, AAC) are supported'));
    }
  }
});

router.post('/upload', requireHostAuth, upload.single('audio'), audioController.uploadAudio);
router.get('/files', audioController.getAudioFiles);
router.delete('/:filename', requireHostAuth, audioController.deleteAudioFile);

module.exports = router;
