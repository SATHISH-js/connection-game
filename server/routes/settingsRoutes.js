const express = require('express');
const router = express.Router();
const { requireHostAuth } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getSettings);
router.get('/db-status', settingsController.getDbStatus);
router.put('/', requireHostAuth, settingsController.updateSettings);

module.exports = router;
