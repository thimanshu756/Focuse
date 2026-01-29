/**
 * Session Helper Utilities
 * Helper functions for session calculations and formatting
 */

import { TreeType } from '@/types/session.types';

/**
 * Calculate tree type based on session duration
 * @param durationSeconds Duration in seconds
 * @returns Tree type tier
 */
export function getTreeType(durationSeconds: number): TreeType {
  const minutes = durationSeconds / 60;

  if (minutes <= 15) {
    return 'basic';
  } else if (minutes <= 45) {
    return 'premium';
  } else {
    return 'elite';
  }
}

/**
 * Calculate progress percentage
 * @param timeElapsed Time elapsed in seconds
 * @param duration Total duration in seconds
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
  timeElapsed: number,
  duration: number
): number {
  if (duration === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((timeElapsed / duration) * 100)));
}

/**
 * Format time as MM:SS
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) return '--:--';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time as HH:MM:SS for sessions over 1 hour
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export function formatTimeLong(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) return '--:--:--';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return formatTime(seconds);
}

/**
 * Check if timer is in urgent state (< 5 minutes remaining)
 * @param remainingSeconds Time remaining in seconds
 * @returns True if urgent
 */
export function isUrgent(remainingSeconds: number): boolean {
  return remainingSeconds < 300; // 5 minutes
}

/**
 * Get ring color based on time remaining
 * @param remainingSeconds Time remaining in seconds
 * @returns Color hex code
 */
export function getRingColor(remainingSeconds: number): string {
  if (remainingSeconds > 900) return '#22C55E'; // Green: > 15 min
  if (remainingSeconds > 300) return '#EAB308'; // Yellow: 5-15 min
  return '#EF4444'; // Red: < 5 min
}

/**
 * Get tree emoji based on tree type
 * @param treeType Tree type tier
 * @returns Emoji string
 */
export function getTreeEmoji(treeType: TreeType): string {
  switch (treeType) {
    case 'basic':
      return '🌱';
    case 'premium':
      return '🌳';
    case 'elite':
      return '🏆';
    default:
      return '🌱';
  }
}

/**
 * Get tree tier label
 * @param treeType Tree type tier
 * @returns Label string
 */
export function getTreeTierLabel(treeType: TreeType): string {
  switch (treeType) {
    case 'basic':
      return 'Basic';
    case 'premium':
      return 'Premium';
    case 'elite':
      return 'Elite';
    default:
      return 'Basic';
  }
}
