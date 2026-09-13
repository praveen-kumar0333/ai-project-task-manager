const { pool } = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Creates a new conversation for an authenticated user.
 *
 * @param {number} userId - Authenticated user ID
 * @param {string} [title='New Conversation'] - Conversation title
 * @returns {Promise<object>} Created conversation object
 */
async function createConversation(userId, title = 'New Conversation') {
  const cleanTitle = (title || 'New Conversation').trim().slice(0, 255) || 'New Conversation';

  const query = `
    INSERT INTO conversations (user_id, title)
    VALUES (?, ?)
  `;

  const [result] = await pool.execute(query, [userId, cleanTitle]);
  const conversationId = result.insertId;

  const now = new Date().toISOString();
  return {
    id: conversationId,
    title: cleanTitle,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Retrieves all conversations belonging to the authenticated user.
 * Ordered by updated_at DESC.
 *
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<Array<object>>} List of conversations
 */
async function getUserConversations(userId) {
  const query = `
    SELECT 
      c.id,
      c.title,
      c.created_at as createdAt,
      c.updated_at as updatedAt,
      (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as lastMessage,
      (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id) as messageCount
    FROM conversations c
    WHERE c.user_id = ?
    ORDER BY c.updated_at DESC, c.id DESC
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows.map(r => ({
    id: r.id,
    title: r.title,
    lastMessage: r.lastMessage ? r.lastMessage.slice(0, 80) : '',
    messageCount: Number(r.messageCount) || 0,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString(),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : new Date(r.updatedAt).toISOString()
  }));
}

/**
 * Retrieves a single conversation by ID with all its messages in chronological order.
 * Strictly verifies authenticated user ownership.
 *
 * @param {number} conversationId - Conversation ID
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<object>} Conversation with messages array
 */
async function getConversationById(conversationId, userId) {
  const [convRows] = await pool.execute(
    'SELECT id, user_id as userId, title, created_at as createdAt, updated_at as updatedAt FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId]
  );

  if (convRows.length === 0) {
    throw new AppError('Conversation not found', 404);
  }

  const conversation = convRows[0];

  const [messageRows] = await pool.execute(
    'SELECT id, conversation_id as conversationId, role, content, created_at as createdAt FROM chat_messages WHERE conversation_id = ? ORDER BY id ASC',
    [conversationId]
  );

  const formattedMessages = messageRows.map(m => ({
    id: m.id,
    conversationId: m.conversationId,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date(m.createdAt).toISOString()
  }));

  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt instanceof Date ? conversation.createdAt.toISOString() : new Date(conversation.createdAt).toISOString(),
    updatedAt: conversation.updatedAt instanceof Date ? conversation.updatedAt.toISOString() : new Date(conversation.updatedAt).toISOString(),
    messages: formattedMessages
  };
}

/**
 * Deletes a conversation belonging to the authenticated user.
 * Associated chat_messages are automatically removed via ON DELETE CASCADE.
 *
 * @param {number} conversationId - Conversation ID
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<boolean>}
 */
async function deleteConversation(conversationId, userId) {
  const [convRows] = await pool.execute(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId]
  );

  if (convRows.length === 0) {
    throw new AppError('Conversation not found', 404);
  }

  await pool.execute('DELETE FROM conversations WHERE id = ? AND user_id = ?', [conversationId, userId]);
  return true;
}

/**
 * Saves a new chat message (user or assistant) into the database.
 *
 * @param {number} conversationId - Target conversation ID
 * @param {'user'|'assistant'} role - Message role
 * @param {string} content - Message text content
 * @returns {Promise<object>} Created message object
 */
async function saveMessage(conversationId, role, content) {
  const [result] = await pool.execute(
    'INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, ?, ?)',
    [conversationId, role, content]
  );

  return {
    id: result.insertId,
    conversationId,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

/**
 * Updates the conversation updated_at timestamp, and optionally title.
 *
 * @param {number} conversationId - Conversation ID
 * @param {string|null} [newTitle=null] - Optional updated title
 */
async function updateConversationTimestamp(conversationId, newTitle = null) {
  if (newTitle) {
    await pool.execute(
      'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newTitle.trim().slice(0, 255), conversationId]
    );
  } else {
    await pool.execute(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );
  }
}

/**
 * Retrieves recent message history for context windowing.
 * Returns messages in chronological order (oldest to newest).
 *
 * @param {number} conversationId - Conversation ID
 * @param {number} [limit=10] - Number of recent messages to retrieve
 * @returns {Promise<Array<object>>} Recent messages in chronological order
 */
async function getRecentConversationHistory(conversationId, limit = 10) {
  const [rows] = await pool.execute(
    'SELECT id, role, content FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?',
    [conversationId, limit]
  );

  // Reverse so the history is oldest -> newest
  return rows.reverse().map(r => ({
    id: r.id,
    role: r.role,
    content: r.content
  }));
}

/**
 * Intelligently retrieves authenticated user workspace context (projects & tasks)
 * only when user queries are relevant to projects, tasks, or planning.
 *
 * @param {number} userId - Authenticated user ID
 * @param {string} message - User query message
 * @returns {Promise<string|null>} Formatted context string or null if not relevant
 */
async function getRelevantWorkspaceContext(userId, message) {
  if (!message || typeof message !== 'string') return null;

  const workspaceKeywords = /(project|task|work on|sprint|pending|todo|priority|deadline|due|status|progress|backlog)/i;
  if (!workspaceKeywords.test(message)) {
    return null; // Keep simple greetings and general queries light and fast
  }

  try {
    const [projects] = await pool.execute(
      'SELECT id, name, status, priority, description FROM projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5',
      [userId]
    );

    const [tasks] = await pool.execute(
      `SELECT t.id, t.title, t.status, t.priority, t.due_date as dueDate, p.name as projectName
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = ? AND t.status != 'done'
       ORDER BY FIELD(t.priority, 'high', 'medium', 'low'), t.due_date ASC
       LIMIT 10`,
      [userId]
    );

    if (projects.length === 0 && tasks.length === 0) {
      return 'The user currently has no active projects or pending tasks created in their workspace.';
    }

    const projectSummary = projects.length > 0
      ? projects.map(p => `• Project "${p.name}" (Status: ${p.status}, Priority: ${p.priority})`).join('\n')
      : 'No active projects.';

    const taskSummary = tasks.length > 0
      ? tasks.map(t => `• Task "${t.title}" [${t.projectName}] (Status: ${t.status}, Priority: ${t.priority}${t.dueDate ? `, Due: ${t.dueDate}` : ''})`).join('\n')
      : 'No pending tasks.';

    return `CURRENT USER WORKSPACE DATA:
Active Projects:
${projectSummary}

Pending Tasks to Work On:
${taskSummary}`;
  } catch (err) {
    console.warn('Could not load workspace context:', err.message);
    return null;
  }
}

module.exports = {
  createConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  saveMessage,
  updateConversationTimestamp,
  getRecentConversationHistory,
  getRelevantWorkspaceContext
};
