const { storage } = require('../services/storage');

async function requireHostAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const pinHeader = req.headers['x-host-pin'];

    let providedPin = pinHeader;
    if (!providedPin && authHeader && authHeader.startsWith('Bearer ')) {
      providedPin = authHeader.split(' ')[1];
    }

    if (!providedPin) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please enter Host PIN.' });
    }

    // Get current host pin from settings or fallback to process.env.HOST_PIN
    const settings = await storage.getSettings();
    const validPin = settings.hostPin || process.env.HOST_PIN || '1234';

    if (providedPin.trim() !== validPin.trim()) {
      return res.status(403).json({ success: false, message: 'Invalid Host PIN. Access denied.' });
    }

    req.isHost = true;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, message: 'Internal server authorization error' });
  }
}

module.exports = { requireHostAuth };
