const { pool } = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Creates and persists a new user activity in MySQL.
 * 
 * @param {object} params
 * @param {number|string} params.userId - ID of the authenticated user
 * @param {string} params.type - Activity type (e.g. 'PROJECT_CREATED', 'TASK_STATUS_CHANGED')
 * @param {string} params.message - Human-readable activity description
 * @returns {Promise<object>} Created activity object
 */
async function createActivity({ userId, type, message }) {
  if (!userId) {
    throw new AppError('userId is required to record an activity', 400);
  }

  if (!type || typeof type !== 'string' || !type.trim()) {
    throw new AppError('Activity type is required', 400);
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new AppError('Activity message is required', 400);
  }

  const cleanUserId = parseInt(userId, 10);
  if (isNaN(cleanUserId)) {
    throw new AppError('Invalid userId for activity logging', 400);
  }

  const cleanType = type.trim().slice(0, 100);
  const cleanMessage = message.trim().slice(0, 500);

  try {
    const [result] = await pool.execute(
      'INSERT INTO activities (user_id, type, message) VALUES (?, ?, ?)',
      [cleanUserId, cleanType, cleanMessage]
    );

    return {
      id: result.insertId,
      userId: cleanUserId,
      type: cleanType,
      message: cleanMessage,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to create activity record:', error.message);
    // Wrap database error to avoid exposing raw SQL errors
    throw new AppError('Failed to record activity entry', 500);
  }
}

/**
 * Retrieves activities for a specific authenticated user ordered newest first.
 * Never allows arbitrary userId query overrides.
 *
 * @param {number|string} userId - ID of the authenticated user
 * @param {number} [limit=50] - Maximum records to retrieve
 * @returns {Promise<Array<object>>} List of user activities
 */
async function getUserActivities(userId, limit = 50) {
  const cleanUserId = parseInt(userId, 10);
  if (isNaN(cleanUserId)) {
    throw new AppError('Invalid user ID provided', 400);
  }

  const cleanLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

  try {
    // Parameterized MySQL query selecting user's activities ordered newest first
    const query = `
      SELECT id, user_id, type, message, created_at
      FROM activities
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ${cleanLimit}
    `;
    const [rows] = await pool.execute(query, [cleanUserId]);

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      message: row.message,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()
    }));
  } catch (error) {
    console.error('Failed to retrieve user activities:', error.message);
    throw new AppError('Failed to fetch activity stream', 500);
  }
}

module.exports = {
  createActivity,
  getUserActivities
};
