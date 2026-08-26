const { body, validationResult } = require('express-validator');
const { error: sendError } = require('../utils/apiResponse');

function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return sendError(res, 400, 'VALIDATION_ERROR', result.array()[0].msg);
  }
  return next();
}

// Note: actual signUp/signInWithPassword calls happen client-side
// against Supabase directly (see architecture doc). These
// validators exist for any backend endpoints that accept auth-
// adjacent input, e.g. role-upgrade requests.
const roleUpgradeRequestValidators = [
  body('requestedRole')
    .isIn(['authority', 'hospital', 'admin'])
    .withMessage('requestedRole must be one of authority, hospital, admin'),
  body('organization').optional().isString().trim().isLength({ max: 200 }),
  body('justification').optional().isString().trim().isLength({ max: 1000 }),
  handleValidation,
];

module.exports = { handleValidation, roleUpgradeRequestValidators };
