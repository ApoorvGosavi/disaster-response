const { success, error: sendError } = require('../utils/apiResponse');
const notificationsService = require('../services/notifications.service');

// GET /api/notifications — any authenticated user, own notifications only
async function listNotifications(req, res) {
  const { notifications, error: dbError } = await notificationsService.findNotificationsForUser(req.user.id);
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch notifications');
  return success(res, { notifications });
}

module.exports = { listNotifications };
