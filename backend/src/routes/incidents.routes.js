const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { apiLimiter } = require('../middleware/rateLimiter');
const { createIncidentValidators, patchIncidentValidators } = require('../validators/incidents.validators');
const {
  listIncidents,
  getIncident,
  getIncidentUpdates,
  createIncident,
  patchIncident,
} = require('../controllers/incidents.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/incidents — Auth: required — Roles: any (results scoped by role)
router.get('/', listIncidents);

// GET /api/incidents/:id — Auth: required — Roles: reporter (own) or any responder role
router.get('/:id', getIncident);

// GET /api/incidents/:id/updates — Auth: required — Roles: reporter (own) or any responder role
router.get('/:id/updates', getIncidentUpdates);

// POST /api/incidents — Auth: required — Roles: CITIZEN, AUTHORITY, ADMIN
router.post('/', requireRole(['citizen', 'authority', 'admin']), createIncidentValidators, createIncident);

// PATCH /api/incidents/:id — Auth: required — Roles: AUTHORITY, ADMIN
router.patch('/:id', requireRole(['authority', 'admin']), patchIncidentValidators, patchIncident);

module.exports = router;
