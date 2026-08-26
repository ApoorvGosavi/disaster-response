const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { apiLimiter } = require('../middleware/rateLimiter');
const { updateHospitalValidators } = require('../validators/hospitals.validators');
const { listHospitals, updateHospital } = require('../controllers/hospitals.controller');

const router = express.Router();

router.use(apiLimiter, requireAuth);

// GET /api/hospitals — Auth: required — Roles: AUTHORITY, ADMIN, HOSPITAL, RESCUER
router.get('/', requireRole(['authority', 'admin', 'hospital', 'rescuer']), listHospitals);

// PUT /api/hospitals/:id — Auth: required — Roles: HOSPITAL (own record), ADMIN
router.put('/:id', requireRole(['hospital', 'admin']), updateHospitalValidators, updateHospital);

module.exports = router;
