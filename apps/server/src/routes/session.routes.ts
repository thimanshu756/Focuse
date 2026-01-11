import { Router } from 'express';
import { SessionController } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rate-limiter.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  createSessionSchema,
  sessionIdSchema,
  pauseSessionSchema,
  resumeSessionSchema,
  completeSessionSchema,
  failSessionSchema,
  listSessionsSchema,
  statsQuerySchema,
  bulkCompleteSchema,
} from '../validators/session.validator.js';

const router: Router = Router();
const controller = new SessionController();

// POST /api/sessions - Start Focus Session
router.post(
  '/',
  authenticate,
  rateLimiters.taskCreate, // 100/min
  validateRequest(createSessionSchema),
  controller.createSession
);

// GET /api/sessions - List Sessions
router.get(
  '/',
  authenticate,
  rateLimiters.taskList, // 200/min
  validateRequest(listSessionsSchema),
  controller.listSessions
);

// GET /api/sessions/active - Get Active Session (must come before /:id)
router.get('/active', authenticate, rateLimiters.standard, controller.getActiveSession);

// GET /api/sessions/stats - Session Statistics (must come before /:id)
router.get(
  '/stats',
  authenticate,
  rateLimiters.standard,
  validateRequest(statsQuerySchema),
  controller.getSessionStats
);

// GET /api/sessions/:id - Get Single Session
router.get(
  '/:id',
  authenticate,
  rateLimiters.standard,
  validateRequest(sessionIdSchema),
  controller.getSession
);

// PUT /api/sessions/:id/pause - Pause Session
router.put(
  '/:id/pause',
  authenticate,
  rateLimiters.sessionPauseResume,
  validateRequest(pauseSessionSchema),
  controller.pauseSession
);

// PUT /api/sessions/:id/resume - Resume Session
router.put(
  '/:id/resume',
  authenticate,
  rateLimiters.sessionPauseResume,
  validateRequest(resumeSessionSchema),
  controller.resumeSession
);

// PUT /api/sessions/:id/complete - Complete Session
router.put(
  '/:id/complete',
  authenticate,
  rateLimiters.sessionComplete,
  validateRequest(completeSessionSchema),
  controller.completeSession
);

// PUT /api/sessions/:id/fail - Fail Session
router.put(
  '/:id/fail',
  authenticate,
  rateLimiters.sessionComplete,
  validateRequest(failSessionSchema),
  controller.failSession
);

// POST /api/sessions/bulk-complete - Bulk Complete (System)
router.post(
  '/bulk-complete',
  authenticate,
  rateLimiters.bulkOperations,
  validateRequest(bulkCompleteSchema),
  controller.bulkComplete
);

export default router;

