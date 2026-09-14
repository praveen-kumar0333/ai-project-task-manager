const chatService = require('../services/chatService');
const AppError = require('../utils/appError');

/**
 * POST /api/chat/conversations
 * Start a new conversation for the authenticated user.
 */
async function createConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { title } = req.body || {};

    const conversation = await chatService.createConversation(userId, title);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/chat/conversations
 * List all conversations owned by the authenticated user.
 */
async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;
    const conversations = await chatService.getUserConversations(userId);

    res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: conversations
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/chat/conversations/:id
 * Retrieve a specific conversation with all messages, enforcing user ownership.
 */
async function getConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    if (isNaN(conversationId)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    const conversation = await chatService.getConversationDetails(conversationId, userId);

    res.status(200).json({
      success: true,
      message: 'Conversation details retrieved successfully',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/chat/conversations/:id
 * Delete a conversation and its messages, enforcing user ownership.
 */
async function deleteConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    if (isNaN(conversationId)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    await chatService.deleteConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/chat/conversations/:id/messages
 * Send a message in a conversation, triggers RAG retrieval and Gemini AI completion.
 */
async function sendMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const conversationId = parseInt(req.params.id, 10);
    const { message } = req.body || {};

    if (isNaN(conversationId)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return next(new AppError('Message is required and cannot be empty', 400));
    }

    const result = await chatService.sendMessage({
      conversationId,
      userId,
      userMessage: message
    });

    res.status(200).json({
      success: true,
      message: 'Message processed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  sendMessage
};
