const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Standard email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Generates a signed JWT token containing the user's ID.
 */
function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'supersecretjwtkey_ai_project_task_manager_2025_secure';

  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/register
 * Registers a new user account, hashes their password, and issues a JWT token.
 */
async function register(req, res, next) {
  const { name, email, password } = req.body;

  // 1. Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError('Name is required and cannot be empty', 400));
  }

  // 2. Validate email
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return next(new AppError('Email is required and cannot be empty', 400));
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  // 3. Validate password
  if (!password || typeof password !== 'string') {
    return next(new AppError('Password is required', 400));
  }

  const trimmedPassword = password.trim();
  if (trimmedPassword.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  try {
    console.log('[AUTH] Registration request received for email:', trimmedEmail);
    // 4. Check whether email already exists
    console.log('[AUTH] Checking existing email in MySQL database');
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (existing.length > 0) {
      console.log('[AUTH] Registration rejected: email already exists');
      return next(new AppError('A user with this email already exists', 409));
    }

    // 5. Hash password using bcryptjs (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);
    console.log('[AUTH] Password hashed successfully');

    // 6. Insert new user into MySQL with password hash
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), trimmedEmail, hashedPassword]
    );

    const newUserId = result.insertId;
    console.log('[AUTH] User inserted successfully into MySQL with id:', newUserId);

    // 7. Generate JWT token
    console.log('[AUTH] Generating JWT for new user');
    const token = generateToken(newUserId);

    console.log('[AUTH] Registration completed successfully');
    // 8. Return 201 Created (never returning password or password hash)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUserId,
          name: name.trim(),
          email: trimmedEmail
        },
        token
      }
    });
  } catch (error) {
    console.error('[AUTH] Registration error:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return next(new AppError('A user with this email already exists', 409));
    }
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns a JWT token.
 */
async function login(req, res, next) {
  const { email, password } = req.body;

  // 1. Validate email and password presence
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return next(new AppError('Email is required and cannot be empty', 400));
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return next(new AppError('Password is required and cannot be empty', 400));
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  try {
    console.log('[AUTH] Login request received for email:', trimmedEmail);
    // 2. Query user by email, retrieving hashed password internally
    const [rows] = await pool.execute(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [trimmedEmail]
    );

    // Safe error message used for all authentication failures to prevent user enumeration
    const AUTH_FAILED_MSG = 'Invalid email or password';

    if (rows.length === 0) {
      console.log('[AUTH] Login rejected: user not found');
      return next(new AppError(AUTH_FAILED_MSG, 401));
    }

    const user = rows[0];
    console.log('[AUTH] User retrieved from MySQL database (id:', user.id, ')');

    // If user has no password set (e.g. legacy account created prior to auth migration)
    if (!user.password) {
      console.log('[AUTH] Login rejected: user has no password hash');
      return next(new AppError(AUTH_FAILED_MSG, 401));
    }

    // 3. Compare passwords using bcryptjs
    const isPasswordMatch = await bcrypt.compare(trimmedPassword, user.password);

    if (!isPasswordMatch) {
      console.log('[AUTH] Login rejected: password does not match');
      return next(new AppError(AUTH_FAILED_MSG, 401));
    }

    console.log('[AUTH] Password verified successfully');

    // 4. Generate JWT token
    console.log('[AUTH] Generating JWT for logged-in user');
    const token = generateToken(user.id);

    console.log('[AUTH] Login completed successfully');
    // 5. Return 200 OK (never returning password or password hash)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    next(error);
  }
}

module.exports = {
  register,
  login
};
