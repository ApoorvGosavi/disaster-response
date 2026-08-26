const { supabaseAdmin } = require('../config/supabase');

async function getProfileById(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { profile: data, error };
}

// Only permits updating non-privileged fields. `role` and
// `is_verified` are intentionally excluded here — the trigger
// prevent_role_self_escalation() also blocks this at the DB
// level, but we don't even attempt it from application code,
// following defense-in-depth.
async function updateOwnProfile(userId, updates) {
  const allowed = ['full_name', 'phone', 'organization'];
  const safeUpdates = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key];
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(safeUpdates)
    .eq('id', userId)
    .select()
    .single();

  return { profile: data, error };
}

async function createRoleUpgradeRequest(userId, requestedRole, organization, justification) {
  const { data, error } = await supabaseAdmin
    .from('role_upgrade_requests')
    .insert({
      user_id: userId,
      requested_role: requestedRole,
      organization,
      justification,
    })
    .select()
    .single();

  return { request: data, error };
}

module.exports = { getProfileById, updateOwnProfile, createRoleUpgradeRequest };
