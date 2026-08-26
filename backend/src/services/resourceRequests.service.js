const { supabaseAdmin } = require('../config/supabase');

// SERVICE LAYER — only file that queries resource_requests.

async function findAllRequests() {
  const { data, error } = await supabaseAdmin
    .from('resource_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return { requests: data, error };
}

async function findRequestsForUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('resource_requests')
    .select('*')
    .eq('requested_by', userId)
    .order('created_at', { ascending: false });

  return { requests: data, error };
}

async function findRequestById(id) {
  const { data, error } = await supabaseAdmin.from('resource_requests').select('*').eq('id', id).single();
  return { request: data, error };
}

async function createRequest({ requestedBy, resourceType, quantity, notes, incidentId }) {
  const { data, error } = await supabaseAdmin
    .from('resource_requests')
    .insert({
      requested_by: requestedBy,
      resource_type: resourceType,
      quantity,
      notes,
      incident_id: incidentId || null,
      status: 'pending',
    })
    .select()
    .single();

  return { request: data, error };
}

async function updateRequestStatus(id, status, reviewedBy) {
  const { data, error } = await supabaseAdmin
    .from('resource_requests')
    .update({ status, reviewed_by: reviewedBy })
    .eq('id', id)
    .select()
    .single();

  return { request: data, error };
}

module.exports = { findAllRequests, findRequestsForUser, findRequestById, createRequest, updateRequestStatus };
