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
