const { body, param } = require('express-validator');
const { handleValidation } = require('./auth.validators');

const createVolunteerTaskValidators = [
  body('title').isString().trim().isLength({ min: 3, max: 150 }).withMessage('title must be 3-150 characters'),
  body('description').optional().isString().trim().isLength({ max: 1000 }),
  body('location').optional().isString().trim().isLength({ max: 200 }),
  body('incident_id').optional({ nullable: true }).isUUID().withMessage('incident_id must be a valid UUID'),
  handleValidation,
];

const patchVolunteerTaskValidators = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('status')
    .isIn(['in_progress', 'completed', 'cancelled'])
    .withMessage('status must be a valid task status'),
  handleValidation,
];

module.exports = { createVolunteerTaskValidators, patchVolunteerTaskValidators };
