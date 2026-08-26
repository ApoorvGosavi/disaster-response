const { supabaseAdmin } = require('../config/supabase');

// SERVICE LAYER
// This is the only file that constructs Supabase queries for
// incidents. Controllers never call supabaseAdmin directly — that
// keeps business logic in one place, makes it testable in
// isolation, and means if you ever swap how incidents are stored,
// only this file changes.

const RESPONDER_ROLES = ['authority', 'admin', 'rescuer', 'volunteer'];

async function findIncidents({ userId, role }) {
  let query = supabaseAdmin
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  // Row-level scoping in application code. RLS (02_rls.sql) enforces
  // the same rule independently if this endpoint is ever bypassed.
  if (!RESPONDER_ROLES.includes(role)) {
    query = query.eq('reported_by', userId);
  }

  const { data, error } = await query;
  return { incidents: data, error };
}

async function createIncident({ reportedBy, title, description, disasterType, severity, latitude, longitude }) {
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .insert({
      reported_by: reportedBy,
      title,
      description,
      disaster_type: disasterType || null,
      severity: severity || 'unknown',
      latitude,
      longitude,
      status: 'reported',
    })
    .select()
    .single();

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('Supabase insert into incidents returned:', { data, error });
  }

  return { incident: data, error };
}

async function findIncidentById(id) {
  const { data, error } = await supabaseAdmin.from('incidents').select('*').eq('id', id).single();
  return { incident: data, error };
}

async function updateIncidentStatus(id, status) {
  const { data, error } = await supabaseAdmin
    .from('incidents')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  return { incident: data, error };
}

module.exports = { findIncidents, createIncident, findIncidentById, updateIncidentStatus };
