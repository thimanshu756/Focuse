import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { SyncService } from '../services/sync.service.js';
import { SyncInput } from '../types/sync.types.js';

export class SyncController {
  private syncService = new SyncService();

  sync = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: SyncInput = {
        lastSyncTime: req.body.lastSyncTime || null,
        entities: req.body.entities || ['sessions', 'tasks', 'user'],
      };

      const result = await this.syncService.sync(req.user!.id, data);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

