const AppError = require('../utils/appError');

// Standard regular expression for basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowed enum values for Project status and priority
const ALLOWED_PROJECT_STATUSES = ['planning', 'active', 'completed'];
const ALLOWED_PROJECT_PRIORITIES = ['low', 'medium', 'high'];

// Allowed enum values for Task status and priority
const ALLOWED_TASK_STATUSES = ['todo', 'in-progress', 'done'];
const ALLOWED_TASK_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Validates whether a date string is parseable and valid.
 */
function isValidDate(dateString) {
  if (typeof dateString !== 'string' || dateString.trim().length === 0) return false;
  const timestamp = Date.parse(dateString);
  return !isNaN(timestamp);
}

/* =========================================================================
   USER VALIDATION
   ========================================================================= */

function validateCreateUser(req, res, next) {
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError('Name is required and cannot be empty', 400));
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return next(new AppError('Email is required and cannot be empty', 400));
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return next(new AppError('Please provide a valid email address (e.g. user@example.com)', 400));
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

function validateUpdateUser(req, res, next) {
  const { name, email } = req.body;

  if (name === undefined && email === undefined) {
    return next(new AppError('Please provide at least one field to update (name or email)', 400));
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return next(new AppError('Name cannot be empty', 400));
    }
    req.body.name = name.trim();
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim().length === 0) {
      return next(new AppError('Email cannot be empty', 400));
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return next(new AppError('Please provide a valid email address (e.g. user@example.com)', 400));
    }
    req.body.email = email.trim().toLowerCase();
  }

  next();
}

/* =========================================================================
   PROJECT VALIDATION
   ========================================================================= */

function validateCreateProject(req, res, next) {
  const { name, description, status, priority } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError('Project name is required and cannot be empty', 400));
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return next(new AppError('Project description is required and cannot be empty', 400));
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || !ALLOWED_PROJECT_STATUSES.includes(status.trim().toLowerCase())) {
      return next(new AppError(`Invalid status. Allowed values are: ${ALLOWED_PROJECT_STATUSES.join(', ')}`, 400));
    }
    req.body.status = status.trim().toLowerCase();
  } else {
    req.body.status = 'planning';
  }

  if (priority !== undefined) {
    if (typeof priority !== 'string' || !ALLOWED_PROJECT_PRIORITIES.includes(priority.trim().toLowerCase())) {
      return next(new AppError(`Invalid priority. Allowed values are: ${ALLOWED_PROJECT_PRIORITIES.join(', ')}`, 400));
    }
    req.body.priority = priority.trim().toLowerCase();
  } else {
    req.body.priority = 'medium';
  }

  req.body.name = name.trim();
  req.body.description = description.trim();

  next();
}

function validateUpdateProject(req, res, next) {
  const { name, description, status, priority, userId } = req.body;

  if (userId !== undefined) {
    return next(new AppError('Changing userId through the update endpoint is not allowed', 400));
  }

  if (name === undefined && description === undefined && status === undefined && priority === undefined) {
    return next(new AppError('Please provide at least one field to update (name, description, status, priority)', 400));
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return next(new AppError('Project name cannot be empty', 400));
    }
    req.body.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      return next(new AppError('Project description cannot be empty', 400));
    }
    req.body.description = description.trim();
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || !ALLOWED_PROJECT_STATUSES.includes(status.trim().toLowerCase())) {
      return next(new AppError(`Invalid status. Allowed values are: ${ALLOWED_PROJECT_STATUSES.join(', ')}`, 400));
    }
    req.body.status = status.trim().toLowerCase();
  }

  if (priority !== undefined) {
    if (typeof priority !== 'string' || !ALLOWED_PROJECT_PRIORITIES.includes(priority.trim().toLowerCase())) {
      return next(new AppError(`Invalid priority. Allowed values are: ${ALLOWED_PROJECT_PRIORITIES.join(', ')}`, 400));
    }
    req.body.priority = priority.trim().toLowerCase();
  }

  next();
}

/* =========================================================================
   TASK VALIDATION
   ========================================================================= */

/**
 * Validates request body when creating a task (POST /api/tasks).
 * Required: title, description, projectId
 * Optional: status (default: 'todo'), priority (default: 'medium'), dueDate
 */
