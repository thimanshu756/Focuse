import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { startOfDay, subDays, getDateRange, isSameDay } from '../utils/date-helpers.js';
import {
  CreateSessionInput,
  CompleteSessionInput,
  FailSessionInput,
  SessionListFilters,
  SessionStatsFilters,
  SessionResponse,
  SessionStatsResponse,
  BulkCompleteInput,
  BulkCompleteResponse,
} from '../types/session.types.js';

// Type for Prisma transaction client
type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class SessionService {
  async createSession(userId: string, data: CreateSessionInput): Promise<SessionResponse> {
    // Check for active session (RUNNING or PAUSED)
    const activeSession = await prisma.focusSession.findFirst({
      where: {
        userId,
        status: { in: ['RUNNING', 'PAUSED'] },
      },
    });

    if (activeSession) {
      throw new AppError(
        'Complete or cancel current session first',
        409,
        'ACTIVE_SESSION_EXISTS'
      );
    }

    // Validate duration
    if (data.duration < 5 || data.duration > 240) {
      throw new AppError(
        'Duration must be between 5 and 240 minutes',
        400,
        'INVALID_DURATION'
      );
    }

    // Check subscription limits for FREE users
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // FREE users: max 3 sessions/day
    if (user.subscriptionTier === 'FREE') {
      const today = startOfDay(new Date());
      const sessionsToday = await prisma.focusSession.count({
        where: {
          userId,
          startTime: { gte: today },
          status: 'COMPLETED',
        },
      });

      if (sessionsToday >= 3) {
        throw new AppError(
          'Free users limited to 3 sessions/day. Upgrade to Pro!',
          403,
          'SESSION_LIMIT_EXCEEDED'
        );
      }
    }

    // Verify task ownership and status if provided
    let task = null;
    if (data.taskId) {
      task = await prisma.task.findFirst({
        where: {
          id: data.taskId,
          userId,
        },
      });

      if (!task) {
        throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
      }

      if (task.status === 'COMPLETED' || task.status === 'ARCHIVED') {
        throw new AppError(
          'Cannot start session for completed or archived task',
          400,
          'INVALID_TASK_STATUS'
        );
      }
    }

    // Calculate endTime
    const startTime = new Date();
    const durationSeconds = data.duration * 60;
    const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

    // Create session and update related records in transaction
    const session = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Create session
      const newSession = await tx.focusSession.create({
        data: {
          userId,
          taskId: data.taskId || null,
          duration: durationSeconds,
          startTime,
          endTime,
          status: 'RUNNING',
          progress: 0,
          timeElapsed: 0,
          pauseDuration: 0,
          platform: data.platform || null,
          deviceId: data.deviceId || null,
        },
      });

      // Update task status to IN_PROGRESS if linked
      if (data.taskId && task && task.status === 'TODO') {
        await tx.task.update({
          where: { id: data.taskId },
          data: { status: 'IN_PROGRESS' },
        });
      }

      // Update user stats
      await tx.user.update({
        where: { id: userId },
        data: {
          totalSessions: { increment: 1 },
          lastSessionDate: startTime,
        },
      });

      return newSession;
    });

    logger.info('Session started', {
      userId,
      sessionId: session.id,
      taskId: data.taskId,
      duration: data.duration,
    });

    return this.formatSessionResponse(session, task);
  }

  async listSessions(
    userId: string,
    filters: SessionListFilters
  ): Promise<{
    sessions: SessionResponse[];
    meta: { total: number; page: number; limit: number };
  }> {
    const { status, startDate, endDate, taskId, page = 1, limit = 20 } = filters;

    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (taskId) {
      where.taskId = taskId;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.focusSession.findMany({
        where,
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.focusSession.count({ where }),
    ]);

    return {
      sessions: sessions.map((s: any) => this.formatSessionResponse(s, s.task)),
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  /**
   * Get forest sessions (completed and failed) in a single query
   * Optimized for forest page visualization
   */
  async getForestSessions(userId: string, limit: number = 50) {
    // Fetch both completed and failed sessions in a single query
    const sessions = await prisma.focusSession.findMany({
      where: {
        userId,
        status: { in: ['COMPLETED', 'FAILED'] },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      take: limit,
    });

    // Separate and count by status
    const completedSessions = sessions.filter((s: any) => s.status === 'COMPLETED');
    const failedSessions = sessions.filter((s: any) => s.status === 'FAILED');

    return {
      sessions: sessions.map((s: any) => this.formatSessionResponse(s, s.task)),
      meta: {
        total: sessions.length,
        completed: completedSessions.length,
        failed: failedSessions.length,
        limit,
      },
    };
  }

  async getSessionById(userId: string, sessionId: string): Promise<SessionResponse> {
    const session = await prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Calculate real-time progress for running sessions
    let progress = session.progress;
    if (session.status === 'RUNNING') {
      const now = new Date();
      // Calculate elapsed time minus any pause duration
      const totalElapsed = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
      const elapsed = totalElapsed - session.pauseDuration;
      progress = Math.min(100, Math.floor((elapsed / session.duration) * 100));
    }

    return this.formatSessionResponse(session as any, (session as any).task, progress);
  }

  async pauseSession(userId: string, sessionId: string): Promise<SessionResponse> {
    const session = await prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.status !== 'RUNNING') {
      throw new AppError('Session is not running', 400, 'INVALID_SESSION_STATUS');
    }

    // Check if session expired
    if (session.endTime < new Date()) {
      // Auto-fail expired session
      await prisma.focusSession.update({
        where: { id: sessionId },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          reason: 'TIMEOUT',
        },
      });
      throw new AppError('Session expired', 400, 'SESSION_EXPIRED');
    }

    const now = new Date();
    // Calculate elapsed time minus any previous pause duration
    const totalElapsed = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
    const elapsed = totalElapsed - session.pauseDuration;
    const progress = Math.min(100, Math.floor((elapsed / session.duration) * 100));

    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'PAUSED',
        pausedAt: now,
        progress,
        timeElapsed: elapsed,
      },
    });

    logger.info('Session paused', { userId, sessionId, progress });

    return this.formatSessionResponse(updatedSession);
  }

  async resumeSession(userId: string, sessionId: string): Promise<SessionResponse> {
    const session = await prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.status !== 'PAUSED') {
      throw new AppError('Session is not paused', 400, 'INVALID_SESSION_STATUS');
    }

    if (!session.pausedAt) {
      throw new AppError('Session pause time not found', 400, 'INVALID_SESSION_STATE');
    }

    const now = new Date();
    const currentPauseDuration = Math.floor((now.getTime() - session.pausedAt.getTime()) / 1000);
    const totalPauseDuration = session.pauseDuration + currentPauseDuration;
    
    // Calculate how much actual focus time has elapsed (excluding all pause time)
    const totalElapsed = Math.floor((session.pausedAt.getTime() - session.startTime.getTime()) / 1000);
    const actualElapsed = totalElapsed - session.pauseDuration;
    
    // Check if the actual focus time has exceeded the duration (session truly expired)
    if (actualElapsed >= session.duration) {
      throw new AppError('Session expired, start a new one', 400, 'SESSION_EXPIRED');
    }

    // Calculate new end time: now + remaining time
    const remainingTime = session.duration - actualElapsed;
    const newEndTime = new Date(now.getTime() + remainingTime * 1000);

    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'RUNNING',
        pausedAt: null,
        pauseDuration: totalPauseDuration,
        endTime: newEndTime,
      },
    });

    logger.info('Session resumed', { userId, sessionId, remainingTime });

    return this.formatSessionResponse(updatedSession);
  }

  async completeSession(
    userId: string,
    sessionId: string,
    data: CompleteSessionInput
  ): Promise<SessionResponse> {
    const session = await prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        task: true,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.status === 'COMPLETED') {
      throw new AppError('Session already completed', 400, 'SESSION_ALREADY_COMPLETED');
    }

    if (session.status === 'FAILED') {
      throw new AppError('Cannot complete failed session', 400, 'SESSION_FAILED');
    }

    const now = new Date();
    const actualDuration = data.actualDuration || session.duration;

    // Validate actualDuration
    const maxAllowed = session.duration + 600; // 10 minutes buffer
    if (actualDuration > maxAllowed) {
      throw new AppError('Invalid duration', 400, 'INVALID_ACTUAL_DURATION');
    }

    // Calculate streak
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastSessionDate: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const yesterday = subDays(startOfDay(now), 1);
    let newStreak = user.currentStreak;

    if (user.lastSessionDate) {
      if (isSameDay(user.lastSessionDate, now)) {
        // Same day, don't increment
        newStreak = user.currentStreak;
      } else if (isSameDay(user.lastSessionDate, yesterday)) {
        // Yesterday, increment streak
        newStreak = user.currentStreak + 1;
      } else {
        // Streak broken, restart
        newStreak = 1;
      }
    } else {
      // First session
      newStreak = 1;
    }

    const longestStreak = Math.max(user.longestStreak, newStreak);

    // Complete session and update stats in transaction
    const completedSession = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Update session
      const updatedSession = await tx.focusSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: now,
          actualDuration,
          progress: 100,
          timeElapsed: actualDuration,
        },
      });

      // Update user stats
      await tx.user.update({
        where: { id: userId },
        data: {
          totalFocusTime: { increment: actualDuration },
          completedSessions: { increment: 1 },
          currentStreak: newStreak,
          longestStreak,
          lastSessionDate: now,
        },
      });

      // Update task if linked
      if (session.taskId) {
        const minutesToAdd = Math.floor(actualDuration / 60);
        await tx.task.update({
          where: { id: session.taskId },
          data: {
            actualMinutes: { increment: minutesToAdd },
          },
        });
      }

      // Update daily stats
      const today = startOfDay(now);
      const existingDailyStats = await tx.dailyStats.findFirst({
        where: {
          userId,
          date: today,
        },
      });

      if (existingDailyStats) {
        await tx.dailyStats.update({
          where: { id: existingDailyStats.id },
          data: {
            totalFocusTime: { increment: actualDuration },
            totalSessions: { increment: 1 },
            completedSessions: { increment: 1 },
          },
        });
      } else {
        await tx.dailyStats.create({
          data: {
            userId,
            date: today,
            totalFocusTime: actualDuration,
            totalSessions: 1,
            completedSessions: 1,
          },
        });
      }

      return updatedSession;
    });

    logger.info('Session completed', {
      userId,
      sessionId,
      actualDuration,
      streak: newStreak,
    });

    return this.formatSessionResponse(completedSession);
  }

  async failSession(
    userId: string,
    sessionId: string,
    data: FailSessionInput
  ): Promise<SessionResponse> {
    const session = await prisma.focusSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        task: true,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.status === 'COMPLETED') {
      throw new AppError('Cannot fail completed session', 400, 'SESSION_ALREADY_COMPLETED');
    }

    if (session.status === 'FAILED') {
      throw new AppError('Session already failed', 400, 'SESSION_ALREADY_FAILED');
    }

    const now = new Date();
    // Calculate elapsed time minus any pause duration
    const totalElapsed = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
    const elapsed = totalElapsed - session.pauseDuration;
    const progress = Math.min(100, Math.floor((elapsed / session.duration) * 100));

    // Fail session and update stats in transaction
    const failedSession = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Update session
      const updatedSession = await tx.focusSession.update({
        where: { id: sessionId },
        data: {
          status: 'FAILED',
          failedAt: now,
          reason: data.reason,
          progress,
          timeElapsed: elapsed,
        },
      });

      // Update user stats
      await tx.user.update({
        where: { id: userId },
        data: {
          failedSessions: { increment: 1 },
        },
      });

      // Reset task status if was IN_PROGRESS
      if (session.taskId && session.task && session.task.status === 'IN_PROGRESS') {
        await tx.task.update({
          where: { id: session.taskId },
          data: { status: 'TODO' },
        });
      }

      // Update daily stats
      const today = startOfDay(now);
      const existingDailyStats = await tx.dailyStats.findFirst({
        where: {
          userId,
          date: today,
        },
      });

      if (existingDailyStats) {
        await tx.dailyStats.update({
          where: { id: existingDailyStats.id },
          data: {
            totalSessions: { increment: 1 },
            failedSessions: { increment: 1 },
          },
        });
      } else {
        await tx.dailyStats.create({
          data: {
            userId,
            date: today,
            totalSessions: 1,
            failedSessions: 1,
          },
        });
      }

      return updatedSession;
    });

    logger.info('Session failed', {
      userId,
      sessionId,
      reason: data.reason,
      progress,
    });

    return this.formatSessionResponse(failedSession);
  }

  async getActiveSession(userId: string): Promise<SessionResponse | null> {
    const session = await prisma.focusSession.findFirst({
      where: {
        userId,
        status: { in: ['RUNNING', 'PAUSED'] },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    if (!session) {
      return null;
    }

    // Calculate real-time progress
    let progress = session.progress;
    if (session.status === 'RUNNING') {
      const now = new Date();
      // Calculate elapsed time minus any pause duration
      const totalElapsed = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
      const elapsed = totalElapsed - session.pauseDuration;
      progress = Math.min(100, Math.floor((elapsed / session.duration) * 100));
    }

    return this.formatSessionResponse(session as any, (session as any).task, progress);
  }

  async getSessionStats(
    userId: string,
    filters: SessionStatsFilters
  ): Promise<SessionStatsResponse> {
    const { period = 'week', startDate, endDate } = filters;

    // Determine date range
    let dateRange: { start: Date; end: Date };
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate), end: new Date(endDate) };
    } else {
      dateRange = getDateRange(period);
    }

    const where = {
      userId,
      startTime: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    };

    // Get all sessions in range
    const sessions = await prisma.focusSession.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Calculate stats
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s: any) => s.status === 'COMPLETED').length;
    const failedSessions = sessions.filter((s: any) => s.status === 'FAILED').length;
    const totalFocusTime = sessions
      .filter((s: any) => s.status === 'COMPLETED')
      .reduce((sum: number, s: any) => sum + (s.actualDuration || s.duration), 0);

    const completedDurations = sessions
      .filter((s: any) => s.status === 'COMPLETED')
      .map((s: any) => s.actualDuration || s.duration);

    const averageSessionDuration =
      completedDurations.length > 0
        ? Math.floor(completedDurations.reduce((a: number, b: number) => a + b, 0) / completedDurations.length)
        : 0;

    const completionRate =
      totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const longestSession =
      completedDurations.length > 0 ? Math.max(...completedDurations) : 0;

    // Get user current streak
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true },
    });

    const currentStreak = user?.currentStreak || 0;

    // Calculate best focus time (hour of day with most completed sessions)
    const hourCounts: Record<number, number> = {};
    sessions
      .filter((s: any) => s.status === 'COMPLETED')
      .forEach((s: any) => {
        const hour = s.startTime.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

    const bestFocusTime =
      Object.keys(hourCounts).length > 0
        ? parseInt(
            Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0],
            10
          )
        : 0;

    // Daily breakdown
    const dailyMap: Record<string, { sessions: number; focusTime: number; completed: number }> =
      {};
    sessions.forEach((s: any) => {
      const dateKey = startOfDay(s.startTime).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { sessions: 0, focusTime: 0, completed: 0 };
      }
      dailyMap[dateKey].sessions++;
      if (s.status === 'COMPLETED') {
        dailyMap[dateKey].focusTime += s.actualDuration || s.duration;
        dailyMap[dateKey].completed++;
      }
    });

    const dailyBreakdown = Object.entries(dailyMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Task breakdown
    const taskMap: Record<
      string,
      { taskId: string; taskTitle: string; sessions: number; focusTime: number }
    > = {};
    sessions
      .filter((s: any) => s.taskId && s.status === 'COMPLETED')
      .forEach((s: any) => {
        const taskId = s.taskId!;
        if (!taskMap[taskId]) {
          taskMap[taskId] = {
            taskId,
            taskTitle: s.task?.title || 'Unknown',
            sessions: 0,
            focusTime: 0,
          };
        }
        taskMap[taskId].sessions++;
        taskMap[taskId].focusTime += s.actualDuration || s.duration;
      });

    const taskBreakdown = Object.values(taskMap).sort(
      (a, b) => b.focusTime - a.focusTime
    );

    return {
      totalSessions,
      completedSessions,
      failedSessions,
      totalFocusTime,
      averageSessionDuration,
      completionRate,
      longestSession,
      currentStreak,
      bestFocusTime,
      dailyBreakdown,
      taskBreakdown,
    };
  }

  async bulkComplete(
    userId: string,
    data: BulkCompleteInput
  ): Promise<BulkCompleteResponse> {
    const now = new Date();

    // Find expired sessions
    const expiredSessions = await prisma.focusSession.findMany({
      where: {
        id: { in: data.sessionIds },
        userId,
        status: 'RUNNING',
        endTime: { lt: now },
      },
    });

    if (expiredSessions.length === 0) {
      return { completedCount: 0 };
    }

    // Auto-complete all expired sessions
    const completedCount = await prisma.$transaction(async (tx: PrismaTransaction) => {
      let count = 0;

      for (const session of expiredSessions) {
        await tx.focusSession.update({
          where: { id: session.id },
          data: {
            status: 'COMPLETED',
            completedAt: now,
            actualDuration: session.duration,
            progress: 100,
            timeElapsed: session.duration,
          },
        });

        // Update user stats
        await tx.user.update({
          where: { id: userId },
          data: {
            totalFocusTime: { increment: session.duration },
            completedSessions: { increment: 1 },
          },
        });

        // Update task if linked
        if (session.taskId) {
          const minutesToAdd = Math.floor(session.duration / 60);
          await tx.task.update({
            where: { id: session.taskId },
            data: {
              actualMinutes: { increment: minutesToAdd },
            },
          });
        }

        count++;
      }

      return count;
    });

    logger.info('Bulk auto-complete', {
      userId,
      completedCount,
      sessionIds: expiredSessions.map((s: any) => s.id),
    });

    return { completedCount };
  }

  private formatSessionResponse(
    session: any,
    task?: any,
    progress?: number
  ): SessionResponse {
    return {
      id: session.id,
      userId: session.userId,
      taskId: session.taskId,
      duration: session.duration,
      startTime: session.startTime,
      endTime: session.endTime,
      completedAt: session.completedAt,
      pausedAt: session.pausedAt,
      failedAt: session.failedAt,
      status: session.status,
      progress: progress !== undefined ? progress : session.progress,
      timeElapsed: session.timeElapsed,
      pauseDuration: session.pauseDuration,
      reason: session.reason,
      actualDuration: session.actualDuration,
      platform: session.platform,
      deviceId: session.deviceId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      task: task
        ? {
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
          }
        : undefined,
    };
  }
}

