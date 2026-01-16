import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireSubscription } from '../middleware/authorize.middleware.js';
import { rateLimiters } from '../middleware/rate-limiter.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { aiTimeout } from '../middleware/timeout.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksSchema,
  taskIdSchema,
  aiBreakdownSchema,
  bulkDeleteSchema,
  bulkCreateSchema,
} from '../validators/task.validator.js';

const router: Router = Router();
const controller = new TaskController();

// POST /api/tasks - Create Task
router.post(
  '/',
  authenticate,
  rateLimiters.taskCreate,
  validateRequest(createTaskSchema),
  controller.createTask
);

// GET /api/tasks - List Tasks
router.get(
  '/',
  authenticate,
  rateLimiters.taskList,
  validateRequest(listTasksSchema),
  controller.listTasks
);

// GET /api/tasks/:id - Get Single Task
router.get(
  '/:id',
  authenticate,
  rateLimiters.standard,
  validateRequest(taskIdSchema),
  controller.getTask
);

// PUT /api/tasks/:id - Update Task
router.put(
  '/:id',
  authenticate,
  rateLimiters.standard,
  validateRequest(updateTaskSchema),
  controller.updateTask
);

// DELETE /api/tasks/:id - Delete Task (Soft Delete)
router.delete(
  '/:id',
  authenticate,
  rateLimiters.standard,
  validateRequest(taskIdSchema),
  controller.deleteTask
);

// PATCH /api/tasks/:id/complete - Mark Complete
router.patch(
  '/:id/complete',
  authenticate,
  rateLimiters.standard,
  validateRequest(taskIdSchema),
  controller.completeTask
);

// POST /api/tasks/ai-breakdown - AI Task Breakdown (PRO only)
router.post(
  '/ai-breakdown',
  authenticate,
  requireSubscription('PRO', 'ENTERPRISE'),
  aiTimeout, // Extended timeout for AI operations
  rateLimiters.aiBreakdown,
  validateRequest(aiBreakdownSchema),
  controller.aiBreakdown
);

// POST /api/tasks/bulk-delete - Bulk Delete
router.post(
  '/bulk-delete',
  authenticate,
  rateLimiters.bulkOperations,
  validateRequest(bulkDeleteSchema),
  controller.bulkDelete
);

// POST /api/tasks/bulk-create - Bulk Create
router.post(
  '/bulk-create',
  authenticate,
  rateLimiters.bulkOperations,
  validateRequest(bulkCreateSchema),
  controller.bulkCreate
);

export default router;

