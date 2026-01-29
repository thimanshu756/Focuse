/**
 * Bidirectional sync controller for mobile
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { SyncV2Service } from '../services/sync-v2.service';

const syncService = new SyncV2Service();

export class SyncV2Controller {
  /**
   * Sync tasks (bidirectional)
   * POST /api/sync/tasks
   */
  syncTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await syncService.syncTasks(userId, req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sync sessions (bidirectional)
   * POST /api/sync/sessions
   */
  syncSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await syncService.syncSessions(userId, req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
