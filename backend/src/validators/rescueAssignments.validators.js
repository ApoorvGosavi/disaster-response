const { body, param } = require('express-validator');
const { handleValidation } = require('./auth.validators');

const createAssignmentValidators = [
  body('incident_id').isUUID().withMessage('incident_id must be a valid UUID'),
  body('rescue_team_id').isUUID().withMessage('rescue_team_id must be a valid UUID'),
  handleValidation,
];

const patchAssignmentValidators = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('status')
    .isIn(['accepted', 'en_route', 'arrived', 'responding', 'resolved'])
    .withMessage('status must be a valid assignment status'),
  handleValidation,
];

module.exports = { createAssignmentValidators, patchAssignmentValidators };
