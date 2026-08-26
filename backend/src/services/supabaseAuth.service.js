const { supabaseAdmin } = require('../config/supabase');

/**
 * Verify a Supabase access token and return the underlying user.
 * This calls out to Supabase itself (auth.getUser) rather than
 * decoding the JWT locally — that way a token that's been revoked,
 * expired, or otherwise invalidated server-side is rejected even
 * if its signature would still locally "look" valid.
 */
async function verifyAccessToken(accessToken) {
  const { data, error: supabaseError } = await supabaseAdmin.auth.getUser(accessToken);

  if (supabaseError || !data?.user) {
    return { user: null, error: supabaseError };
  }

  return { user: data.user, error: null };
}

/**
 * Fetch the authoritative profile (role, is_active, is_verified)
 * for a user id. We always re-read this from the database rather
 * than trusting anything embedded in the JWT, so a role change
 * takes effect immediately rather than only after the token expires.
 */
async function getProfile(userId) {
  const { data, error: dbError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, role, is_active, is_verified')
    .eq('id', userId)
    .single();

  if (dbError) {
    return { profile: null, error: dbError };
  }

  return { profile: data, error: null };
}

module.exports = { verifyAccessToken, getProfile };
