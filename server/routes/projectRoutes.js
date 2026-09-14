const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { validateCreateProject, validateUpdateProject } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');

// Protect all /api/projects routes with JWT authentication
router.use(authenticate);

// Routes for /api/projects
router
  .route('/')
  .get(projectController.getAllProjects)
  .post(validateCreateProject, projectController.createProject);

// Routes for /api/projects/:id
router
  .route('/:id')
  .get(projectController.getProjectById)
  .put(validateUpdateProject, projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;
