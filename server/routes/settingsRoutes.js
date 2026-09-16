const express = require('express');
const router = express.Router();
const { requireHostAuth } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getSettings);
router.get('/db-status', settingsController.getDbStatus);
router.get('/keep-alive', settingsController.getKeepAliveStatus);
router.put('/keep-alive', requireHostAuth, settingsController.updateKeepAliveConfig);
router.post('/keep-alive/test', requireHostAuth, settingsController.testKeepAlivePing);
router.put('/', requireHostAuth, settingsController.updateSettings);

module.exports = router;

