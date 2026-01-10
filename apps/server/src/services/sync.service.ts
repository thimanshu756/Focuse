import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import {
  SyncInput,
  SyncResponse,
  SyncSession,
  SyncTask,
  SyncUser,
} from '../types/sync.types.js';

export class SyncService {
  async sync(userId: string, data: SyncInput): Promise<SyncResponse> {
    const { lastSyncTime, entities = ['sessions', 'tasks', 'user'] } = data;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Parse lastSyncTime
    let syncDate: Date | null = null;
    if (lastSyncTime) {
      syncDate = new Date(lastSyncTime);

      // Check if lastSyncTime is in the future
      if (syncDate > new Date()) {
        // Return empty arrays
        return {
          sessions: [],
          tasks: [],
          user: null,
          timestamp: new Date().toISOString(),
        };
      }

      // Check if lastSyncTime is > 7 days old → force full sync (set to null)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (syncDate < sevenDaysAgo) {
        syncDate = null; // Force full sync
        logger.info('Sync: Forcing full sync due to old lastSyncTime', { userId, lastSyncTime });
      }
    }

    const serverTimestamp = new Date();
    const response: SyncResponse = {
      sessions: [],
      tasks: [],
      user: null,
      timestamp: serverTimestamp.toISOString(),
    };

    // Sync sessions
    if (entities.includes('sessions')) {
      response.sessions = await this.syncSessions(userId, syncDate);
    }

    // Sync tasks
    if (entities.includes('tasks')) {
      response.tasks = await this.syncTasks(userId, syncDate);
    }

    // Sync user stats
    if (entities.includes('user')) {
      response.user = await this.syncUser(userId);
    }

    logger.info('Sync completed', {
      userId,
      lastSyncTime: syncDate?.toISOString() || 'null',
      entities,
      sessionsCount: response.sessions.length,
      tasksCount: response.tasks.length,
    });

    return response;
  }

  private async syncSessions(
    userId: string,
    lastSyncTime: Date | null
  ): Promise<SyncSession[]> {
    const where: any = {
      userId,
    };

    if (lastSyncTime) {
      where.updatedAt = { gt: lastSyncTime };
    }

    const sessions = await prisma.focusSession.findMany({
      where,
      select: {
        id: true,
        status: true,
        progress: true,
        startTime: true,
        endTime: true,
        taskId: true,
        duration: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });

    return sessions.map((s: any) => ({
      id: s.id,
      status: s.status,
      progress: s.progress,
      startTime: s.startTime,
      endTime: s.endTime,
      taskId: s.taskId,
      duration: s.duration,
      updatedAt: s.updatedAt,
    }));
  }

  private async syncTasks(userId: string, lastSyncTime: Date | null): Promise<SyncTask[]> {
    const where: any = {
      userId,
      deletedAt: null, // Only non-deleted tasks
    };

    if (lastSyncTime) {
      where.updatedAt = { gt: lastSyncTime };
    }

    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        completedAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });

    return tasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
      updatedAt: t.updatedAt,
    }));
  }

  private async syncUser(userId: string): Promise<SyncUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalFocusTime: true,
        currentStreak: true,
        completedSessions: true,
        totalSessions: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      totalFocusTime: user.totalFocusTime,
      currentStreak: user.currentStreak,
      completedSessions: user.completedSessions,
      totalSessions: user.totalSessions,
    };
  }
}

