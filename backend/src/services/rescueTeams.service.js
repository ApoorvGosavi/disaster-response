const { supabaseAdmin } = require('../config/supabase');

// SERVICE LAYER — only file that queries the rescue_teams table.

async function findRescueTeams() {
  const { data, error } = await supabaseAdmin
    .from('rescue_teams')
    .select('*')
    .order('team_name', { ascending: true });

  return { rescueTeams: data, error };
}

async function createRescueTeam({ teamName, leadUserId }) {
  const { data, error } = await supabaseAdmin
    .from('rescue_teams')
    .insert({ team_name: teamName, lead_user_id: leadUserId || null })
    .select()
    .single();

  return { rescueTeam: data, error };
}

async function findRescueTeamById(id) {
  const { data, error } = await supabaseAdmin.from('rescue_teams').select('*').eq('id', id).single();
  return { rescueTeam: data, error };
}

async function updateRescueTeamStatus(id, status) {
  const { data, error } = await supabaseAdmin
    .from('rescue_teams')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  return { rescueTeam: data, error };
}

module.exports = { findRescueTeams, createRescueTeam, findRescueTeamById, updateRescueTeamStatus };
