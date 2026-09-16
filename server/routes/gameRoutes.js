const express = require('express');
const router = express.Router();
const { requireHostAuth } = require('../middleware/auth');
const gameController = require('../controllers/gameController');

router.get('/', gameController.getGameState);
router.post('/start', requireHostAuth, gameController.startGame);
router.post('/stop', requireHostAuth, gameController.stopGame);
router.post('/new', requireHostAuth, gameController.newGame);
router.post('/next', requireHostAuth, gameController.nextQuestion);
router.post('/previous', requireHostAuth, gameController.previousQuestion);
router.post('/select-question', requireHostAuth, gameController.selectQuestion);
router.post('/stage-view', requireHostAuth, gameController.setStageView);
router.post('/qualifiers', requireHostAuth, gameController.setQualifiers);
router.post('/announce-round', requireHostAuth, gameController.announceRound);
router.post('/reveal', requireHostAuth, gameController.revealAnswer);
router.post('/hide-answer', requireHostAuth, gameController.hideAnswer);
router.post('/reveal-clue', requireHostAuth, gameController.revealNextClue);
router.post('/reveal-all-clues', requireHostAuth, gameController.revealAllClues);
router.post('/round', requireHostAuth, gameController.setRound);
router.post('/end-round', requireHostAuth, gameController.endRound);
router.post('/end', requireHostAuth, gameController.endGame);
router.post('/reset', requireHostAuth, gameController.resetGame);
router.post('/reseed', requireHostAuth, gameController.reseedData);

module.exports = router;
