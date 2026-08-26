const { body } = require('express-validator');
const { handleValidation } = require('./auth.validators');

const createShelterValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 150 }).withMessage('name must be 2-150 characters'),
  body('capacity').optional().isInt({ min: 0 }).withMessage('capacity must be a non-negative integer'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  handleValidation,
];

module.exports = { createShelterValidators };
