const express = require('express');
const router = express.Router();
const { requireHostAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/verify', requireHostAuth, authController.verify);

module.exports = router;
