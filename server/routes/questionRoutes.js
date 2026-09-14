const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireHostAuth } = require('../middleware/auth');
const questionController = require('../controllers/questionController');

const MEDIA_DIR = path.join(__dirname, '..', 'uploads', 'media');
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MEDIA_DIR),
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video/image
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ogg', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image (JPG, PNG, GIF, WEBP) or video (MP4, WEBM) files are allowed'));
    }
  }
});

router.get('/', questionController.getQuestions);
router.get('/:id', questionController.getQuestionById);
router.post('/upload-media', requireHostAuth, mediaUpload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No media file provided' });
  const relativeUrl = `/uploads/media/${req.file.filename}`;
  const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].includes(path.extname(req.file.filename).toLowerCase());
  res.json({
    success: true,
    url: relativeUrl,
    type: isVideo ? 'video' : 'image',
    filename: req.file.filename
  });
});
router.post('/', requireHostAuth, questionController.createQuestion);
router.put('/:id', requireHostAuth, questionController.updateQuestion);
router.delete('/:id', requireHostAuth, questionController.deleteQuestion);
router.post('/:id/duplicate', requireHostAuth, questionController.duplicateQuestion);
router.post('/reorder', requireHostAuth, questionController.reorderQuestion);

module.exports = router;

