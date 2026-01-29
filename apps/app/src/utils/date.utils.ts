import { format, formatDistance, formatRelative } from 'date-fns';

export const formatDate = (
  date: string | Date,
  formatString = 'MMM d, yyyy'
) => {
  return format(new Date(date), formatString);
};

export const formatTime = (date: string | Date) => {
  return format(new Date(date), 'h:mm a');
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const formatRelativeDate = (date: string | Date) => {
  return formatRelative(new Date(date), new Date());
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const formatTimerDisplay = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Dashboard-specific utilities

/**
 * Get time-based greeting
 * @returns Greeting text and emoji based on current time
 */
export function getTimeBasedGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', emoji: '🌅' };
  } else if (hour >= 12 && hour < 17) {
    return { text: 'Good afternoon', emoji: '🌤️' };
  } else if (hour >= 17 && hour < 22) {
    return { text: 'Good evening', emoji: '🌙' };
  } else {
    return { text: 'Good night', emoji: '🌃' };
  }
}

/**
 * Format hours from seconds
 * @param seconds - Time in seconds
 * @returns Formatted hours string (e.g. "2.5")
 */
export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(1);
}

/**
 * Format distance to now for due dates
 * @param date - The target date
 * @returns Human-readable string (e.g. "Due today", "Due in 2 days")
 */
export function formatDistanceToNow(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = then.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays === -1) return 'Due yesterday';
  if (diffDays < -1) return `Overdue by ${Math.abs(diffDays)} days`;
  if (diffDays > 1 && diffDays < 7) return `Due in ${diffDays} days`;
  if (diffDays >= 7) {
    const weeks = Math.floor(diffDays / 7);
    return `Due in ${weeks} week${weeks > 1 ? 's' : ''}`;
  }

  return `Due in ${diffDays} days`;
}
