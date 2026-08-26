const { success, error: sendError } = require('../utils/apiResponse');
const { logEvent } = require('../services/audit.service');
const notificationsService = require('../services/notifications.service');
const tasksService = require('../services/volunteerTasks.service');
const { VOLUNTEER_TASK_TRANSITIONS, isValidTransition } = require('../utils/statusTransitions');

const MANAGER_ROLES = ['authority', 'admin'];

// GET /api/volunteer-tasks — any authenticated role
// Volunteers see open + their own; authority/admin/others see all.
async function listTasks(req, res) {
  const isVolunteer = req.user.role === 'volunteer';
  const { tasks, error: dbError } = isVolunteer
    ? await tasksService.findTasksForVolunteer(req.user.id)
    : await tasksService.findAllTasks();

  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not fetch volunteer tasks');
  return success(res, { tasks });
}

// POST /api/volunteer-tasks — AUTHORITY, ADMIN
async function createTask(req, res) {
  const { title, description, location, incident_id: incidentId } = req.body;

  const { task, error: dbError } = await tasksService.createTask({
    title,
    description,
    location,
    incidentId,
    createdBy: req.user.id,
  });

  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not create task');

  await logEvent('privileged_action', req.user.id, { action: 'create_volunteer_task', taskId: task.id });

  return success(res, { task }, 201);
}

// PATCH /api/volunteer-tasks/:id/accept — VOLUNTEER
async function acceptTask(req, res) {
  const { id } = req.params;

  const { task: existing, error: fetchError } = await tasksService.findTaskById(id);
  if (fetchError || !existing) return sendError(res, 404, 'NOT_FOUND', 'Task not found');

  if (existing.status !== 'open') {
    return sendError(res, 400, 'INVALID_TRANSITION', 'This task is no longer available');
  }

  const { task, error: dbError } = await tasksService.acceptTask(id, req.user.id);
  if (dbError || !task) {
    return sendError(res, 409, 'CONFLICT', 'This task was just accepted by someone else');
  }

  if (existing.created_by) {
    await notificationsService.createNotification({
      userId: existing.created_by,
      title: 'Task accepted',
      message: `"${task.title}" was accepted by a volunteer.`,
    });
  }

  await logEvent('privileged_action', req.user.id, { action: 'accept_volunteer_task', taskId: id });

  return success(res, { task });
}

// PATCH /api/volunteer-tasks/:id — assigned volunteer (own task) or AUTHORITY/ADMIN
async function patchTask(req, res) {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  const { task: existing, error: fetchError } = await tasksService.findTaskById(id);
  if (fetchError || !existing) return sendError(res, 404, 'NOT_FOUND', 'Task not found');

  const isManager = MANAGER_ROLES.includes(req.user.role);
  const isAssignee = existing.assigned_to === req.user.id;
  if (!isManager && !isAssignee) {
    return sendError(res, 403, 'FORBIDDEN', 'You can only update tasks assigned to you');
  }

  if (!isValidTransition(VOLUNTEER_TASK_TRANSITIONS, existing.status, newStatus)) {
    return sendError(
      res,
      400,
      'INVALID_TRANSITION',
      `Cannot move task from '${existing.status}' to '${newStatus}'`,
    );
  }

  const { task, error: dbError } = await tasksService.updateTaskStatus(id, newStatus);
  if (dbError) return sendError(res, 500, 'DB_ERROR', 'Could not update task');

  await logEvent('privileged_action', req.user.id, { action: 'patch_volunteer_task', taskId: id, newStatus });

  return success(res, { task });
}

module.exports = { listTasks, createTask, acceptTask, patchTask };
