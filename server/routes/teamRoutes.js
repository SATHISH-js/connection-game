const express = require('express');
const router = express.Router();
const { requireHostAuth } = require('../middleware/auth');
const teamController = require('../controllers/teamController');

router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);
router.post('/', requireHostAuth, teamController.createTeam);
router.put('/:id', requireHostAuth, teamController.updateTeam);
router.delete('/:id', requireHostAuth, teamController.deleteTeam);
router.put('/:id/score', requireHostAuth, teamController.updateTeamScore);
router.post('/reset-scores', requireHostAuth, teamController.resetAllScores);

module.exports = router;
