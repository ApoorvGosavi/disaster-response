const { supabaseAdmin } = require('../config/supabase');

// SERVICE LAYER — only file that queries the shelters table.

async function findShelters() {
  const { data, error } = await supabaseAdmin.from('shelters').select('*').order('name', { ascending: true });
  return { shelters: data, error };
}

async function createShelter({ managedBy, name, capacity, latitude, longitude }) {
  const { data, error } = await supabaseAdmin
    .from('shelters')
    .insert({ managed_by: managedBy, name, capacity: capacity || 0, latitude, longitude })
    .select()
    .single();

  return { shelter: data, error };
}

async function findShelterById(id) {
  const { data, error } = await supabaseAdmin.from('shelters').select('*').eq('id', id).single();
  return { shelter: data, error };
}

async function updateShelterOccupancy(id, currentOccupancy) {
  const { data, error } = await supabaseAdmin
    .from('shelters')
    .update({ current_occupancy: currentOccupancy })
    .eq('id', id)
    .select()
    .single();

  return { shelter: data, error };
}

module.exports = { findShelters, createShelter, findShelterById, updateShelterOccupancy };
