/**
 * Bidirectional sync routes for mobile
 */

import { Router } from 'express';
import { SyncV2Controller } from '../controllers/sync-v2.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { rateLimiters } from '../middleware/rate-limiter.middleware';
import { syncTasksSchema, syncSessionsSchema } from '../validators/sync-v2.validator';

const router: Router = Router();
const controller = new SyncV2Controller();

// All sync routes require authentication
router.use(authenticate);

// Sync tasks (POST with operations)
router.post('/tasks', rateLimiters.bulkOperations, validateRequest(syncTasksSchema), controller.syncTasks);

// Sync sessions (POST with operations)
router.post('/sessions', rateLimiters.bulkOperations, validateRequest(syncSessionsSchema), controller.syncSessions);

export default router;
