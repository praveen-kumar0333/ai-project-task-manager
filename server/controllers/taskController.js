const { pool } = require('../config/db');
const AppError = require('../utils/appError');
const { createActivity } = require('../services/activityService');

/**
 * Formats a due date into YYYY-MM-DD string or null.
 */
function formatDueDate(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    return val.split('T')[0];
  }
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(val);
}

/**
 * Transforms a MySQL task row into standard camelCase API format.
 */
function formatTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    projectId: row.project_id,
    status: row.status,
    priority: row.priority,
    dueDate: formatDueDate(row.due_date),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString()
  };
}

/**
 * GET /api/tasks
 * Retrieve all tasks from MySQL belonging to projects owned by the authenticated user.
 * Supports optional filtering by projectId, status, or both.
 * Example: /api/tasks?projectId=1&status=todo
 */
async function getAllTasks(req, res, next) {
  try {
    const authenticatedUserId = req.user.id;

    let query = `
      SELECT tasks.*
      FROM tasks
      JOIN projects ON tasks.project_id = projects.id
      WHERE projects.user_id = ?
    `;
    const queryParams = [authenticatedUserId];

    // Filter by projectId if provided
    if (req.query.projectId !== undefined) {
      const filterProjectId = parseInt(req.query.projectId, 10);
      if (isNaN(filterProjectId)) {
        return next(new AppError('projectId query parameter must be a valid number', 400));
      }
      query += ' AND tasks.project_id = ?';
      queryParams.push(filterProjectId);
    }

    // Filter by status if provided
    if (req.query.status !== undefined) {
      const filterStatus = req.query.status.trim().toLowerCase();
      query += ' AND tasks.status = ?';
      queryParams.push(filterStatus);
    }

    query += ' ORDER BY tasks.id ASC';

    const [rows] = await pool.execute(query, queryParams);

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: rows.map(formatTask)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/:id
 * Retrieve a single task by its ID from MySQL, verifying ownership through its project.
 */
async function getTaskById(req, res, next) {
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return next(new AppError('Invalid task ID provided', 400));
  }

  try {
    const authenticatedUserId = req.user.id;
    const query = `
      SELECT tasks.*
      FROM tasks
      JOIN projects ON tasks.project_id = projects.id
      WHERE tasks.id = ? AND projects.user_id = ?
    `;
    const [rows] = await pool.execute(query, [taskId, authenticatedUserId]);

    if (rows.length === 0) {
      return next(new AppError(`Task with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: formatTask(rows[0])
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks
 * Create a new task in MySQL associated with a project owned by the authenticated user.
 * Verifies project ownership before insertion.
 */
async function createTask(req, res, next) {
  const { title, description, projectId, status, priority, dueDate } = req.body;
  const authenticatedUserId = req.user.id;

  try {
    // 1. Verify that the specified project exists and belongs to the authenticated user
    const [projectRows] = await pool.execute(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, authenticatedUserId]
    );

    if (projectRows.length === 0) {
      return next(new AppError(`Project with id ${projectId} not found`, 404));
    }

    // 2. Insert task into MySQL
    const taskStatus = status || 'todo';
    const taskPriority = priority || 'medium';
    const taskDueDate = dueDate ? formatDueDate(dueDate) : null;

    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description, project_id, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [title.trim(), description.trim(), projectId, taskStatus, taskPriority, taskDueDate]
    );

    // 3. Fetch newly created task
    const query = `
      SELECT tasks.*
      FROM tasks
      JOIN projects ON tasks.project_id = projects.id
      WHERE tasks.id = ? AND projects.user_id = ?
    `;
    const [rows] = await pool.execute(query, [result.insertId, authenticatedUserId]);

    const createdTask = formatTask(rows[0]);

    // Record activity in MySQL
    try {
      await createActivity({
        userId: authenticatedUserId,
        type: 'TASK_CREATED',
        message: `Created task: ${createdTask.title}`
      });
    } catch (actErr) {
      console.warn('Failed to record TASK_CREATED activity:', actErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
      return next(new AppError(`Project with id ${projectId} not found`, 404));
    }
    next(error);
  }
}

/**
 * PUT /api/tasks/:id
 * Update an existing task's details in MySQL after verifying ownership through project.
 */
async function updateTask(req, res, next) {
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return next(new AppError('Invalid task ID provided', 400));
  }

  try {
    const authenticatedUserId = req.user.id;

    // 1. Verify that the task exists and its project belongs to the authenticated user
    const checkQuery = `
      SELECT tasks.*
      FROM tasks
      JOIN projects ON tasks.project_id = projects.id
      WHERE tasks.id = ? AND projects.user_id = ?
    `;
    const [existingRows] = await pool.execute(checkQuery, [taskId, authenticatedUserId]);

    if (existingRows.length === 0) {
      return next(new AppError(`Task with id ${req.params.id} not found`, 404));
    }

    const existingTask = existingRows[0];
    const { title, description, status, priority, dueDate } = req.body;

    const newTitle = title !== undefined ? title.trim() : existingTask.title;
    const newDescription = description !== undefined ? description.trim() : existingTask.description;
    const newStatus = status !== undefined ? status.trim() : existingTask.status;
    const newPriority = priority !== undefined ? priority.trim() : existingTask.priority;
    const newDueDate = dueDate !== undefined ? (dueDate ? formatDueDate(dueDate) : null) : existingTask.due_date;

    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?',
      [newTitle, newDescription, newStatus, newPriority, newDueDate, taskId]
    );

    const [updatedRows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);

    const updatedTask = formatTask(updatedRows[0]);

    // Record activity in MySQL
    try {
      await createActivity({
        userId: authenticatedUserId,
        type: 'TASK_UPDATED',
        message: `Updated task: ${updatedTask.title}`
      });
    } catch (actErr) {
      console.warn('Failed to record TASK_UPDATED activity:', actErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tasks/:id/status
 * Dedicated endpoint for updating only the status of an existing task in MySQL
 * after verifying ownership through its project.
 */
async function updateTaskStatus(req, res, next) {
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return next(new AppError('Invalid task ID provided', 400));
  }

  try {
    const authenticatedUserId = req.user.id;

    // Verify task exists and belongs to project owned by authenticated user
    const checkQuery = `
      SELECT tasks.*
      FROM tasks
      JOIN projects ON tasks.project_id = projects.id
      WHERE tasks.id = ? AND projects.user_id = ?
    `;
    const [existingRows] = await pool.execute(checkQuery, [taskId, authenticatedUserId]);

    if (existingRows.length === 0) {
      return next(new AppError(`Task with id ${req.params.id} not found`, 404));
    }

    const { status } = req.body;

    await pool.execute(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status.trim(), taskId]
    );

    const [updatedRows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);

    const updatedTask = formatTask(updatedRows[0]);

    // Record activity in MySQL
    try {
      const targetStatusName = status.trim() === 'done' ? 'Done' : status.trim() === 'in-progress' ? 'In Progress' : 'To Do';
      await createActivity({
        userId: authenticatedUserId,
        type: 'TASK_STATUS_CHANGED',
        message: `Changed task "${existingRows[0].title}" to ${targetStatusName}`
      });
    } catch (actErr) {
      console.warn('Failed to record TASK_STATUS_CHANGED activity:', actErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tasks/:id
 * Remove an existing task from MySQL after verifying ownership through its project.
 */
async function deleteTask(req, res, next) {
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return next(new AppError('Invalid task ID provided', 400));
  }

  try {
    const authenticatedUserId = req.user.id;

    const checkQuery = `
      SELECT tasks.*
      FROM tasks
      JOIN projects ON tasks.project_id = projects.id
      WHERE tasks.id = ? AND projects.user_id = ?
    `;
    const [rows] = await pool.execute(checkQuery, [taskId, authenticatedUserId]);

    if (rows.length === 0) {
      return next(new AppError(`Task with id ${req.params.id} not found`, 404));
    }

    const deletedTask = formatTask(rows[0]);

    await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);

    // Record activity in MySQL
    try {
      await createActivity({
        userId: authenticatedUserId,
        type: 'TASK_DELETED',
        message: `Deleted task: ${deletedTask.title}`
      });
    } catch (actErr) {
      console.warn('Failed to record TASK_DELETED activity:', actErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks/batch
 * Saves multiple tasks in batch to a project in MySQL using a database transaction.
 * Ensures project ownership, rolls back all inserts on any failure, and records
 * a single summary activity entry.
 */
async function createTasksBatch(req, res, next) {
  const authenticatedUserId = req.user.id;
  const { projectId, tasks } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Verify project exists and belongs to the authenticated user
    const [projectRows] = await connection.execute(
      'SELECT id, name, user_id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, authenticatedUserId]
    );

    if (projectRows.length === 0) {
      await connection.rollback();
      return next(new AppError(`Project with id ${projectId} not found`, 404));
    }

    const project = projectRows[0];
    const createdTasks = [];

    // 2. Insert all tasks within the database transaction
    for (const task of tasks) {
      const taskDueDate = task.dueDate ? formatDueDate(task.dueDate) : null;
      const [insertResult] = await connection.execute(
        'INSERT INTO tasks (title, description, project_id, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
        [task.title, task.description, projectId, task.status, task.priority, taskDueDate]
      );

      createdTasks.push({
        id: insertResult.insertId,
        title: task.title,
        description: task.description,
        projectId,
        status: task.status,
        priority: task.priority,
        dueDate: taskDueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 3. Commit transaction
    await connection.commit();

    // 4. Record ONE summary activity for the batch
    try {
      await createActivity({
        userId: authenticatedUserId,
        type: 'TASKS_CREATED_BY_AI',
        message: `Added ${createdTasks.length} AI-generated task${createdTasks.length === 1 ? '' : 's'} to ${project.name}`
      });
    } catch (actErr) {
      console.warn('Failed to record TASKS_CREATED_BY_AI activity:', actErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdTasks.length} task${createdTasks.length === 1 ? '' : 's'}`,
      data: createdTasks
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr.message);
    }
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  createTasksBatch,
  updateTask,
  updateTaskStatus,
  deleteTask
};
