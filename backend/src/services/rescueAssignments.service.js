const { supabaseAdmin } = require('../config/supabase');

async function findAssignmentsForAuthority() {
  const { data, error } = await supabaseAdmin
    .from('rescue_assignments')
    .select('*, incidents(*), rescue_teams(*)')
    .order('assigned_at', { ascending: false });

  return { assignments: data, error };
}

// "My" assignments for a rescuer = assignments for teams they lead.
async function findAssignmentsForRescuer(userId) {
  const { data: teams, error: teamsError } = await supabaseAdmin
    .from('rescue_teams')
    .select('id')
    .eq('lead_user_id', userId);

  if (teamsError) return { assignments: null, error: teamsError };
  const teamIds = (teams || []).map((t) => t.id);
  if (teamIds.length === 0) return { assignments: [], error: null };

  const { data, error } = await supabaseAdmin
    .from('rescue_assignments')
    .select('*, incidents(*), rescue_teams(*)')
    .in('rescue_team_id', teamIds)
    .order('assigned_at', { ascending: false });

  return { assignments: data, error };
}

async function findAssignmentById(id) {
  const { data, error } = await supabaseAdmin
    .from('rescue_assignments')
    .select('*, rescue_teams(*)')
    .eq('id', id)
    .single();

  return { assignment: data, error };
}

async function createAssignment({ incidentId, rescueTeamId, assignedBy }) {
  const { data, error } = await supabaseAdmin
    .from('rescue_assignments')
    .insert({ incident_id: incidentId, rescue_team_id: rescueTeamId, assigned_by: assignedBy })
    .select()
    .single();

  return { assignment: data, error };
}

async function updateAssignmentStatus(id, status) {
  const { data, error } = await supabaseAdmin
    .from('rescue_assignments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  return { assignment: data, error };
}

async function setRescueTeamStatus(teamId, status) {
  const { data, error } = await supabaseAdmin
    .from('rescue_teams')
    .update({ status })
    .eq('id', teamId)
    .select()
    .single();

  return { team: data, error };
}

// Is a rescuer (via team leadership) allowed to touch this assignment?
async function isTeamLead(userId, teamId) {
  const { data, error } = await supabaseAdmin
    .from('rescue_teams')
    .select('id')
    .eq('id', teamId)
    .eq('lead_user_id', userId)
    .single();

  return !error && !!data;
}

module.exports = {
  findAssignmentsForAuthority,
  findAssignmentsForRescuer,
  findAssignmentById,
  createAssignment,
  updateAssignmentStatus,
  setRescueTeamStatus,
  isTeamLead,
};
