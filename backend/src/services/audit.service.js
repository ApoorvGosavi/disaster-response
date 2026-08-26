const { supabaseAdmin } = require('../config/supabase');

/**
 * Write a security-relevant event to audit_logs using the
 * service-role client (RLS has no client insert policy on this
 * table by design — only the backend, with elevated credentials,
 * may write here).
 *
 * NEVER pass passwords, access tokens, or refresh tokens in
 * `metadata`.
 */
async function logEvent(eventType, userId, metadata = {}) {
  const safeMetadata = { ...metadata };
  delete safeMetadata.password;
  delete safeMetadata.token;
  delete safeMetadata.accessToken;
  delete safeMetadata.refreshToken;

  const { error } = await supabaseAdmin.from('audit_logs').insert({
    user_id: userId || null,
    event_type: eventType,
    metadata: safeMetadata,
  });

  if (error) {
    // Audit logging failures should never break the request flow,
    // but they should be visible in server logs.
    // eslint-disable-next-line no-console
    console.error('Failed to write audit log:', error.message);
  }
}

module.exports = { logEvent };
