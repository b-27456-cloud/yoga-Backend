/**
 * Session Routes
 * Mount path: /api/v1/sessions
 */

const express = require('express');
const sessionController = require('./session.controller');
const { verifyToken, requireRegistered } = require('../../middleware/auth');

const router = express.Router();

// All session routes require authentication and a registered MongoDB profile
router.use(verifyToken, requireRegistered);

// Core Session Flow
router.post('/start', sessionController.startSession);
router.post('/:id/log-frame', sessionController.logFrame);
router.post('/:id/end', sessionController.endSession);

// History and details
router.get('/user/:user_id', sessionController.getUserHistory);
router.get('/:id', sessionController.getSessionById);

module.exports = router;
