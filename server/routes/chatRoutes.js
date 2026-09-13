const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

// Protect all chat routes with JWT authentication
router.use(authenticate);

// Conversations management
router.post('/conversations', chatController.createConversation);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversation);
router.delete('/conversations/:id', chatController.deleteConversation);

// Send message within a conversation
router.post('/conversations/:id/messages', chatController.sendMessage);

module.exports = router;
