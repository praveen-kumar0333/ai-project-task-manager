const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const { authenticate } = require('../middleware/authMiddleware');

// Protect voice synthesis routes with JWT authentication
router.use(authenticate);

// POST /api/voice/speak
router.post('/speak', voiceController.speakText);

// GET /api/voice/status
router.get('/status', voiceController.getVoiceStatus);

module.exports = router;
