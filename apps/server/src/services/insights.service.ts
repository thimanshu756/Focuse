/**
 * Insights Service
 * Handles weekly insights generation with analytics engine, rate limiting, and caching
 * 
 * Features:
 * - Deterministic analytics calculation from database
 * - AI-powered insights generation
 * - Rate limiting (free users: once per week, pro users: unlimited)
 * - Automatic caching to reduce costs
 * - Comprehensive edge case handling
 */

import { prisma } from '../lib/prisma.js';
import { aiService } from './ai.service.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type {
  WeeklyStats,
  DailyDistribution,
  FailureReasonStats,
  SessionDurationBucket,
  StreakData,
  WeeklyInsightResponse,
  InsightsListResponse,
  InsightsRateLimitResult,
  AIInsightsInput,
  GenerateInsightsRequest,
} from '../types/insights.types.js';

/**
 * Insights Service
 */
export class InsightsService {
  /**
   * Generate or retrieve weekly insights
   * Implements intelligent caching and rate limiting
   */
  async generateWeeklyInsights(
    userId: string,
    options: GenerateInsightsRequest = {}
  ): Promise<WeeklyInsightResponse> {
    const requestId = `insights-${userId}-${Date.now()}`;
    const logContext = { requestId, userId };

    logger.info('Insights service: Starting weekly insights generation', {
      ...logContext,
      options,
    });

    try {
      // 1. Get user with subscription info
      const user = await this.getUserWithSubscription(userId);

      // 2. Calculate week boundaries (Monday to Sunday)
      const weekBoundaries = options.weekStart
        ? this.getWeekBoundaries(new Date(options.weekStart))
        : this.getCurrentWeekBoundaries();

      logger.debug('Insights service: Week boundaries calculated', {
        ...logContext,
        weekStart: weekBoundaries.start.toISOString(),
        weekEnd: weekBoundaries.end.toISOString(),
      });

      // 3. Check if cached insights exist (skip if forceRegenerate = true)
      if (!options.forceRegenerate) {
        const cached = await this.getCachedInsights(userId, weekBoundaries.start);
        if (cached) {
          logger.info('Insights service: Returning cached insights', {
            ...logContext,
            insightId: cached.id,
            cachedAt: cached.createdAt,
          });
          return this.formatInsightResponse(cached, user);
        }
      }

      // 4. Check rate limiting
      const rateLimitCheck = await this.checkRateLimit(userId, weekBoundaries.start, user.subscriptionTier);
      if (!rateLimitCheck.allowed) {
        logger.warn('Insights service: Rate limit exceeded', {
          ...logContext,
          reason: rateLimitCheck.reason,
          nextAvailableAt: rateLimitCheck.nextAvailableAt,
        });
        throw new AppError(
          rateLimitCheck.reason || 'Rate limit exceeded',
          429,
          'INSIGHTS_RATE_LIMITED',
          {
            nextAvailableAt: rateLimitCheck.nextAvailableAt,
            subscriptionTier: user.subscriptionTier,
          }
        );
      }

      // 5. Calculate weekly stats from database
      logger.info('Insights service: Calculating weekly analytics', logContext);
      const weeklyStats = await this.calculateWeeklyStats(
        userId,
        weekBoundaries.start,
        weekBoundaries.end
      );

      // 6. Validate sufficient data
      if (weeklyStats.totalSessions === 0) {
        logger.warn('Insights service: No sessions found for the week', logContext);
        throw new AppError(
          'No focus sessions found for this week. Complete at least one session to generate insights.',
          400,
          'INSUFFICIENT_DATA'
        );
      }

      // 7. Get previous week's insight for context
      const previousInsight = await this.getPreviousInsight(userId, weekBoundaries.start);

      // 8. Prepare AI input
      const aiInput: AIInsightsInput = {
        userId,
        weeklyStats,
        userProfile: {
          name: user.name,
          timezone: user.timezone,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          totalFocusTime: user.totalFocusTime,
          totalSessions: user.totalSessions,
          userType: user.userType,
          preferredFocusTime: user.preferredFocusTime,
        },
        previousInsight: previousInsight
          ? {
              oneLeverToPull: previousInsight.oneLeverToPull,
              recommendations: previousInsight.recommendations as any,
            }
          : null,
      };

      // 9. Generate AI insights
      logger.info('Insights service: Calling AI service for insights generation', logContext);
      const aiResponse = await aiService.generateWeeklyInsights(aiInput, undefined, requestId);

      // 10. Save insights to database
      logger.info('Insights service: Saving insights to database', logContext);
      const savedInsight = await (prisma as any).weeklyInsight.create({
        data: {
          userId,
          weekStart: weekBoundaries.start,
          weekEnd: weekBoundaries.end,
          narrative: aiResponse.data.narrative,
          insights: aiResponse.data.insights as any,
          recommendations: aiResponse.data.recommendations as any,
          nextWeekPlan: aiResponse.data.nextWeekPlan as any,
          oneLeverToPull: aiResponse.data.oneLeverToPull,
          generationLatencyMs: aiResponse.latencyMs,
          weeklyStats: weeklyStats as any,
          model: aiResponse.model,
          provider: aiResponse.provider,
          isRead: false,
        },
      });

      // 11. Auto-delete old insights (keep only recent ones)
      await this.cleanupOldInsights(userId, logContext);

      // 12. Track AI request
      await this.trackAIRequest(userId, aiResponse.latencyMs, 'SUCCESS');

      logger.info('Insights service: Weekly insights generated successfully', {
        ...logContext,
        insightId: savedInsight.id,
        latencyMs: aiResponse.latencyMs,
        insightsCount: aiResponse.data.insights.length,
        recommendationsCount: aiResponse.data.recommendations.length,
      });

      return this.formatInsightResponse(savedInsight, user);
    } catch (error) {
      logger.error('Insights service: Failed to generate insights', {
        ...logContext,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof AppError ? error.code : 'UNKNOWN',
      });

      // Track failed AI request
      if (error instanceof AppError && error.code.startsWith('AI_')) {
        await this.trackAIRequest(userId, 0, 'FAILED', error.message);
      }

      throw error;
    }
  }