function validateCreateTask(req, res, next) {
  const { title, description, projectId, status, priority, dueDate } = req.body;

  // 1. Validate title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new AppError('Task title is required and cannot be empty', 400));
  }

  // 2. Validate description
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return next(new AppError('Task description is required and cannot be empty', 400));
  }

  // 3. Validate projectId
  if (projectId === undefined || projectId === null || String(projectId).trim().length === 0) {
    return next(new AppError('projectId is required', 400));
  }
  const parsedProjectId = parseInt(projectId, 10);
  if (isNaN(parsedProjectId) || parsedProjectId <= 0) {
    return next(new AppError('projectId must be a valid positive integer', 400));
  }

  // 4. Validate optional status
  if (status !== undefined) {
    if (typeof status !== 'string' || !ALLOWED_TASK_STATUSES.includes(status.trim().toLowerCase())) {
      return next(new AppError(`Invalid status. Allowed values are: ${ALLOWED_TASK_STATUSES.join(', ')}`, 400));
    }
    req.body.status = status.trim().toLowerCase();
  } else {
    req.body.status = 'todo';
  }

  // 5. Validate optional priority
  if (priority !== undefined) {
    if (typeof priority !== 'string' || !ALLOWED_TASK_PRIORITIES.includes(priority.trim().toLowerCase())) {
      return next(new AppError(`Invalid priority. Allowed values are: ${ALLOWED_TASK_PRIORITIES.join(', ')}`, 400));
    }
    req.body.priority = priority.trim().toLowerCase();
  } else {
    req.body.priority = 'medium';
  }

  // 6. Validate optional dueDate
  if (dueDate !== undefined && dueDate !== null) {
    if (!isValidDate(dueDate)) {
      return next(new AppError('Invalid dueDate format. Please provide a valid date string (e.g. YYYY-MM-DD)', 400));
    }
    req.body.dueDate = String(dueDate).trim();
  } else {
    req.body.dueDate = null;
  }

  req.body.title = title.trim();
  req.body.description = description.trim();
  req.body.projectId = parsedProjectId;

  next();
}

/**
 * Validates request body when updating a task (PUT /api/tasks/:id).
 * Allows: title, description, status, priority, dueDate
 * Disallows: changing projectId
 */
function validateUpdateTask(req, res, next) {
  const { title, description, status, priority, dueDate, projectId } = req.body;

  // Disallow changing projectId
  if (projectId !== undefined) {
    return next(new AppError('Changing projectId through the update endpoint is not allowed', 400));
  }

  // Ensure at least one updateable field is present
  if (
    title === undefined &&
    description === undefined &&
    status === undefined &&
    priority === undefined &&
    dueDate === undefined
  ) {
    return next(new AppError('Please provide at least one field to update (title, description, status, priority, dueDate)', 400));
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return next(new AppError('Task title cannot be empty', 400));
    }
    req.body.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      return next(new AppError('Task description cannot be empty', 400));
    }
    req.body.description = description.trim();
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || !ALLOWED_TASK_STATUSES.includes(status.trim().toLowerCase())) {
      return next(new AppError(`Invalid status. Allowed values are: ${ALLOWED_TASK_STATUSES.join(', ')}`, 400));
    }
    req.body.status = status.trim().toLowerCase();
  }

  if (priority !== undefined) {
    if (typeof priority !== 'string' || !ALLOWED_TASK_PRIORITIES.includes(priority.trim().toLowerCase())) {
      return next(new AppError(`Invalid priority. Allowed values are: ${ALLOWED_TASK_PRIORITIES.join(', ')}`, 400));
    }
    req.body.priority = priority.trim().toLowerCase();
  }

  if (dueDate !== undefined && dueDate !== null) {
    if (!isValidDate(dueDate)) {
      return next(new AppError('Invalid dueDate format. Please provide a valid date string (e.g. YYYY-MM-DD)', 400));
    }
    req.body.dueDate = String(dueDate).trim();
  }

  next();
}

/**
 * Validates request body when updating only task status (PATCH /api/tasks/:id/status).
 * Requires: status (must be one of: todo, in-progress, done)
 */
function validatePatchTaskStatus(req, res, next) {
  const { status } = req.body;

  if (!status || typeof status !== 'string' || !ALLOWED_TASK_STATUSES.includes(status.trim().toLowerCase())) {
    return next(new AppError(`Invalid status. Allowed values are: ${ALLOWED_TASK_STATUSES.join(', ')}`, 400));
  }

  req.body.status = status.trim().toLowerCase();
  next();
}

/* =========================================================================
   AI GENERATE TASKS VALIDATION
   ========================================================================= */

/**
 * Validates request body for AI task generation (POST /api/ai/generate-tasks).
 * Required: projectName (string, non-empty, min 2 chars)
 * Required: projectDescription (string, non-empty, min 5 chars)
 * Optional: requirements (string)
 */
function validateGenerateTasks(req, res, next) {
  const { projectName, projectDescription, requirements } = req.body;

  if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
    return next(new AppError('projectName is required and cannot be empty', 400));
  }

  if (projectName.trim().length < 2) {
    return next(new AppError('projectName must be at least 2 characters long', 400));
  }

  if (!projectDescription || typeof projectDescription !== 'string' || projectDescription.trim().length === 0) {
    return next(new AppError('projectDescription is required and cannot be empty', 400));
  }

  if (projectDescription.trim().length < 5) {
    return next(new AppError('projectDescription must be at least 5 characters long', 400));
  }

  if (requirements !== undefined && requirements !== null && typeof requirements !== 'string') {
    return next(new AppError('requirements must be a string', 400));
  }

  req.body.projectName = projectName.trim();
  req.body.projectDescription = projectDescription.trim();
  req.body.requirements = requirements ? requirements.trim() : '';

  next();
}

