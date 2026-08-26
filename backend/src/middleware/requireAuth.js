const { verifyAccessToken, getProfile } = require('../services/supabaseAuth.service');
const { error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');

/**
 * requireAuth
 * ------------
 * 1. Pulls the bearer token out of the Authorization header.
 * 2. Verifies it against Supabase itself (not a local JWT decode)
 *    so revoked/expired sessions are rejected server-side.
 * 3. Re-reads the user's profile (role, is_active) fresh from the
 *    database — never trusts anything the frontend claims about
 *    the user, and never trusts stale role data from the token.
 * 4. Attaches `req.user = { id, email, role, isActive, isVerified }`
 *    for downstream middleware/controllers.
 *
 * Any route that touches user-specific or protected data should
 * be wrapped with this BEFORE requireRole.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
  }

  const { user, error: verifyError } = await verifyAccessToken(token);

  if (verifyError || !user) {
    return sendError(res, 401, 'INVALID_TOKEN', 'Invalid or expired session');
  }

  const { profile, error: profileError } = await getProfile(user.id);

  if (profileError || !profile) {
    return sendError(res, 401, 'PROFILE_NOT_FOUND', 'User profile could not be resolved');
  }

  if (!profile.is_active) {
    await logEvent('unauthorized_attempt', user.id, {
      reason: 'disabled_account',
      path: req.originalUrl,
    });
    return sendError(res, 403, 'ACCOUNT_DISABLED', 'This account has been deactivated');
  }

  req.user = {
    id: user.id,
    email: profile.email,
    role: profile.role,
    isActive: profile.is_active,
    isVerified: profile.is_verified,
  };

  return next();
}

module.exports = requireAuth;
