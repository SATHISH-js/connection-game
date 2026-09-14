const { storage } = require('../services/storage');

exports.login = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: 'Host PIN is required.' });
    }

    const settings = await storage.getSettings();
    const validPin = settings.hostPin || process.env.HOST_PIN || '1234';

    if (pin.trim() !== validPin.trim()) {
      return res.status(401).json({ success: false, message: 'Incorrect PIN. Access denied.' });
    }

    try {
      const { Host } = require('../models');
      if (storage.isMongo()) {
        await Host.findOneAndUpdate(
          { username: 'host' },
          { $set: { pin: validPin, lastLogin: new Date() } },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      // Non-blocking
    }

    res.json({
      success: true,
      message: 'Host authentication successful.',
      token: pin.trim(),
      role: 'host'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login processing error' });
  }
};

exports.verify = (req, res) => {
  res.json({ success: true, message: 'Host session is valid.' });
};