/**
 * Validates request body when saving multiple tasks in batch (POST /api/tasks/batch).
 * - projectId: required positive integer
 * - tasks: required array, length 1 to 20
 * - each task: title (min 2 chars), priority ('low' | 'medium' | 'high'), status (defaults to 'todo')
 */
function validateBatchCreateTasks(req, res, next) {
  const { projectId, tasks } = req.body;

  // 1. Validate projectId
  if (projectId === undefined || projectId === null || String(projectId).trim().length === 0) {
    return next(new AppError('projectId is required', 400));
  }
  const parsedProjectId = parseInt(projectId, 10);
  if (isNaN(parsedProjectId) || parsedProjectId <= 0) {
    return next(new AppError('projectId must be a valid positive integer', 400));
  }

  // 2. Validate tasks array
  if (!tasks || !Array.isArray(tasks)) {
    return next(new AppError('tasks must be an array', 400));
  }

  if (tasks.length === 0) {
    return next(new AppError('At least one task is required in tasks array', 400));
  }

  if (tasks.length > 20) {
    return next(new AppError('Maximum of 20 tasks allowed per batch request', 400));
  }

  // 3. Validate each task in array
  const sanitizedTasks = [];

  for (let i = 0; i < tasks.length; i++) {
    const item = tasks[i];

    if (!item || typeof item !== 'object') {
      return next(new AppError(`Task at index ${i} must be an object`, 400));
    }

    const { title, description, priority, status, dueDate } = item;

    // Validate title: required, min 2 characters
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return next(new AppError(`Task at index ${i} must have a title with at least 2 characters`, 400));
    }

    // Validate priority: low, medium, high
    let sanitizedPriority = 'medium';
    if (priority !== undefined && priority !== null) {
      if (typeof priority !== 'string' || !ALLOWED_TASK_PRIORITIES.includes(priority.trim().toLowerCase())) {
        return next(new AppError(`Invalid priority for task at index ${i}. Allowed values are: ${ALLOWED_TASK_PRIORITIES.join(', ')}`, 400));
      }
      sanitizedPriority = priority.trim().toLowerCase();
    }

    // Validate status: defaults to 'todo'
    let sanitizedStatus = 'todo';
    if (status !== undefined && status !== null) {
      if (typeof status !== 'string' || !ALLOWED_TASK_STATUSES.includes(status.trim().toLowerCase())) {
        return next(new AppError(`Invalid status for task at index ${i}. Allowed values are: ${ALLOWED_TASK_STATUSES.join(', ')}`, 400));
      }
      sanitizedStatus = status.trim().toLowerCase();
    }

    // Validate optional dueDate
    let sanitizedDueDate = null;
    if (dueDate !== undefined && dueDate !== null && String(dueDate).trim().length > 0) {
      if (!isValidDate(String(dueDate))) {
        return next(new AppError(`Invalid dueDate format for task at index ${i}`, 400));
      }
      sanitizedDueDate = String(dueDate).trim();
    }

    const sanitizedDescription = description && typeof description === 'string'
      ? description.trim()
      : (typeof description === 'number' ? String(description) : '');

    sanitizedTasks.push({
      title: title.trim(),
      description: sanitizedDescription,
      priority: sanitizedPriority,
      status: sanitizedStatus,
      dueDate: sanitizedDueDate
    });
  }

  req.body.projectId = parsedProjectId;
  req.body.tasks = sanitizedTasks;

  next();
}

/* =========================================================================
   CONVERSATION & CHAT VALIDATION
   ========================================================================= */

/**
 * Validates request body when creating a conversation (POST /api/conversations).
 * Optional: title (string, max 255 chars)
 */
function validateCreateConversation(req, res, next) {
  const { title } = req.body;

  if (title !== undefined && title !== null) {
    if (typeof title !== 'string') {
      return next(new AppError('Conversation title must be a string', 400));
    }
    req.body.title = title.trim().slice(0, 255);
  }

  next();
}

/**
 * Validates request body for AI chat interaction (POST /api/ai/chat).
 * - message: required non-empty string, max 10000 chars
 * - conversationId: optional positive integer
 */
function validateChat(req, res, next) {
  const { message, conversationId } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return next(new AppError('Message is required and cannot be empty', 400));
  }

  if (message.trim().length > 10000) {
    return next(new AppError('Message is too long (maximum 10,000 characters)', 400));
  }

  if (conversationId !== undefined && conversationId !== null && String(conversationId).trim().length > 0) {
    const parsedId = parseInt(conversationId, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      return next(new AppError('conversationId must be a valid positive integer', 400));
    }
    req.body.conversationId = parsedId;
  } else {
    req.body.conversationId = null;
  }

  req.body.message = message.trim();
  next();
}

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateCreateProject,
  validateUpdateProject,
  validateCreateTask,
  validateUpdateTask,
  validatePatchTaskStatus,
  validateGenerateTasks,
  validateBatchCreateTasks,
  validateCreateConversation,
  validateChat
};
