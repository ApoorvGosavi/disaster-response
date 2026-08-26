const { body } = require('express-validator');
const { handleValidation } = require('./auth.validators');

const updateProfileValidators = [
  body('full_name').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('phone').optional().isString().trim().isLength({ max: 20 }),
  body('organization').optional().isString().trim().isLength({ max: 200 }),
  handleValidation,
];

module.exports = { updateProfileValidators };
