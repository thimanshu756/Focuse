import { SessionStats } from '@/types/insights.types';

/**
 * Generates advanced AI insights with smart recommendations
 * @param stats - Session statistics data
 * @returns Insight message string
 */
export function generateAdvancedInsight(stats: SessionStats): string {
  const insights: string[] = [];

  // 1. Completion rate analysis
  if (stats.completionRate >= 90) {
    insights.push(
      `Outstanding ${Math.round(stats.completionRate)}% completion rate! You're a focus master.`
    );
  } else if (stats.completionRate >= 80) {
    insights.push(
      `Excellent ${Math.round(stats.completionRate)}% completion rate! Keep up the great work.`
    );
  } else if (stats.completionRate >= 60) {
    insights.push(
      `Your ${Math.round(stats.completionRate)}% completion rate is good. Try to finish more sessions to maximize your forest growth.`
    );
  } else if (stats.completionRate < 60) {
    insights.push(
      `Your ${Math.round(stats.completionRate)}% completion rate has room for improvement. Try shorter sessions to build momentum and consistency.`
    );
  }

  // 2. Streak analysis
  if (stats.currentStreak >= 14) {
    insights.push(
      `Your ${stats.currentStreak}-day streak is remarkable! Consistency is your superpower.`
    );
  } else if (stats.currentStreak >= 7) {
    insights.push(
      `Great ${stats.currentStreak}-day streak! Keep it going to build lasting habits.`
    );
  } else if (stats.currentStreak >= 3) {
    insights.push(
      `You're on a ${stats.currentStreak}-day streak! Building momentum—keep it up!`
    );
  } else if (stats.currentStreak === 0) {
    insights.push(
      `Start a new streak today! Just one 25-minute session gets you back on track.`
    );
  }

  // 3. Session count milestone
  if (stats.totalSessions >= 100) {
    insights.push(
      `Century club! ${stats.totalSessions} sessions completed—your dedication is inspiring.`
    );
  } else if (stats.totalSessions >= 50) {
    insights.push(
      `Halfway to 100 sessions! ${stats.totalSessions} down, keep the momentum going.`
    );
  } else if (stats.totalSessions >= 25) {
    insights.push(
      `You've completed ${stats.totalSessions} sessions. Great progress toward building your forest!`
    );
  } else if (stats.totalSessions > 0) {
    insights.push(
      `You've completed ${stats.totalSessions} session${stats.totalSessions > 1 ? 's' : ''}. Every session grows your forest!`
    );
  }

  // 4. Focus time analysis
  const totalHours = stats.totalFocusTime / 3600;
  if (totalHours >= 50) {
    insights.push(
      `You've focused for over ${Math.floor(totalHours)} hours—excellent dedication!`
    );
  } else if (totalHours >= 20) {
    insights.push(
      `You've accumulated ${Math.floor(totalHours)} hours of focused work. Impressive!`
    );
  }

  // 5. Average session duration insight
  const avgMinutes = stats.averageSessionDuration / 60;
  if (avgMinutes >= 40) {
    insights.push(
      `Your average session of ${Math.round(avgMinutes)} minutes shows deep focus capability.`
    );
  } else if (avgMinutes < 20) {
    insights.push(
      `Consider trying longer sessions (25-45 min) to grow premium and elite trees.`
    );
  }

  // Combine up to 3 insights
  return insights.length > 0
    ? insights.slice(0, 3).join(' ')
    : 'Complete more sessions to unlock personalized insights.';
}
