const { supabaseAdmin } = require('../config/supabase');

// SERVICE LAYER — only file that queries the hospitals table.

async function findHospitals() {
  const { data, error } = await supabaseAdmin.from('hospitals').select('*').order('name', { ascending: true });
  return { hospitals: data, error };
}

async function findHospitalById(id) {
  const { data, error } = await supabaseAdmin.from('hospitals').select('*').eq('id', id).single();
  return { hospital: data, error };
}

async function updateHospital(id, { total_beds, available_beds, icu_available }) {
  const updates = { updated_at: new Date().toISOString() };
  if (total_beds !== undefined) updates.total_beds = total_beds;
  if (available_beds !== undefined) updates.available_beds = available_beds;
  if (icu_available !== undefined) updates.icu_available = icu_available;

  const { data, error } = await supabaseAdmin
    .from('hospitals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { hospital: data, error };
}

async function createHospital({ managedBy, name, totalBeds }) {
  const { data, error } = await supabaseAdmin
    .from('hospitals')
    .insert({ managed_by: managedBy, name, total_beds: totalBeds || 0 })
    .select()
    .single();

  return { hospital: data, error };
}

module.exports = { findHospitals, findHospitalById, updateHospital, createHospital };
