const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateGenerateTasks, validateChat } = require('../middleware/validationMiddleware');

// Protect all /api/ai routes with JWT authentication
router.use(authenticate);

// GET /api/ai/test — Test Gemini API key and model connectivity
router.get('/test', aiController.testGeminiConnection);

// POST /api/ai/generate-tasks — Generate AI task breakdown
router.post('/generate-tasks', validateGenerateTasks, aiController.generateTasksWithAI);

// POST /api/ai/chat — Conversational AI assistant interaction
router.post('/chat', validateChat, aiController.chatWithAI);

module.exports = router;
