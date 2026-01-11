import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { SessionService } from '../services/session.service.js';
import {
  CreateSessionInput,
  CompleteSessionInput,
  FailSessionInput,
  SessionListFilters,
  SessionStatsFilters,
  BulkCompleteInput,
} from '../types/session.types.js';

export class SessionController {
  private sessionService = new SessionService();

  createSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: CreateSessionInput = req.body;
      const session = await this.sessionService.createSession(req.user!.id, data);
      res.status(201).json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  };

  listSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters: SessionListFilters = {
        status: req.query.status as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        taskId: req.query.taskId as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await this.sessionService.listSessions(req.user!.id, filters);
      res.json({
        success: true,
        data: result.sessions,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.id;
      const session = await this.sessionService.getSessionById(req.user!.id, sessionId);
      res.json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  };

  pauseSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.id;
      const session = await this.sessionService.pauseSession(req.user!.id, sessionId);
      res.json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  };

  resumeSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.id;
      const session = await this.sessionService.resumeSession(req.user!.id, sessionId);
      res.json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  };

  completeSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.id;
      const data: CompleteSessionInput = req.body;
      const session = await this.sessionService.completeSession(
        req.user!.id,
        sessionId,
        data
      );
      res.json({
        success: true,
        data: { session },
        message: 'Session completed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  failSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.id;
      const data: FailSessionInput = req.body;
      const session = await this.sessionService.failSession(req.user!.id, sessionId, data);
      res.json({
        success: true,
        data: { session },
        message: 'Session marked as failed',
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const session = await this.sessionService.getActiveSession(req.user!.id);
      res.json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  };

  getSessionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters: SessionStatsFilters = {
        period: (req.query.period as any) || 'week',
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const stats = await this.sessionService.getSessionStats(req.user!.id, filters);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  bulkComplete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: BulkCompleteInput = req.body;
      const result = await this.sessionService.bulkComplete(req.user!.id, data);
      res.json({
        success: true,
        data: result,
        message: `${result.completedCount} session(s) auto-completed`,
      });
    } catch (error) {
      next(error);
    }
  };
}

