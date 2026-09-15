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
    if (updates.round1Timer !== undefined) updates.round1Timer = Math.max(5, Math.min(60, Number(updates.round1Timer) || 30));
    if (updates.round2Timer !== undefined) updates.round2Timer = Math.max(5, Math.min(60, Number(updates.round2Timer) || 20));
    if (updates.round3Timer !== undefined) updates.round3Timer = Math.max(5, Math.min(60, Number(updates.round3Timer) || 15));

    const updated = await storage.updateSettings(updates);

    // If the timer is not running, update current timer duration to match the round setting immediately
    const gameState = await storage.getGameState();
    if (gameState.timer && gameState.timer.status !== 'RUNNING') {
      const r = Number(gameState.currentRound) || 1;
      let newDur = 30;
      if (r === 1) newDur = Number(updated.round1Timer) || 30;
      else if (r === 2) newDur = Number(updated.round2Timer) || 20;
      else if (r === 3) newDur = Number(updated.round3Timer) || 15;
      newDur = Math.max(5, Math.min(60, newDur));

      await storage.updateGameState({
        timer: {
          ...gameState.timer,
          duration: newDur
        }
      });
    }

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
