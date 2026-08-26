const { error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');

/**
 * requireRole(['authority', 'admin'])
 * ------------------------------------
 * Must run AFTER requireAuth, since it reads req.user.role, which
 * requireAuth populated from a fresh database read — never from a
 * value the client sent in the request body/headers/JWT claims.
 *
 * Returns 403 (not 401) on failure: the caller IS authenticated,
 * they're just not permitted to do this particular thing.
 */
function requireRole(allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      // Misconfiguration guard: requireRole used without requireAuth first.
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      await logEvent('unauthorized_attempt', req.user.id, {
        reason: 'insufficient_role',
        requiredRoles: allowedRoles,
        actualRole: req.user.role,
        path: req.originalUrl,
      });
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to perform this action');
    }

    return next();
  };
}

module.exports = requireRole;
