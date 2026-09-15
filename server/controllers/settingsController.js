const { storage } = require('../services/storage');
const { broadcastStateChange } = require('../socket/gameSocket');

exports.getSettings = async (req, res) => {
  try {
    const settings = await storage.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const updated = await storage.updateSettings(updates);
    broadcastStateChange();
    res.json({ success: true, data: updated, message: 'Settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDbStatus = (req, res) => {
  try {
    const status = storage.getDbStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
