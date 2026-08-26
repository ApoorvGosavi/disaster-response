const express = require('express');

const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const incidentsRoutes = require('./incidents.routes');
const rescueTeamsRoutes = require('./rescueTeams.routes');
const rescueAssignmentsRoutes = require('./rescueAssignments.routes');
const hospitalsRoutes = require('./hospitals.routes');
const sheltersRoutes = require('./shelters.routes');
const notificationsRoutes = require('./notifications.routes');
const volunteerTasksRoutes = require('./volunteerTasks.routes');
const resourceRequestsRoutes = require('./resourceRequests.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', profileRoutes);
router.use('/incidents', incidentsRoutes);
router.use('/rescue-teams', rescueTeamsRoutes);
router.use('/rescue-assignments', rescueAssignmentsRoutes);
router.use('/hospitals', hospitalsRoutes);
router.use('/shelters', sheltersRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/volunteer-tasks', volunteerTasksRoutes);
router.use('/resource-requests', resourceRequestsRoutes);

module.exports = router;
