const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Authentication Middleware
 * 1. Reads the Authorization header: `Bearer <token>`
 * 2. Validates format and presence
 * 3. Verifies token with JWT_SECRET
 * 4. Verifies that the user exists in MySQL
 * 5. Attaches authenticated user object to req.user
 * 6. Rejects with 401 Unauthorized if invalid or missing
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      return next(new AppError('Authorization header is missing or malformed', 401));
    }

    const parts = authHeader.trim().split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
      return next(new AppError('Authorization header must be in Bearer <token> format', 401));
    }

    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey_ai_project_task_manager_2025_secure';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return next(new AppError('Authentication token has expired. Please log in again', 401));
      }
      return next(new AppError('Invalid authentication token', 401));
    }

    if (!decoded || !decoded.id) {
      return next(new AppError('Invalid token payload', 401));
    }

    // Verify user exists in MySQL database
    const [rows] = await pool.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    // Attach authenticated user to request
    req.user = rows[0];
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticate
};
