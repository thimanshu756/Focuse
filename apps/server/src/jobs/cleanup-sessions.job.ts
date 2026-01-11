/**
 * Background Job: Cleanup Stuck Sessions
 * Runs every 5 minutes to mark expired sessions as FAILED
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

export const cleanupStuckSessions = async (): Promise<void> => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Find sessions that are RUNNING but expired more than 5 minutes ago
    const stuckSessions = await prisma.focusSession.findMany({
      where: {
        status: 'RUNNING',
        endTime: { lt: fiveMinutesAgo },
      },
      select: {
        id: true,
        userId: true,
        endTime: true,
      },
    });

    if (stuckSessions.length === 0) {
      return;
    }

    // Mark all stuck sessions as FAILED
    const result = await prisma.focusSession.updateMany({
      where: {
        id: { in: stuckSessions.map((s: any) => s.id) },
        status: 'RUNNING',
        endTime: { lt: fiveMinutesAgo },
      },
      data: {
        status: 'FAILED',
        failedAt: now,
        reason: 'TIMEOUT',
      },
    });

    logger.info('Cleanup stuck sessions', {
      cleanedCount: result.count,
      sessionIds: stuckSessions.map((s: any) => s.id),
    });
  } catch (error) {
    logger.error('Error cleaning up stuck sessions', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

