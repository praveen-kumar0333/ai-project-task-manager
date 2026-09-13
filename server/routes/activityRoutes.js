const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/authMiddleware');

// Protect all /api/activities routes with JWT authentication
router.use(authenticate);

// GET /api/activities — retrieve activities for authenticated user
router.get('/', activityController.getActivities);

module.exports = router;
