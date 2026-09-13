const conversationService = require('../services/conversationService');
const AppError = require('../utils/appError');

/**
 * POST /api/conversations
 * Creates a new conversation thread for the authenticated user.
 */
async function createConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const conversation = await conversationService.createConversation(userId, title);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: {
        conversation
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/conversations
 * Retrieves all conversations belonging to the authenticated user.
 */
async function getUserConversations(req, res, next) {
  try {
    const userId = req.user.id;
    const conversations = await conversationService.getUserConversations(userId);

    res.status(200).json({
      success: true,
      data: {
        conversations
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/conversations/:id
 * Retrieves a single conversation by ID with its messages in chronological order.
 * Strictly verifies ownership.
 */
async function getConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    if (isNaN(conversationId) || conversationId <= 0) {
      return next(new AppError('Conversation not found', 404));
    }

    const conversation = await conversationService.getConversationById(conversationId, userId);

    res.status(200).json({
      success: true,
      data: {
        conversation
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/conversations/:id
 * Deletes a conversation owned by the authenticated user.
 */
async function deleteConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    if (isNaN(conversationId) || conversationId <= 0) {
      return next(new AppError('Conversation not found', 404));
    }

    await conversationService.deleteConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createConversation,
  getUserConversations,
  getConversation,
  deleteConversation
};
