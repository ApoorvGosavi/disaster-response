const { body, param } = require('express-validator');
const { handleValidation } = require('./auth.validators');

const createIncidentValidators = [
  body('title').isString().trim().isLength({ min: 3, max: 200 }).withMessage('title must be 3-200 characters'),
  body('description').optional().isString().trim().isLength({ max: 2000 }),
  body('disaster_type').optional().isString().trim().isLength({ max: 50 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical', 'unknown']),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  handleValidation,
];

const patchIncidentValidators = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('status')
    .isIn(['verified', 'assigned', 'in_progress', 'resolved', 'closed'])
    .withMessage('status must be a valid incident status'),
  handleValidation,
];

module.exports = { createIncidentValidators, patchIncidentValidators };
