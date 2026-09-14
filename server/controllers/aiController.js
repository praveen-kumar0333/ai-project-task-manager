const { generateTaskBreakdown, testGeminiApiConnection, generateChatResponse } = require('../services/geminiService');
const conversationService = require('../services/conversationService');

/**
 * POST /api/ai/chat
 * Multi-turn conversational AI chat endpoint.
 * Handles automatic conversation creation, workspace grounding, and message persistence.
 * Requires authenticated user.
 */
async function chatWithAI(req, res, next) {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    let { conversationId } = req.body;

    // 1. Handle conversation creation or ownership verification
    if (!conversationId) {
      // Auto-generate a safe conversation title from the first message
      const generatedTitle = message.length > 50
        ? message.slice(0, 47).trim() + '...'
        : message;

      const newConversation = await conversationService.createConversation(userId, generatedTitle);
      conversationId = newConversation.id;
    } else {
      // Verify that conversation exists and belongs to the authenticated user
      await conversationService.getConversationById(conversationId, userId);
    }

    // 2. Persist user message to the database
    await conversationService.saveMessage(conversationId, 'user', message);

    // 3. Retrieve recent conversation history (excluding the message just saved)
    const recentHistory = await conversationService.getRecentConversationHistory(conversationId, 12);
    const priorHistory = recentHistory.slice(0, -1); // Exclude current turn

    // 4. Retrieve workspace context intelligently if question is project/task related
    const workspaceContext = await conversationService.getRelevantWorkspaceContext(userId, message);

    // 5. Generate conversational AI response
    const assistantContent = await generateChatResponse({
      history: priorHistory,
      message,
      workspaceContext
    });

    // 6. Persist assistant response to the database
    const savedAssistantMsg = await conversationService.saveMessage(
      conversationId,
      'assistant',
      assistantContent
    );

    // 7. Update conversation timestamp
    await conversationService.updateConversationTimestamp(conversationId);

    res.status(200).json({
      success: true,
      message: 'AI response generated successfully',
      data: {
        conversationId,
        response: {
          id: savedAssistantMsg.id,
          role: 'assistant',
          content: assistantContent,
          createdAt: savedAssistantMsg.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/test
 * Verifies that the configured Gemini API key is present and working.
 * Requires authenticated user.
 */
async function testGeminiConnection(req, res, next) {
  try {
    const result = await testGeminiApiConnection();

    res.status(200).json({
      success: true,
      message: 'Gemini API connection is working',
      data: {
        model: result.model,
        response: result.response
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/generate-tasks
 * Generates structured task suggestions for a project using Google Gemini AI.
 * Requires authenticated user.
 */
async function generateTasksWithAI(req, res, next) {
  try {
    const { projectName, projectDescription, requirements } = req.body;

    const result = await generateTaskBreakdown({
      projectName,
      projectDescription,
      requirements
    });

    res.status(200).json({
      success: true,
      message: 'Tasks generated successfully',
      data: {
        tasks: result.tasks
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  testGeminiConnection,
  generateTasksWithAI,
  chatWithAI
};
