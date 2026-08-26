const { success, error: sendError } = require('../utils/apiResponse');
const profileService = require('../services/profile.service');
const { logEvent } = require('../services/audit.service');

// GET /api/users/profile
async function getProfile(req, res) {
  const { profile, error: dbError } = await profileService.getProfileById(req.user.id);
  if (dbError || !profile) {
    return sendError(res, 404, 'NOT_FOUND', 'Profile not found');
  }
  return success(res, { profile });
}

// PUT /api/users/profile
// Only ever writes to allow-listed, non-privileged fields — see
// profile.service.js. role/is_verified cannot be set from here,
// enforced both in application code and by a DB trigger.
async function updateProfile(req, res) {
  const { profile, error: dbError } = await profileService.updateOwnProfile(req.user.id, req.body);
  if (dbError || !profile) {
    return sendError(res, 400, 'UPDATE_FAILED', 'Could not update profile');
  }
  return success(res, { profile });
}

// POST /api/users/role-upgrade-request
// The ONLY way for a user to move toward authority/hospital/admin.
// Creates a pending request; an admin must approve it via the
// admin dashboard/API before profiles.role actually changes.
async function requestRoleUpgrade(req, res) {
  const { requestedRole, organization, justification } = req.body;

  const { request, error: dbError } = await profileService.createRoleUpgradeRequest(
    req.user.id,
    requestedRole,
    organization,
    justification,
  );

  if (dbError || !request) {
    return sendError(res, 400, 'REQUEST_FAILED', 'Could not submit role upgrade request');
  }

  await logEvent('role_change_requested', req.user.id, { requestedRole });

  return success(res, { request }, 201);
}

module.exports = { getProfile, updateProfile, requestRoleUpgrade };
