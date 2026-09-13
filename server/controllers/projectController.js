const { pool } = require('../config/db');
const AppError = require('../utils/appError');
const { createActivity } = require('../services/activityService');

/**
 * Transforms a MySQL project row into standard camelCase API format.
 */
function formatProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    userId: row.user_id,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString()
  };
}

/**
 * GET /api/projects
 * Retrieve all projects belonging to the authenticated user from MySQL.
 */
async function getAllProjects(req, res, next) {
  try {
    const authenticatedUserId = req.user.id;

    const query = 'SELECT * FROM projects WHERE user_id = ? ORDER BY id ASC';
    const [rows] = await pool.execute(query, [authenticatedUserId]);

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: rows.map(formatProject)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/projects/:id
 * Retrieve a single project by its ID from MySQL if owned by the authenticated user.
 */
async function getProjectById(req, res, next) {
  const projectId = parseInt(req.params.id, 10);

  if (isNaN(projectId)) {
    return next(new AppError('Invalid project ID provided', 400));
  }

  try {
    const authenticatedUserId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, authenticatedUserId]
    );

    if (rows.length === 0) {
      return next(new AppError(`Project with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: formatProject(rows[0])
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/projects
 * Create a new project in MySQL owned by the authenticated user.
 * Disregards any client-provided userId to prevent unauthorized assignment.
 */
async function createProject(req, res, next) {
  const { name, description, status, priority } = req.body;
  const authenticatedUserId = req.user.id;

  try {
    const projectStatus = status || 'planning';
    const projectPriority = priority || 'medium';

    const [result] = await pool.execute(
      'INSERT INTO projects (name, description, user_id, status, priority) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), description.trim(), authenticatedUserId, projectStatus, projectPriority]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [result.insertId, authenticatedUserId]
    );

    const createdProject = formatProject(rows[0]);

    // Record activity in MySQL
    try {
      await createActivity({
        userId: authenticatedUserId,
        type: 'PROJECT_CREATED',
        message: `Created project: ${createdProject.name}`
      });
    } catch (actErr) {
      console.warn('Failed to record PROJECT_CREATED activity:', actErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: createdProject
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/projects/:id
 * Update an existing project owned by the authenticated user in MySQL.
 */
async function updateProject(req, res, next) {
  const projectId = parseInt(req.params.id, 10);

  if (isNaN(projectId)) {
    return next(new AppError('Invalid project ID provided', 400));
  }

  try {
    const authenticatedUserId = req.user.id;

    // Verify that the project exists in MySQL and belongs to the authenticated user
    const [existingRows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, authenticatedUserId]
    );

    if (existingRows.length === 0) {
      return next(new AppError(`Project with id ${req.params.id} not found`, 404));
    }

    const existingProject = existingRows[0];
    const { name, description, status, priority } = req.body;

    const newName = name !== undefined ? name.trim() : existingProject.name;
    const newDescription = description !== undefined ? description.trim() : existingProject.description;
    const newStatus = status !== undefined ? status.trim() : existingProject.status;
    const newPriority = priority !== undefined ? priority.trim() : existingProject.priority;

    await pool.execute(
      'UPDATE projects SET name = ?, description = ?, status = ?, priority = ? WHERE id = ? AND user_id = ?',
      [newName, newDescription, newStatus, newPriority, projectId, authenticatedUserId]
    );

    const [updatedRows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, authenticatedUserId]
    );

    const updatedProject = formatProject(updatedRows[0]);

    // Record activity in MySQL
    try {
      await createActivity({
        userId: authenticatedUserId,
        type: 'PROJECT_UPDATED',
        message: `Updated project: ${updatedProject.name}`
      });
    } catch (actErr) {
      console.warn('Failed to record PROJECT_UPDATED activity:', actErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/projects/:id
 * Remove an existing project owned by the authenticated user from MySQL.
 */
async function deleteProject(req, res, next) {
  const projectId = parseInt(req.params.id, 10);

  if (isNaN(projectId)) {
    return next(new AppError('Invalid project ID provided', 400));
  }

  try {
    const authenticatedUserId = req.user.id;

    const [rows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, authenticatedUserId]
    );

    if (rows.length === 0) {
      return next(new AppError(`Project with id ${req.params.id} not found`, 404));
    }

    const deletedProject = formatProject(rows[0]);

    await pool.execute(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [projectId, authenticatedUserId]
    );

    // Record activity in MySQL
    try {
      await createActivity({
        userId: authenticatedUserId,
        type: 'PROJECT_DELETED',
        message: `Deleted project: ${deletedProject.name}`
      });
    } catch (actErr) {
      console.warn('Failed to record PROJECT_DELETED activity:', actErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: deletedProject
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
