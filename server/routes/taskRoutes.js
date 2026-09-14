const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validatePatchTaskStatus,
  validateBatchCreateTasks
} = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');

// Protect all /api/tasks routes with JWT authentication
router.use(authenticate);

// Routes for /api/tasks
router
  .route('/')
  .get(taskController.getAllTasks)
  .post(validateCreateTask, taskController.createTask);

// Dedicated route for batch task insertion: POST /api/tasks/batch
// Defined before /:id to prevent route parameter collision
router.post('/batch', validateBatchCreateTasks, taskController.createTasksBatch);

// Routes for /api/tasks/:id
router
  .route('/:id')
  .get(taskController.getTaskById)
  .put(validateUpdateTask, taskController.updateTask)
  .delete(taskController.deleteTask);

// Dedicated route for updating only task status: PATCH /api/tasks/:id/status
router
  .route('/:id/status')
  .patch(validatePatchTaskStatus, taskController.updateTaskStatus);

module.exports = router;
