/**
 * Insights Routes
 * Routes for weekly AI insights generation
 */

import { Router } from 'express';
import { InsightsController } from '../controllers/insights.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createRateLimiter, rateLimiters } from '../middleware/rate-limiter.middleware.js';
import { createTimeoutMiddleware } from '../middleware/timeout.middleware.js';
import {
  generateWeeklyInsightsSchema,
  getInsightByIdSchema,
  listInsightsSchema,
  markInsightAsReadSchema,
  deleteInsightSchema,
} from '../validators/insights.validator.js';

const router: Router = Router();
const controller = new InsightsController();

/**
 * Rate limiter for AI insights generation
 * More restrictive than standard AI operations due to cost
 */
const insightsGenerationRateLimiter = createRateLimiter({
  max: 5, // 5 generations per hour (allows retries)
  windowMs: 60 * 60 * 1000, // 1 hour
  message:
    'Too many insights generation requests. Please wait before generating more insights.',
});

/**
 * Rate limiter for listing/reading insights
 * More permissive since these are read operations
 */
const insightsReadRateLimiter = createRateLimiter({
  max: 100, // 100 reads per minute
  windowMs: 60 * 1000, // 1 minute
  message: 'Too many requests. Please slow down.',
});

/**
 * @route   POST /api/insights/generate
 * @desc    Generate weekly insights (or retrieve cached)
 * @access  Private
 * @rate    5 requests per hour
 * 
 * Rate Limiting:
 * - HTTP Rate Limit: 5 requests/hour (protects against abuse)
 * - Business Logic Rate Limit: Free users = 1 insight/week, Pro = unlimited
 * 
 * Caching:
 * - Automatically returns cached insights if available for the week
 * - Use forceRegenerate: true to bypass cache (counts against rate limit)
 * 
 * Free vs Pro:
 * - Free users: Can generate insights once per week (checked in service layer)
 * - Pro users: Unlimited generations
 */
router.post(
  '/generate',
  authenticate,
  insightsGenerationRateLimiter,
  createTimeoutMiddleware(150000), // 150 seconds timeout (AI generation can take time)
  validateRequest(generateWeeklyInsightsSchema),
  controller.generateWeeklyInsights
);

/**
 * @route   GET /api/insights
 * @desc    List all insights for authenticated user
 * @access  Private
 * @rate    100 requests per minute
 * 
 * Query Parameters:
 * - page (number): Page number (default: 1)
 * - limit (number): Items per page (default: 10, max: 50)
 * - startDate (ISO string): Filter from this date
 * - endDate (ISO string): Filter to this date
 */
router.get(
  '/',
  authenticate,
  insightsReadRateLimiter,
  validateRequest(listInsightsSchema),
  controller.listInsights
);

/**
 * @route   GET /api/insights/:id
 * @desc    Get specific insight by ID
 * @access  Private (owner only)
 * @rate    100 requests per minute
 */
router.get(
  '/:id',
  authenticate,
  insightsReadRateLimiter,
  validateRequest(getInsightByIdSchema),
  controller.getInsightById
);

/**
 * @route   PATCH /api/insights/:id/read
 * @desc    Mark insight as read
 * @access  Private (owner only)
 * @rate    Standard rate limiting
 */
router.patch(
  '/:id/read',
  authenticate,
  rateLimiters.standard,
  validateRequest(markInsightAsReadSchema),
  controller.markAsRead
);

/**
 * @route   DELETE /api/insights/:id
 * @desc    Delete specific insight
 * @access  Private (owner only)
 * @rate    Standard rate limiting
 */
router.delete(
  '/:id',
  authenticate,
  rateLimiters.standard,
  validateRequest(deleteInsightSchema),
  controller.deleteInsight
);

export default router;
