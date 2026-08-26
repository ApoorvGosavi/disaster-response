const { success, error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');
const hospitalsService = require('../services/hospitals.service');

// GET /api/hospitals — Auth: required — Roles: AUTHORITY, ADMIN, HOSPITAL, RESCUER
async function listHospitals(req, res) {
  const { hospitals, error: dbError } = await hospitalsService.findHospitals();
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch hospitals');
  return success(res, { hospitals });
}

// PUT /api/hospitals/:id — Auth: required — Roles: HOSPITAL (own record only), ADMIN
async function updateHospital(req, res) {
  const { id } = req.params;

  const { hospital: existing, error: fetchError } = await hospitalsService.findHospitalById(id);
  if (fetchError || !existing) return sendError(res, 404, 'NOT_FOUND', 'Hospital not found');

  const isOwner = existing.managed_by === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return sendError(res, 403, 'FORBIDDEN', 'You can only manage your own hospital resource record');
  }

  const { hospital, error: dbError } = await hospitalsService.updateHospital(id, req.body);
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not update hospital record');

  await logEvent('privileged_action', req.user.id, { action: 'update_hospital', hospitalId: id });

  return success(res, { hospital });
}

module.exports = { listHospitals, updateHospital };
