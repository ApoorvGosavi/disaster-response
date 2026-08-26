const { supabaseAdmin } = require('../config/supabase');

// SERVICE LAYER — only file that queries volunteer_tasks.

async function findAllTasks() {
  const { data, error } = await supabaseAdmin
    .from('volunteer_tasks')
    .select('*')
    .order('created_at', { ascending: false });

  return { tasks: data, error };
}

// Volunteers see: open tasks (available to accept) + their own
// accepted/in-progress/completed tasks.
async function findTasksForVolunteer(userId) {
  const { data, error } = await supabaseAdmin
    .from('volunteer_tasks')
    .select('*')
    .or(`status.eq.open,assigned_to.eq.${userId}`)
    .order('created_at', { ascending: false });

  return { tasks: data, error };
}

async function findTaskById(id) {
  const { data, error } = await supabaseAdmin.from('volunteer_tasks').select('*').eq('id', id).single();
  return { task: data, error };
}

async function createTask({ title, description, location, incidentId, createdBy }) {
  const { data, error } = await supabaseAdmin
    .from('volunteer_tasks')
    .insert({
      title,
      description,
      location,
      incident_id: incidentId || null,
      created_by: createdBy,
      status: 'open',
    })
    .select()
    .single();

  return { task: data, error };
}

async function acceptTask(id, volunteerId) {
  // Only succeeds if the task is still 'open' — guards against a
  // race where two volunteers try to accept the same task at once.
  const { data, error } = await supabaseAdmin
    .from('volunteer_tasks')
    .update({ status: 'assigned', assigned_to: volunteerId })
    .eq('id', id)
    .eq('status', 'open')
    .select()
    .single();

  return { task: data, error };
}

async function updateTaskStatus(id, status) {
  const { data, error } = await supabaseAdmin
    .from('volunteer_tasks')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  return { task: data, error };
}

module.exports = { findAllTasks, findTasksForVolunteer, findTaskById, createTask, acceptTask, updateTaskStatus };
