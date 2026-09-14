const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const ANSWERS_DIR = path.join(UPLOADS_DIR, 'answers');
const EFFECTS_DIR = path.join(UPLOADS_DIR, 'effects');

exports.uploadAudio = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded.' });
    }

    const folder = req.query.type === 'effect' ? 'effects' : 'answers';
    const fileUrl = `/uploads/${folder}/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Audio file uploaded successfully.',
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAudioFiles = (req, res) => {
  try {
    const type = req.query.type === 'effect' ? EFFECTS_DIR : ANSWERS_DIR;
    const folder = req.query.type === 'effect' ? 'effects' : 'answers';

    if (!fs.existsSync(type)) {
      return res.json({ success: true, files: [] });
    }

    const files = fs.readdirSync(type).map(filename => {
      const stats = fs.statSync(path.join(type, filename));
      return {
        filename,
        url: `/uploads/${folder}/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });

    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAudioFile = (req, res) => {
  try {
    const { filename } = req.params;
    const type = req.query.type === 'effect' ? EFFECTS_DIR : ANSWERS_DIR;
    const target = path.join(type, filename);

    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      return res.json({ success: true, message: 'Audio file removed.' });
    }
    res.status(404).json({ success: false, message: 'File not found.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
