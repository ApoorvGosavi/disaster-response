const { success, error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');
const requestsService = require('../services/resourceRequests.service');
const { RESOURCE_REQUEST_TRANSITIONS, isValidTransition } = require('../utils/statusTransitions');

const REVIEWER_ROLES = ['authority', 'admin'];

// GET /api/resource-requests — HOSPITAL/others see own; AUTHORITY/ADMIN see all
async function listRequests(req, res) {
  const isReviewer = REVIEWER_ROLES.includes(req.user.role);
  const { requests, error: dbError } = isReviewer
    ? await requestsService.findAllRequests()
    : await requestsService.findRequestsForUser(req.user.id);

  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch resource requests');
  return success(res, { requests });
}

// POST /api/resource-requests — HOSPITAL, AUTHORITY, ADMIN
async function createRequest(req, res) {
  const { resource_type: resourceType, quantity, notes, incident_id: incidentId } = req.body;

  const { request, error: dbError } = await requestsService.createRequest({
    requestedBy: req.user.id,
    resourceType,
    quantity,
    notes,
    incidentId,
  });

  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not create resource request');

  await logEvent('privileged_action', req.user.id, { action: 'create_resource_request', requestId: request.id });

  return success(res, { request }, 201);
}

// PATCH /api/resource-requests/:id — AUTHORITY, ADMIN (fulfill/reject)
async function patchRequest(req, res) {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  const { request: existing, error: fetchError } = await requestsService.findRequestById(id);
  if (fetchError || !existing) return sendError(res, 404, 'NOT_FOUND', 'Request not found');

  if (!isValidTransition(RESOURCE_REQUEST_TRANSITIONS, existing.status, newStatus)) {
    return sendError(
      res,
      400,
      'INVALID_TRANSITION',
      `Cannot move request from '${existing.status}' to '${newStatus}'`,
    );
  }

  const { request, error: dbError } = await requestsService.updateRequestStatus(id, newStatus, req.user.id);
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not update resource request');

  await logEvent('privileged_action', req.user.id, { action: 'patch_resource_request', requestId: id, newStatus });

  return success(res, { request });
}

module.exports = { listRequests, createRequest, patchRequest };
