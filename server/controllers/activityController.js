const { getUserActivities } = require('../services/activityService');

/**
 * GET /api/activities
 * Retrieves all activities belonging to the authenticated user from MySQL.
 * Strictly uses req.user.id — ignores any query parameters attempting to specify userId.
 * Results are returned ordered newest first.
 */
async function getActivities(req, res, next) {
  try {
    // Strictly bind to authenticated user's ID
    const authenticatedUserId = req.user.id;

    const activities = await getUserActivities(authenticatedUserId, 50);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getActivities
};
