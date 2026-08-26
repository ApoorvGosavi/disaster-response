// Single source of truth for rate-limit numbers.
// Change limits here, not at each call site.
//
// `store` is left as 'memory' for the hackathon. To move to Redis
// later: implement a RedisStore in middleware/rateLimiter.js and
// swap it in there — nothing in this file or in routes needs to
// change, since call sites only ever import these config objects.

module.exports = {
  store: 'memory',

  // login, register, forgot-password, reset-password
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts. Please try again later.',
  },

  // general authenticated API endpoints
  api: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests. Please slow down.',
  },
};
