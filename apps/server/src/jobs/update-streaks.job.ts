/**
 * Background Job: Update User Streaks
 * Runs daily at midnight to update user streaks
 */

import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';
import { startOfDay, subDays } from '../utils/date-helpers.js';

export const updateStreaks = async (): Promise<void> => {
  try {
    const now = new Date();
    const yesterday = subDays(startOfDay(now), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = new Date(yesterdayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastSessionDate: true,
      },
    });

    let updatedCount = 0;

    for (const user of users) {
      // Check if user had a completed session yesterday
      const hadSessionYesterday = await prisma.focusSession.findFirst({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          startTime: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
      });

      let newStreak = user.currentStreak;
      let newLongestStreak = user.longestStreak;

      if (hadSessionYesterday) {
        // User had session yesterday, increment streak
        newStreak = user.currentStreak + 1;
        newLongestStreak = Math.max(user.longestStreak, newStreak);
      } else if (user.lastSessionDate && user.lastSessionDate < yesterdayStart) {
        // User missed yesterday, reset streak
        newStreak = 0;
      }
      // If lastSessionDate is yesterday or today, keep current streak

      // Only update if streak changed
      if (newStreak !== user.currentStreak || newLongestStreak !== user.longestStreak) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
          },
        });
        updatedCount++;
      }
    }

    logger.info('Streaks updated', {
      totalUsers: users.length,
      updatedCount,
    });
  } catch (error) {
    logger.error('Error updating streaks', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

