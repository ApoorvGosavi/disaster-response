const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  createAssignmentValidators,
  patchAssignmentValidators,
} = require('../validators/rescueAssignments.validators');
const {
  listAssignments,
  listMyAssignments,
  createAssignment,
  patchAssignment,
} = require('../controllers/rescueAssignments.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/rescue-assignments — Auth: required — Roles: AUTHORITY, ADMIN
router.get('/', requireRole(['authority', 'admin']), listAssignments);

// GET /api/rescue-assignments/my — Auth: required — Roles: RESCUER
// NOTE: registered before '/:id'-style routes to avoid "my" being
// parsed as an id param.
router.get('/my', requireRole(['rescuer', 'admin']), listMyAssignments);

// POST /api/rescue-assignments — Auth: required — Roles: AUTHORITY, ADMIN
router.post('/', requireRole(['authority', 'admin']), createAssignmentValidators, createAssignment);

// PATCH /api/rescue-assignments/:id — Auth: required — Roles: RESCUER (own team), ADMIN
router.patch('/:id', requireRole(['rescuer', 'admin']), patchAssignmentValidators, patchAssignment);

module.exports = router;
