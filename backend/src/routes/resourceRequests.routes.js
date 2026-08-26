const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  createResourceRequestValidators,
  patchResourceRequestValidators,
} = require('../validators/resourceRequests.validators');
const { listRequests, createRequest, patchRequest } = require('../controllers/resourceRequests.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/resource-requests — Auth: required — Roles: any (own for requesters; all for AUTHORITY/ADMIN)
router.get('/', listRequests);

// POST /api/resource-requests — Auth: required — Roles: HOSPITAL, AUTHORITY, ADMIN
router.post('/', requireRole(['hospital', 'authority', 'admin']), createResourceRequestValidators, createRequest);

// PATCH /api/resource-requests/:id — Auth: required — Roles: AUTHORITY, ADMIN
router.patch('/:id', requireRole(['authority', 'admin']), patchResourceRequestValidators, patchRequest);

module.exports = router;
