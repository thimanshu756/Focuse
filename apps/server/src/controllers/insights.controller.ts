/**
 * Insights Controller
 * Handles HTTP requests for weekly insights
 */

import type { Response, NextFunction } from 'express';
import { insightsService } from '../services/insights.service.js';
import { logger } from '../utils/logger.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { GenerateInsightsRequest } from '../types/insights.types.js';

export class InsightsController {
  /**
   * Generate weekly insights
   * POST /api/insights/generate
   */
  generateWeeklyInsights = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const options: GenerateInsightsRequest = req.body || {};

      logger.info('Insights controller: Generate weekly insights request', {
        userId,
        options,
      });

      const result = await insightsService.generateWeeklyInsights(userId, options);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Weekly insights generated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get insight by ID
   * GET /api/insights/:id
   */
  getInsightById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      logger.debug('Insights controller: Get insight by ID', { userId, insightId: id });

      const result = await insightsService.getInsightById(userId, id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * List insights with pagination
   * GET /api/insights
   */
  listInsights = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { page, limit, startDate, endDate } = req.query as any;

      logger.debug('Insights controller: List insights', {
        userId,
        page,
        limit,
        startDate,
        endDate,
      });

      const result = await insightsService.listInsights(
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      res.status(200).json({
        success: true,
        data: result.insights,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark insight as read
   * PATCH /api/insights/:id/read
   */
  markAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      logger.debug('Insights controller: Mark insight as read', { userId, insightId: id });

      await insightsService.markAsRead(userId, id);

      res.status(200).json({
        success: true,
        message: 'Insight marked as read',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete insight
   * DELETE /api/insights/:id
   */
  deleteInsight = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      logger.info('Insights controller: Delete insight', { userId, insightId: id });

      await insightsService.deleteInsight(userId, id);

      res.status(200).json({
        success: true,
        message: 'Insight deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