  /**
   * Get insight by ID (with ownership verification)
   */
  async getInsightById(userId: string, insightId: string): Promise<WeeklyInsightResponse> {
    logger.debug('Insights service: Fetching insight by ID', { userId, insightId });

    const insight = await (prisma as any).weeklyInsight.findFirst({
      where: {
        id: insightId,
        userId, // Security: ensure user owns this insight
      },
    });

    if (!insight) {
      throw new AppError('Insight not found', 404, 'INSIGHT_NOT_FOUND');
    }

    const user = await this.getUserWithSubscription(userId);
    return this.formatInsightResponse(insight, user);
  }

  /**
   * List user's insights with pagination
   */
  async listInsights(
    userId: string,
    page: number = 1,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<InsightsListResponse> {
    logger.debug('Insights service: Listing insights', {
      userId,
      page,
      limit,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });

    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1 || limit > 50) limit = 10;

    const where: any = {
      userId,
    };

    // Apply date filters if provided
    if (startDate || endDate) {
      where.weekStart = {};
      if (startDate) where.weekStart.gte = startDate;
      if (endDate) where.weekStart.lte = endDate;
    }

    const [insights, total] = await Promise.all([
      (prisma as any).weeklyInsight.findMany({
        where,
        orderBy: { weekStart: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).weeklyInsight.count({ where }),
    ]);

    const user = await this.getUserWithSubscription(userId);

    return {
      insights: insights.map((i: any) => this.formatInsightResponse(i, user)),
      total,
      page,
      limit,
    };
  }

  /**
   * Mark insight as read
   */
  async markAsRead(userId: string, insightId: string): Promise<void> {
    logger.debug('Insights service: Marking insight as read', { userId, insightId });

    const result = await (prisma as any).weeklyInsight.updateMany({
      where: {
        id: insightId,
        userId, // Security: ensure user owns this insight
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new AppError('Insight not found', 404, 'INSIGHT_NOT_FOUND');
    }
  }

  /**
   * Delete insight (ownership verification)
   */
  async deleteInsight(userId: string, insightId: string): Promise<void> {
    logger.debug('Insights service: Deleting insight', { userId, insightId });

    const result = await (prisma as any).weeklyInsight.deleteMany({
      where: {
        id: insightId,
        userId, // Security: ensure user owns this insight
      },
    });

    if (result.count === 0) {
      throw new AppError('Insight not found', 404, 'INSIGHT_NOT_FOUND');
    }

    logger.info('Insights service: Insight deleted', { userId, insightId });
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get user with subscription info
   */
  private async getUserWithSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        currentStreak: true,
        longestStreak: true,
        totalFocusTime: true,
        totalSessions: true,
        userType: true,
        preferredFocusTime: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Get current week boundaries (Monday to Sunday)
   */
  private getCurrentWeekBoundaries(): { start: Date; end: Date } {
    const now = new Date();
    return this.getWeekBoundaries(now);
  }

  /**
   * Get week boundaries for any date
   */
  private getWeekBoundaries(date: Date): { start: Date; end: Date } {
    const d = new Date(date);
    
    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = d.getDay();
    
    // Calculate days to subtract to get to Monday (start of week)
    // If Sunday (0), go back 6 days; if Monday (1), go back 0 days, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Get Monday (start of week) at 00:00:00
    const start = new Date(d);
    start.setDate(d.getDate() - daysToMonday);
    start.setHours(0, 0, 0, 0);
    
    // Get Sunday (end of week) at 23:59:59
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }

  /**
   * Get cached insights if exists
   */
  private async getCachedInsights(userId: string, weekStart: Date) {
    return await (prisma as any).weeklyInsight.findFirst({
      where: {
        userId,
        weekStart: {
          gte: weekStart,
          lt: new Date(weekStart.getTime() + 86400000), // Within 24 hours (same day)
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check rate limiting
   * Free users: Once per week per week-period
   * Pro users: Unlimited (but still once per week for caching)
   */
  private async checkRateLimit(
    userId: string,
    weekStart: Date,
    subscriptionTier: string
  ): Promise<InsightsRateLimitResult> {
    // Pro and Enterprise users have unlimited generations
    if (subscriptionTier === 'PRO' || subscriptionTier === 'ENTERPRISE') {
      return { allowed: true };
    }

    // Free users: Check if they already generated insights for this week
    const existingInsight = await (prisma as any).weeklyInsight.findFirst({
      where: {
        userId,
        weekStart: {
          gte: weekStart,
          lt: new Date(weekStart.getTime() + 86400000), // Same day
        },
      },
    });

    if (existingInsight) {
      // Calculate next available time (next week)
      const nextAvailable = new Date(weekStart);
      nextAvailable.setDate(nextAvailable.getDate() + 7); // Next Monday

      return {
        allowed: false,
        reason: 'Free users can generate insights once per week. Upgrade to Pro for unlimited access.',
        nextAvailableAt: nextAvailable,
      };
    }

    return { allowed: true };
  }

  /**
   * Calculate comprehensive weekly stats from database
   * This is the deterministic analytics engine
   */
  private async calculateWeeklyStats(
    userId: string,
    weekStart: Date,
    weekEnd: Date
  ): Promise<WeeklyStats> {
    logger.debug('Insights service: Starting weekly stats calculation', {
      userId,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    });

    // Parallel data fetching for performance
    const [dailyStats, sessions, tasksCreated, user] = await Promise.all([
      // Fetch daily stats for the week
      prisma.dailyStats.findMany({
        where: {
          userId,
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        orderBy: { date: 'asc' },
      }),
      // Fetch all sessions for detailed analysis
      prisma.focusSession.findMany({
        where: {
          userId,
          startTime: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        orderBy: { startTime: 'asc' },
      }),
      // Count tasks created this week
      prisma.task.count({
        where: {
          userId,
          createdAt: {
            gte: weekStart,
            lte: weekEnd,
          },
          deletedAt: null,
        },
      }),
      // Get user for streak data
      prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, longestStreak: true },
      }),
    ]);

    // Aggregate daily stats
    const totalSessions = dailyStats.reduce((sum, d) => sum + d.totalSessions, 0);
    const completedSessions = dailyStats.reduce((sum, d) => sum + d.completedSessions, 0);
    const failedSessions = dailyStats.reduce((sum, d) => sum + d.failedSessions, 0);
    const totalFocusTime = dailyStats.reduce((sum, d) => sum + d.totalFocusTime, 0);
    const tasksCompleted = dailyStats.reduce((sum, d) => sum + d.tasksCompleted, 0);

    // Time of day breakdown
    const morningFocusTime = dailyStats.reduce((sum, d) => sum + d.morningFocusTime, 0);
    const afternoonFocusTime = dailyStats.reduce((sum, d) => sum + d.afternoonFocusTime, 0);
    const eveningFocusTime = dailyStats.reduce((sum, d) => sum + d.eveningFocusTime, 0);
    const nightFocusTime = dailyStats.reduce((sum, d) => sum + d.nightFocusTime, 0);

    // Determine best time of day
    const timeOfDayMap = [
      { period: 'morning' as const, time: morningFocusTime },
      { period: 'afternoon' as const, time: afternoonFocusTime },
      { period: 'evening' as const, time: eveningFocusTime },
      { period: 'night' as const, time: nightFocusTime },
    ];
    const bestTimeOfDay =
      timeOfDayMap.sort((a, b) => b.time - a.time)[0]?.time > 0
        ? timeOfDayMap[0].period
        : ('none' as const);

    // Session duration analysis
    const completedSessionDurations = sessions
      .filter((s) => s.status === 'COMPLETED' && s.actualDuration)
      .map((s) => s.actualDuration as number);

    const averageSessionDuration =
      completedSessionDurations.length > 0
        ? completedSessionDurations.reduce((sum, d) => sum + d, 0) / completedSessionDurations.length
        : 0;

    const longestSession = completedSessionDurations.length > 0 ? Math.max(...completedSessionDurations) : 0;
    const shortestSession = completedSessionDurations.length > 0 ? Math.min(...completedSessionDurations) : 0;

    // Daily distribution
    const dailyDistribution: DailyDistribution[] = this.calculateDailyDistribution(
      dailyStats,
      weekStart
    );

    // Best and worst days
    const sortedByCompletion = [...dailyDistribution].sort(
      (a, b) => b.completionRate - a.completionRate
    );
    const bestDay = sortedByCompletion.find((d) => d.totalSessions > 0)?.dayOfWeek || null;
    const worstDay =
      sortedByCompletion
        .reverse()
        .find((d) => d.totalSessions > 0)?.dayOfWeek || null;

    // Failure analysis
    const failureReasons = this.calculateFailureReasons(sessions);
    const failedSessionsWithTime = sessions.filter(
      (s) => s.status === 'FAILED' && s.timeElapsed > 0
    );
    const averageFailureTime =
      failedSessionsWithTime.length > 0
        ? failedSessionsWithTime.reduce((sum, s) => sum + s.timeElapsed, 0) /
          failedSessionsWithTime.length
        : 0;

    // Session duration distribution
    const sessionDurationDistribution = this.calculateDurationDistribution(sessions);

    // Streak data (calculate change from previous week if possible)
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(weekStart);
    previousWeekEnd.setTime(previousWeekEnd.getTime() - 1);

    // Calculate streak change during this week
    // Get unique days with completed sessions in current week
    const completedSessionDays = new Set(
      sessions
        .filter((s) => s.status === 'COMPLETED')
        .map((s) => new Date(s.startTime).toDateString())
    );
    const uniqueDaysWithSessions = completedSessionDays.size;

    // Streak change is the contribution from this week
    // If current streak <= 7, the entire streak might be from this week
    // Otherwise, only count days that contributed to streak this week
    let streakChange = 0;
    if (user) {
      if (user.currentStreak <= 7) {
        // Streak is recent, likely built within this week or just before
        streakChange = Math.min(user.currentStreak, uniqueDaysWithSessions);
      } else {
        // Longer streak, count this week's contribution (max 7 days)
        streakChange = uniqueDaysWithSessions;
      }
    }

    const streakData: StreakData = {
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      streakChange,
    };

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    const stats: WeeklyStats = {
      weekStart,
      weekEnd,
      totalSessions,
      completedSessions,
      failedSessions,
      completionRate,
      totalFocusTime,
      averageSessionDuration,
      longestSession,
      shortestSession,
      tasksCompleted,
      tasksCreated,
      morningFocusTime,
      afternoonFocusTime,
      eveningFocusTime,
      nightFocusTime,
      bestTimeOfDay,
      bestDay,
      worstDay,
      dailyDistribution,
      failureReasons,
      averageFailureTime,
      sessionDurationDistribution,
      streakData,
    };

    logger.debug('Insights service: Weekly stats calculated', {
      userId,
      totalSessions,
      completedSessions,
      completionRate: completionRate.toFixed(1),
    });

    return stats;
  }

  /**
   * Calculate daily distribution
   */
  private calculateDailyDistribution(
    dailyStats: any[],
    weekStart: Date
  ): DailyDistribution[] {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const distribution: DailyDistribution[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const dayStats = dailyStats.find((ds) => {
        const dsDate = new Date(ds.date);
        return dsDate.toDateString() === date.toDateString();
      });

      const totalSessions = dayStats?.totalSessions || 0;
      const completedSessions = dayStats?.completedSessions || 0;
      const focusTime = dayStats?.totalFocusTime || 0;
      const completionRate =
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      distribution.push({
        dayOfWeek: days[date.getDay()],
        date,
        totalSessions,
        completedSessions,
        focusTime,
        completionRate,
      });
    }

    return distribution;
  }

  /**
   * Calculate failure reasons statistics
   */
  private calculateFailureReasons(sessions: any[]): FailureReasonStats[] {
    const failedSessions = sessions.filter((s) => s.status === 'FAILED');
    const totalFailed = failedSessions.length;

    if (totalFailed === 0) return [];

    const reasonCounts = new Map<string, number>();
    failedSessions.forEach((s) => {
      const reason = s.reason || 'UNKNOWN';
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    });

    const stats: FailureReasonStats[] = [];
    reasonCounts.forEach((count, reason) => {
      stats.push({
        reason,
        count,
        percentage: (count / totalFailed) * 100,
      });
    });

    return stats.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate session duration distribution
   */
  private calculateDurationDistribution(sessions: any[]): SessionDurationBucket[] {
    const buckets = [
      { range: '5-15 min', min: 5 * 60, max: 15 * 60 },
      { range: '15-30 min', min: 15 * 60, max: 30 * 60 },
      { range: '30-45 min', min: 30 * 60, max: 45 * 60 },
      { range: '45-60 min', min: 45 * 60, max: 60 * 60 },
      { range: '60+ min', min: 60 * 60, max: Infinity },
    ];

    return buckets.map((bucket) => {
      const sessionsInBucket = sessions.filter(
        (s) => s.duration >= bucket.min && s.duration < bucket.max
      );
      const completed = sessionsInBucket.filter((s) => s.status === 'COMPLETED').length;
      const count = sessionsInBucket.length;
      const completionRate = count > 0 ? (completed / count) * 100 : 0;

      return {
        range: bucket.range,
        count,
        completionRate,
      };
    });
  }

  /**
   * Get previous week's insight for context
   */
  private async getPreviousInsight(userId: string, currentWeekStart: Date) {
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    return await (prisma as any).weeklyInsight.findFirst({
      where: {
        userId,
        weekStart: {
          gte: previousWeekStart,
          lt: currentWeekStart,
        },
      },
      orderBy: { weekStart: 'desc' },
      select: {
        oneLeverToPull: true,
        recommendations: true,
      },
    });
  }

  /**
   * Clean up old insights - keep only recent ones
   * Keeps the 10 most recent insights to prevent unlimited database growth
   * Called automatically after generating new insights
   */
  private async cleanupOldInsights(
    userId: string,
    logContext: { requestId: string; userId: string }
  ): Promise<void> {
    try {
      logger.debug('Insights service: Starting cleanup of old insights', logContext);

      // Configuration: Keep the 10 most recent insights (about 10 weeks of history)
      const KEEP_COUNT = 10;

      // Get all insights for this user, ordered by creation date (newest first)
      const allInsights = await (prisma as any).weeklyInsight.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, weekStart: true, createdAt: true },
      });

      logger.debug('Insights service: Found existing insights', {
        ...logContext,
        totalCount: allInsights.length,
      });

      // If we have more than KEEP_COUNT insights, delete the old ones
      if (allInsights.length > KEEP_COUNT) {
        const insightsToDelete = allInsights.slice(KEEP_COUNT);
        const idsToDelete = insightsToDelete.map((i: any) => i.id);

        logger.info('Insights service: Deleting old insights', {
          ...logContext,
          totalInsights: allInsights.length,
          keepCount: KEEP_COUNT,
          deleteCount: idsToDelete.length,
          oldestKept: allInsights[KEEP_COUNT - 1]?.weekStart.toISOString(),
          newestDeleted: insightsToDelete[0]?.weekStart.toISOString(),
        });

        // Delete old insights in bulk
        const deleteResult = await (prisma as any).weeklyInsight.deleteMany({
          where: {
            userId,
            id: { in: idsToDelete },
          },
        });

        logger.info('Insights service: Old insights deleted successfully', {
          ...logContext,
          deletedCount: deleteResult.count,
          remainingCount: KEEP_COUNT,
        });
      } else {
        logger.debug('Insights service: No cleanup needed', {
          ...logContext,
          currentCount: allInsights.length,
          maxCount: KEEP_COUNT,
        });
      }
    } catch (error) {
      // Don't throw error if cleanup fails (non-critical operation)
      // New insight has already been saved, so this is just housekeeping
      logger.error('Insights service: Failed to cleanup old insights', {
        ...logContext,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Track AI request in database
   */
  private async trackAIRequest(
    userId: string,
    latencyMs: number,
    status: 'SUCCESS' | 'FAILED',
    errorMessage?: string
  ): Promise<void> {
    try {
      await prisma.aIRequest.create({
        data: {
          userId,
          requestType: 'INSIGHT_GENERATE',
          prompt: 'Weekly insights generation',
          response: status === 'SUCCESS' ? 'Insights generated' : errorMessage || 'Failed',
          provider: 'rakriAi',
          model: 'CHITRA',
          latencyMs: latencyMs || 0,
          status,
          errorMessage: status === 'FAILED' ? errorMessage : null,
        },
      });

      // Update user's AI request counter (for future rate limiting)
      await prisma.user.update({
        where: { id: userId },
        data: {
          aiRequestsThisMonth: { increment: 1 },
        },
      });
    } catch (error) {
      // Don't throw error if tracking fails (non-critical)
      logger.error('Failed to track AI request', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Format insight response for API
   */
  private formatInsightResponse(insight: any, user: any): WeeklyInsightResponse {
    return {
      id: insight.id,
      weekStart: insight.weekStart,
      weekEnd: insight.weekEnd,
      narrative: insight.narrative,
      insights: insight.insights,
      recommendations: insight.recommendations,
      nextWeekPlan: insight.nextWeekPlan,
      oneLeverToPull: insight.oneLeverToPull,
      generatedAt: insight.createdAt,
      generationLatencyMs: insight.generationLatencyMs,
      model: insight.model,
      provider: insight.provider,
      weeklyStats: insight.weeklyStats,
      isRead: insight.isRead,
      readAt: insight.readAt,
    };
  }
}

// Export singleton instance
export const insightsService = new InsightsService();
