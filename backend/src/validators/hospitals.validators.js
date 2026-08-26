const { body, param } = require('express-validator');
const { handleValidation } = require('./auth.validators');

const updateHospitalValidators = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('total_beds').optional().isInt({ min: 0 }).withMessage('total_beds must be a non-negative integer'),
  body('available_beds').optional().isInt({ min: 0 }).withMessage('available_beds must be a non-negative integer'),
  body('icu_available').optional().isInt({ min: 0 }).withMessage('icu_available must be a non-negative integer'),
  handleValidation,
];

module.exports = { updateHospitalValidators };
