/**
 * Date utility functions for session management
 */

export const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const subDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};

export const getDateRange = (period: 'today' | 'week' | 'month' | 'year' | 'all'): {
  start: Date;
  end: Date;
} => {
  const now = new Date();
  const end = endOfDay(now);

  switch (period) {
    case 'today':
      return { start: startOfDay(now), end };
    case 'week':
      return { start: startOfDay(subDays(now, 7)), end };
    case 'month':
      return { start: startOfDay(subDays(now, 30)), end };
    case 'year':
      return { start: startOfDay(subDays(now, 365)), end };
    case 'all':
      return { start: new Date(0), end };
    default:
      return { start: startOfDay(subDays(now, 7)), end };
  }
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

