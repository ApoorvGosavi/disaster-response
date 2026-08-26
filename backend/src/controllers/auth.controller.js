const { success } = require('../utils/apiResponse');

// GET /api/auth/me
// requireAuth has already verified the token and attached req.user
// from a fresh database read, so this endpoint just echoes it back.
// Useful for the frontend to confirm "who am I / what's my role"
// against the backend's own authoritative view, rather than only
// trusting client-side session state.
function getMe(req, res) {
  return success(res, { user: req.user });
}

module.exports = { getMe };
