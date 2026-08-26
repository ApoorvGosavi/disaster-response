const { supabaseAdmin } = require('../config/supabase');

// Append-only incident history. Every meaningful status change
// (verify, assign, rescuer progress) writes one row here.
async function createIncidentUpdate({ incidentId, updatedBy, previousStatus, newStatus, message }) {
  const { data, error } = await supabaseAdmin
    .from('incident_updates')
    .insert({
      incident_id: incidentId,
      updated_by: updatedBy,
      previous_status: previousStatus,
      new_status: newStatus,
      message: message || null,
    })
    .select()
    .single();

  return { update: data, error };
}

async function findUpdatesForIncident(incidentId) {
  const { data, error } = await supabaseAdmin
    .from('incident_updates')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: true });

  return { updates: data, error };
}

module.exports = { createIncidentUpdate, findUpdatesForIncident };
