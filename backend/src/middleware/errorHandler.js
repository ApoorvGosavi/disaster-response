const env = require('../config/env');

// Centralized error handler. Keeps stack traces/internal details
// out of API responses (which would otherwise leak implementation
// details to an attacker) while still logging them server-side.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.status || 500;
  const isServerError = status >= 500;

  res.status(status).json({
    success: false,
    error: {
      code: err.code || (isServerError ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message: isServerError && env.nodeEnv === 'production'
        ? 'Something went wrong. Please try again later.'
        : err.message || 'Unexpected error',
    },
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` },
  });
}

module.exports = { errorHandler, notFoundHandler };
