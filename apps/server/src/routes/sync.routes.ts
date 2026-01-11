import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rate-limiter.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { syncSchema } from '../validators/sync.validator.js';

const router: Router = Router();
const controller = new SyncController();

// POST /api/sync - Delta Sync
router.post(
  '/',
  authenticate,
  rateLimiters.standard,
  validateRequest(syncSchema),
  controller.sync
);

export default router;

