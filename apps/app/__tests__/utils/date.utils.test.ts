import {
  formatDate,
  formatTime,
  formatDuration,
  formatTimerDisplay,
} from '@/utils/date.utils';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });

    it('accepts custom format string', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
    });
  });

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(formatTime(date)).toBe('2:30 PM');
    });
  });

  describe('formatDuration', () => {
    it('formats minutes only', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('formats hours only', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
    });
  });

  describe('formatTimerDisplay', () => {
    it('formats seconds to MM:SS', () => {
      expect(formatTimerDisplay(65)).toBe('01:05');
    });

    it('pads single digits', () => {
      expect(formatTimerDisplay(5)).toBe('00:05');
    });

    it('handles large numbers', () => {
      expect(formatTimerDisplay(3661)).toBe('61:01');
    });
  });
});
