const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { apiLimiter } = require('../middleware/rateLimiter');
const { createRescueTeamValidators } = require('../validators/rescueTeams.validators');
const { listRescueTeams, createRescueTeam } = require('../controllers/rescueTeams.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/rescue-teams — Auth: required — Roles: AUTHORITY, ADMIN, RESCUER
router.get('/', requireRole(['authority', 'admin', 'rescuer']), listRescueTeams);

// POST /api/rescue-teams — Auth: required — Roles: AUTHORITY, ADMIN
router.post('/', requireRole(['authority', 'admin']), createRescueTeamValidators, createRescueTeam);

module.exports = router;
