const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// ADMIN client — uses the service-role key, which bypasses RLS.
// This is safe here because it only ever runs on the server, and
// we deliberately restrict what we use it for:
//   1. verifying user access tokens (auth.getUser)
//   2. writing audit_logs (which has no client insert policy)
//   3. admin-only operations explicitly gated by requireRole('admin')
// It must NEVER be sent to the frontend or logged.
const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabaseAdmin };
