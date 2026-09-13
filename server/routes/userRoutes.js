const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validationMiddleware');

// Routes for /api/users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(validateCreateUser, userController.createUser);

// Routes for /api/users/:id
router
  .route('/:id')
  .get(userController.getUserById)
  .put(validateUpdateUser, userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
