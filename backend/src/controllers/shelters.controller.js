const { success, error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');
const sheltersService = require('../services/shelters.service');

// GET /api/shelters — Auth: required — Roles: any authenticated user
async function listShelters(req, res) {
  const { shelters, error: dbError } = await sheltersService.findShelters();
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch shelters');
  return success(res, { shelters });
}

// POST /api/shelters — Auth: required — Roles: AUTHORITY, ADMIN, VOLUNTEER
async function createShelter(req, res) {
  const { name, capacity, latitude, longitude } = req.body;

  const { shelter, error: dbError } = await sheltersService.createShelter({
    managedBy: req.user.id,
    name,
    capacity,
    latitude,
    longitude,
  });
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not create shelter');

  await logEvent('privileged_action', req.user.id, { action: 'create_shelter', shelterId: shelter.id });

  return success(res, { shelter }, 201);
}

module.exports = { listShelters, createShelter };
