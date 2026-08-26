const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  createVolunteerTaskValidators,
  patchVolunteerTaskValidators,
} = require('../validators/volunteerTasks.validators');
const { listTasks, createTask, acceptTask, patchTask } = require('../controllers/volunteerTasks.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/volunteer-tasks — Auth: required — Roles: any (volunteers see open + own; others see all)
router.get('/', listTasks);

// POST /api/volunteer-tasks — Auth: required — Roles: AUTHORITY, ADMIN
router.post('/', requireRole(['authority', 'admin']), createVolunteerTaskValidators, createTask);

// PATCH /api/volunteer-tasks/:id/accept — Auth: required — Roles: VOLUNTEER
router.patch('/:id/accept', requireRole(['volunteer']), acceptTask);

// PATCH /api/volunteer-tasks/:id — Auth: required — Roles: assigned VOLUNTEER (own), AUTHORITY, ADMIN
router.patch('/:id', requireRole(['volunteer', 'authority', 'admin']), patchVolunteerTaskValidators, patchTask);

module.exports = router;
