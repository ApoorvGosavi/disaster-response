const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { apiLimiter } = require('../middleware/rateLimiter');
const { createShelterValidators } = require('../validators/shelters.validators');
const { listShelters, createShelter } = require('../controllers/shelters.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/shelters — Auth: required — Roles: any authenticated role
router.get('/', listShelters);

// POST /api/shelters — Auth: required — Roles: AUTHORITY, ADMIN, VOLUNTEER
router.post('/', requireRole(['authority', 'admin', 'volunteer']), createShelterValidators, createShelter);

module.exports = router;
