const { pool } = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Transforms a MySQL row into standard camelCase API format.
 */
function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString()
  };
}

/**
 * GET /api/users
 * Retrieve all users from MySQL.
 */
async function getAllUsers(req, res, next) {
  try {
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY id ASC');
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: rows.map(formatUser)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:id
 * Retrieve a single user by ID from MySQL.
 */
async function getUserById(req, res, next) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return next(new AppError('Invalid user ID provided', 400));
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return next(new AppError(`User with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: formatUser(rows[0])
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users
 * Create a new user in MySQL with duplicate email detection.
 */
async function createUser(req, res, next) {
  const { name, email } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name.trim(), email.trim().toLowerCase()]
    );

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: formatUser(rows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return next(new AppError(`A user with email "${email}" already exists`, 409));
    }
    next(error);
  }
}

/**
 * PUT /api/users/:id
 * Update an existing user's details in MySQL.
 */
async function updateUser(req, res, next) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return next(new AppError('Invalid user ID provided', 400));
  }

  try {
    const [existingRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (existingRows.length === 0) {
      return next(new AppError(`User with id ${req.params.id} not found`, 404));
    }

    const existingUser = existingRows[0];
    const { name, email } = req.body;

    const newName = name !== undefined ? name.trim() : existingUser.name;
    const newEmail = email !== undefined ? email.trim().toLowerCase() : existingUser.email;

    await pool.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [newName, newEmail, userId]
    );

    const [updatedRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: formatUser(updatedRows[0])
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return next(new AppError(`A user with email "${req.body.email}" already exists`, 409));
    }
    next(error);
  }
}

/**
 * DELETE /api/users/:id
 * Remove a user from MySQL.
 */
async function deleteUser(req, res, next) {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return next(new AppError('Invalid user ID provided', 400));
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return next(new AppError(`User with id ${req.params.id} not found`, 404));
    }

    const deletedUser = formatUser(rows[0]);

    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
