const { success, error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');
const rescueTeamsService = require('../services/rescueTeams.service');

// GET /api/rescue-teams — Auth: required — Roles: AUTHORITY, ADMIN, RESCUER
async function listRescueTeams(req, res) {
  const { rescueTeams, error: dbError } = await rescueTeamsService.findRescueTeams();
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch rescue teams');
  return success(res, { rescueTeams });
}

// POST /api/rescue-teams — Auth: required — Roles: AUTHORITY, ADMIN
async function createRescueTeam(req, res) {
  const { teamName, leadUserId } = req.body;

  const { rescueTeam, error: dbError } = await rescueTeamsService.createRescueTeam({ teamName, leadUserId });
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not create rescue team');

  await logEvent('privileged_action', req.user.id, { action: 'create_rescue_team', teamId: rescueTeam.id });

  return success(res, { rescueTeam }, 201);
}

module.exports = { listRescueTeams, createRescueTeam };
