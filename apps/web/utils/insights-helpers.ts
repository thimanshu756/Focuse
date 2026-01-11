import { SessionStats } from '@/types/insights.types';

/**
 * Formats duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "23h 15m" or "45m"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Formats completion rate as percentage string
 * @param rate - Completion rate (0-100)
 * @returns Formatted string like "85%"
 */
export function formatCompletionRate(rate: number): string {
  return `${Math.round(rate)}%`;
}

/**
 * Determines color theme for completion rate
 * @param rate - Completion rate (0-100)
 * @returns Color theme: 'green' | 'yellow' | 'red'
 */
export function getCompletionRateColor(
  rate: number
): 'green' | 'yellow' | 'red' {
  if (rate >= 80) return 'green';
  if (rate >= 50) return 'yellow';
  return 'red';
}

/**
 * Exports session stats to CSV file
 * @param stats - Session statistics data
 * @param period - Selected time period
 */
export function exportToCSV(stats: SessionStats, period: string): void {
  const rows: string[][] = [
    ['Sylva Focus Analytics Report'],
    ['Period', period],
    ['Generated', new Date().toLocaleDateString()],
    [''],
    ['Summary Statistics'],
    ['Total Sessions', stats.totalSessions.toString()],
    ['Completed Sessions', stats.completedSessions.toString()],
    ['Failed Sessions', stats.failedSessions.toString()],
    ['Total Focus Time', formatDuration(stats.totalFocusTime)],
    ['Average Session Duration', formatDuration(stats.averageSessionDuration)],
    ['Completion Rate', `${stats.completionRate}%`],
    ['Longest Session', formatDuration(stats.longestSession)],
    ['Current Streak', `${stats.currentStreak} days`],
    [''],
    ['Daily Breakdown'],
    ['Date', 'Sessions', 'Focus Time (hours)', 'Completed'],
    ...stats.dailyBreakdown.map((day) => [
      day.date,
      day.sessions.toString(),
      (day.focusTime / 3600).toFixed(1),
      day.completed.toString(),
    ]),
  ];

  if (stats.taskBreakdown.length > 0) {
    rows.push(
      [''],
      ['Task Breakdown'],
      ['Task', 'Sessions', 'Focus Time (hours)']
    );
    rows.push(
      ...stats.taskBreakdown.map((task) => [
        task.taskTitle,
        task.sessions.toString(),
        (task.focusTime / 3600).toFixed(1),
      ])
    );
  }

  const csvContent = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sylva-insights-${period}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates basic AI insight from session stats
 * @param stats - Session statistics data
 * @returns Insight message string
 */
export function generateBasicInsight(stats: SessionStats): string {
  const insights: string[] = [];

  if (stats.completionRate >= 80) {
    insights.push(
      `Excellent ${Math.round(stats.completionRate)}% completion rate!`
    );
  } else if (stats.completionRate >= 50) {
    insights.push(
      `Your ${Math.round(stats.completionRate)}% completion rate is good, but there's room for improvement.`
    );
  } else {
    insights.push(
      `Your completion rate is ${Math.round(stats.completionRate)}%. Try to finish more sessions to grow your forest!`
    );
  }

  if (stats.currentStreak >= 7) {
    insights.push(
      `Your ${stats.currentStreak}-day streak shows great consistency. Keep it up!`
    );
  } else if (stats.currentStreak >= 3) {
    insights.push(
      `You're on a ${stats.currentStreak}-day streak! Building momentum.`
    );
  } else if (stats.currentStreak === 0) {
    insights.push(`Start a new streak today! Every session counts.`);
  }

  if (stats.totalSessions > 20) {
    insights.push(
      `You've completed ${stats.totalSessions} sessions this period—impressive dedication.`
    );
  } else if (stats.totalSessions > 10) {
    insights.push(
      `You've completed ${stats.totalSessions} sessions. Great progress!`
    );
  } else if (stats.totalSessions > 0) {
    insights.push(
      `You've completed ${stats.totalSessions} session${stats.totalSessions > 1 ? 's' : ''}. Keep going!`
    );
  }

  if (stats.totalFocusTime > 3600 * 10) {
    // More than 10 hours
    insights.push(
      `You've focused for over ${Math.floor(stats.totalFocusTime / 3600)} hours—excellent work!`
    );
  }

  return insights.length > 0
    ? insights.join(' ')
    : 'Keep up the great work! Complete more sessions to unlock deeper insights.';
}
