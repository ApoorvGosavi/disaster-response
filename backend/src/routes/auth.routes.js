const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const { getMe } = require('../controllers/auth.controller');

const router = express.Router();

// GET /api/auth/me
// Auth: required
// Roles: any authenticated role
router.get('/me', authLimiter, requireAuth, getMe);

module.exports = router;
