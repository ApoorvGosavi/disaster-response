const { body, param } = require('express-validator');
const { handleValidation } = require('./auth.validators');

const createResourceRequestValidators = [
  body('resource_type').isString().trim().isLength({ min: 2, max: 100 }).withMessage('resource_type must be 2-100 characters'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  body('incident_id').optional({ nullable: true }).isUUID().withMessage('incident_id must be a valid UUID'),
  handleValidation,
];

const patchResourceRequestValidators = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('status').isIn(['fulfilled', 'rejected']).withMessage('status must be fulfilled or rejected'),
  handleValidation,
];

module.exports = { createResourceRequestValidators, patchResourceRequestValidators };
