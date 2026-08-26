const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { listNotifications } = require('../controllers/notifications.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/notifications — Auth: required — Roles: any (own notifications only)
router.get('/', listNotifications);

module.exports = router;
