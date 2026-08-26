const { supabaseAdmin } = require('../config/supabase');

// Minimal in-app notification feed. Called by other services when
// a meaningful event happens (verified, assigned, status changed).
async function createNotification({ userId, title, message }) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({ user_id: userId, title, message })
    .select()
    .single();

  if (error) {
    // Never let a notification failure break the main workflow action.
    // eslint-disable-next-line no-console
    console.error('Failed to create notification:', error.message);
  }

  return { notification: data, error };
}

async function findNotificationsForUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return { notifications: data, error };
}

module.exports = { createNotification, findNotificationsForUser };
