const { success, error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');
const incidentsService = require('../services/incidents.service');
const incidentUpdatesService = require('../services/incidentUpdates.service');
const notificationsService = require('../services/notifications.service');
const { INCIDENT_TRANSITIONS, isValidTransition } = require('../utils/statusTransitions');

const RESPONDER_ROLES = ['authority', 'admin', 'rescuer', 'volunteer'];

// GET /api/incidents
async function listIncidents(req, res) {
  const { incidents, error: dbError } = await incidentsService.findIncidents({
    userId: req.user.id,
    role: req.user.role,
  });

  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch incidents');
  return success(res, { incidents });
}

// GET /api/incidents/:id
async function getIncident(req, res) {
  const { id } = req.params;
  const { incident, error: dbError } = await incidentsService.findIncidentById(id);

  if (dbError || !incident) return sendError(res, 404, 'NOT_FOUND', 'Incident not found');

  const isOwner = incident.reported_by === req.user.id;
  const isResponder = RESPONDER_ROLES.includes(req.user.role);
  if (!isOwner && !isResponder) {
    return sendError(res, 403, 'FORBIDDEN', 'You do not have access to this incident');
  }

  return success(res, { incident });
}

// GET /api/incidents/:id/updates
async function getIncidentUpdates(req, res) {
  const { id } = req.params;
  const { incident, error: fetchError } = await incidentsService.findIncidentById(id);
  if (fetchError || !incident) return sendError(res, 404, 'NOT_FOUND', 'Incident not found');

  const isOwner = incident.reported_by === req.user.id;
  const isResponder = RESPONDER_ROLES.includes(req.user.role);
  if (!isOwner && !isResponder) {
    return sendError(res, 403, 'FORBIDDEN', 'You do not have access to this incident');
  }

  const { updates, error: dbError } = await incidentUpdatesService.findUpdatesForIncident(id);
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch incident history');

  return success(res, { updates });
}

// POST /api/incidents — CITIZEN, AUTHORITY, ADMIN
async function createIncident(req, res) {
  const { title, description, disaster_type: disasterType, severity, latitude, longitude } = req.body;

  const { incident, error: dbError } = await incidentsService.createIncident({
    reportedBy: req.user.id,
    title,
    description,
    disasterType,
    severity,
    latitude,
    longitude,
  });

  if (dbError || !incident) {
    // eslint-disable-next-line no-console
    console.error('createIncident failed:', dbError?.message || dbError || 'No incident returned from insert');
    return sendError(res, 500, 'DB_ERROR', 'Could not create incident');
  }

  await incidentUpdatesService.createIncidentUpdate({
    incidentId: incident.id,
    updatedBy: req.user.id,
    previousStatus: null,
    newStatus: 'reported',
    message: 'Incident reported',
  });

  await logEvent('privileged_action', req.user.id, { action: 'create_incident', incidentId: incident.id });

  return success(res, { incident }, 201);
}

// PATCH /api/incidents/:id — AUTHORITY, ADMIN only (status transitions)
// The backend is the source of truth on which transitions are legal —
// the frontend can only request one, never force an arbitrary value.
async function patchIncident(req, res) {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  const { incident, error: fetchError } = await incidentsService.findIncidentById(id);
  if (fetchError || !incident) return sendError(res, 404, 'NOT_FOUND', 'Incident not found');

  if (!isValidTransition(INCIDENT_TRANSITIONS, incident.status, newStatus)) {
    return sendError(
      res,
      400,
      'INVALID_TRANSITION',
      `Cannot move incident from '${incident.status}' to '${newStatus}'`,
    );
  }

  const { incident: updated, error: dbError } = await incidentsService.updateIncidentStatus(id, newStatus);
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not update incident');

  await incidentUpdatesService.createIncidentUpdate({
    incidentId: id,
    updatedBy: req.user.id,
    previousStatus: incident.status,
    newStatus,
    message: `Status changed to ${newStatus}`,
  });

  await notificationsService.createNotification({
    userId: incident.reported_by,
    title: 'Incident update',
    message: `Your report "${incident.title}" is now ${newStatus}.`,
  });

  await logEvent('privileged_action', req.user.id, { action: 'patch_incident_status', incidentId: id, newStatus });

  return success(res, { incident: updated });
}

module.exports = { listIncidents, getIncident, getIncidentUpdates, createIncident, patchIncident };
