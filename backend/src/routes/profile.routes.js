const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { updateProfileValidators } = require('../validators/profile.validators');
const { roleUpgradeRequestValidators } = require('../validators/auth.validators');
const {
  getProfile,
  updateProfile,
  requestRoleUpgrade,
} = require('../controllers/profile.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/users/profile — Auth: required — Roles: any
router.get('/profile', getProfile);

// PUT /api/users/profile — Auth: required — Roles: any (own profile only)
router.put('/profile', updateProfileValidators, updateProfile);

// POST /api/users/role-upgrade-request — Auth: required — Roles: any
router.post('/role-upgrade-request', roleUpgradeRequestValidators, requestRoleUpgrade);

module.exports = router;
