const rateLimit = require('express-rate-limit');
const config = require('../config/rateLimit.config');
const { error: sendError } = require('../utils/apiResponse');

// Both limiters currently use express-rate-limit's default
// in-memory store, which is fine for a single-process hackathon
// deploy but resets on restart and doesn't share state across
// instances. To move to Redis later: install `rate-limit-redis`,
// construct a RedisStore here, and pass it as `store:` below —
// no changes needed anywhere these limiters are imported.

function buildLimiter(settings) {
  return rateLimit({
    windowMs: settings.windowMs,
    max: settings.max,
    standardHeaders: true,
    legacyHeaders: false,
    // Key by user id when authenticated (catches abuse from one
    // account across shifting IPs/proxies), otherwise by IP.
    keyGenerator: (req) => req.user?.id || req.ip,
    handler: (req, res) => {
      sendError(res, 429, 'RATE_LIMITED', settings.message);
    },
  });
}

const authLimiter = buildLimiter(config.auth);
const apiLimiter = buildLimiter(config.api);

module.exports = { authLimiter, apiLimiter };
