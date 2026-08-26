const { success, error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');
const assignmentsService = require('../services/rescueAssignments.service');
const incidentsService = require('../services/incidents.service');
const rescueTeamsService = require('../services/rescueTeams.service');
const incidentUpdatesService = require('../services/incidentUpdates.service');
const notificationsService = require('../services/notifications.service');
const { ASSIGNMENT_TRANSITIONS, isValidTransition } = require('../utils/statusTransitions');

// GET /api/rescue-assignments — AUTHORITY, ADMIN
async function listAssignments(req, res) {
  const { assignments, error: dbError } = await assignmentsService.findAssignmentsForAuthority();
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch assignments');
  return success(res, { assignments });
}

// GET /api/rescue-assignments/my — RESCUER (team lead)
async function listMyAssignments(req, res) {
  const { assignments, error: dbError } = await assignmentsService.findAssignmentsForRescuer(req.user.id);
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch your assignments');
  return success(res, { assignments });
}

// POST /api/rescue-assignments — AUTHORITY, ADMIN
// Assigns a rescue team to a verified incident: creates the
// assignment, flips the team to 'deployed', advances the incident
// to 'assigned', and writes a history entry — all or nothing isn't
// transactional here (hackathon scope), but every step is checked.
async function createAssignment(req, res) {
  const { incident_id: incidentId, rescue_team_id: rescueTeamId } = req.body;

  const { incident, error: incidentError } = await incidentsService.findIncidentById(incidentId);
  if (incidentError || !incident) return sendError(res, 404, 'NOT_FOUND', 'Incident not found');

  if (incident.status !== 'verified') {
    return sendError(res, 400, 'INVALID_TRANSITION', 'Only verified incidents can be assigned a rescue team');
  }

  const { team, error: teamFetchError } = await rescueTeamsService.findRescueTeamById(rescueTeamId);
  if (teamFetchError || !team) return sendError(res, 404, 'NOT_FOUND', 'Rescue team not found');

  if (team.status !== 'available') {
    return sendError(res, 400, 'TEAM_UNAVAILABLE', 'This rescue team is not currently available');
  }

  const { assignment, error: dbError } = await assignmentsService.createAssignment({
    incidentId,
    rescueTeamId,
    assignedBy: req.user.id,
  });
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not create assignment');

  await assignmentsService.setRescueTeamStatus(rescueTeamId, 'deployed');

  await incidentsService.updateIncidentStatus(incidentId, 'assigned');

  await incidentUpdatesService.createIncidentUpdate({
    incidentId,
    updatedBy: req.user.id,
    previousStatus: incident.status,
    newStatus: 'assigned',
    message: `Rescue team "${team.team_name}" assigned`,
  });

  if (team.lead_user_id) {
    await notificationsService.createNotification({
      userId: team.lead_user_id,
      title: 'New assignment',
      message: `Your team has been assigned to incident "${incident.title}".`,
    });
  }

  await logEvent('privileged_action', req.user.id, {
    action: 'create_rescue_assignment',
    incidentId,
    rescueTeamId,
  });

  return success(res, { assignment }, 201);
}

// PATCH /api/rescue-assignments/:id — RESCUER (own team's assignment only), ADMIN
async function patchAssignment(req, res) {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  const { assignment, error: fetchError } = await assignmentsService.findAssignmentById(id);
  if (fetchError || !assignment) return sendError(res, 404, 'NOT_FOUND', 'Assignment not found');

  if (req.user.role === 'rescuer') {
    const allowed = await assignmentsService.isTeamLead(req.user.id, assignment.rescue_team_id);
    if (!allowed) {
      return sendError(res, 403, 'FORBIDDEN', 'You can only update assignments for your own team');
    }
  }

  if (!isValidTransition(ASSIGNMENT_TRANSITIONS, assignment.status, newStatus)) {
    return sendError(
      res,
      400,
      'INVALID_TRANSITION',
      `Cannot move assignment from '${assignment.status}' to '${newStatus}'`,
    );
  }

  const { assignment: updated, error: dbError } = await assignmentsService.updateAssignmentStatus(id, newStatus);
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not update assignment');

  await incidentUpdatesService.createIncidentUpdate({
    incidentId: assignment.incident_id,
    updatedBy: req.user.id,
    previousStatus: assignment.status,
    newStatus: `assignment:${newStatus}`,
    message: `Rescue team status: ${newStatus}`,
  });

  // Keep the incident's own status roughly in sync with rescue progress.
  if (newStatus === 'responding') {
    await incidentsService.updateIncidentStatus(assignment.incident_id, 'in_progress');
  }
  if (newStatus === 'resolved') {
    await incidentsService.updateIncidentStatus(assignment.incident_id, 'resolved');
    await assignmentsService.setRescueTeamStatus(assignment.rescue_team_id, 'available');
  }

  await logEvent('privileged_action', req.user.id, { action: 'patch_assignment_status', assignmentId: id, newStatus });

  return success(res, { assignment: updated });
}

module.exports = { listAssignments, listMyAssignments, createAssignment, patchAssignment };
