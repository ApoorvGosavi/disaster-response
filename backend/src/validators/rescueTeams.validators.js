const { body } = require('express-validator');
const { handleValidation } = require('./auth.validators');

const createRescueTeamValidators = [
  body('teamName').isString().trim().isLength({ min: 2, max: 100 }).withMessage('teamName must be 2-100 characters'),
  body('leadUserId').optional({ nullable: true }).isUUID().withMessage('leadUserId must be a valid UUID'),
  handleValidation,
];

module.exports = { createRescueTeamValidators };
