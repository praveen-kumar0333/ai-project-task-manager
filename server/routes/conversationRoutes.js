const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateCreateConversation } = require('../middleware/validationMiddleware');

// All conversation routes require JWT authentication
router.use(authenticate);

// POST /api/conversations - Create a new conversation
router.post('/', validateCreateConversation, conversationController.createConversation);

// GET /api/conversations - List all conversations for the authenticated user
router.get('/', conversationController.getUserConversations);

// GET /api/conversations/:id - Get conversation details and messages (chronological)
router.get('/:id', conversationController.getConversation);

// DELETE /api/conversations/:id - Delete a conversation and its messages
router.delete('/:id', conversationController.deleteConversation);

module.exports = router;
