import { Session } from '@/types/forest.types';

/**
 * Determines tree type based on session duration and status
 * @param durationSeconds - Session duration in seconds
 * @param status - Session status
 * @returns Tree type: 'basic' | 'premium' | 'elite' | 'dead'
 */
export function getTreeType(
  durationSeconds: number,
  status?: string
): 'basic' | 'premium' | 'elite' | 'dead' {
  // Dead tree for incomplete/failed sessions
  if (status === 'FAILED') return 'dead';

  const minutes = durationSeconds / 60;
  if (minutes <= 15) return 'basic';
  if (minutes <= 45) return 'premium';
  return 'elite';
}

/**
 * Formats duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "23h 15m" or "45m"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Formats duration in seconds to decimal hours
 * @param seconds - Duration in seconds
 * @returns Formatted string like "2.5"
 */
export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(1);
}

/**
 * Adds tree type property to sessions
 * @param sessions - Array of sessions
 * @returns Sessions with treeType property added
 */
export function enrichSessionsWithTreeType(sessions: Session[]): Session[] {
  return sessions.map((session) => ({
    ...session,
    treeType: getTreeType(session.duration, session.status),
  }));
}

/**
 * Gets tree emoji based on tree type
 * @param treeType - Tree type
 * @returns Emoji representation
 */
export function getTreeEmoji(
  treeType: 'basic' | 'premium' | 'elite' | 'dead'
): string {
  const emojiMap = {
    basic: '🌱',
    premium: '🌳',
    elite: '🏆',
    dead: '🪦',
  };
  return emojiMap[treeType];
}

/**
 * Gets tree label based on tree type
 * @param treeType - Tree type
 * @returns Human-readable label
 */
export function getTreeLabel(
  treeType: 'basic' | 'premium' | 'elite' | 'dead'
): string {
  const labelMap = {
    basic: 'Basic Trees',
    premium: 'Premium Trees',
    elite: 'Elite Trees',
    dead: 'Dead Trees',
  };
  return labelMap[treeType];
}

/**
 * Gets tree description based on tree type
 * @param treeType - Tree type
 * @returns Description with duration range
 */
export function getTreeDescription(
  treeType: 'basic' | 'premium' | 'elite' | 'dead'
): string {
  const descriptionMap = {
    basic: '≤15 min sessions',
    premium: '16-45 min sessions',
    elite: '>45 min sessions',
    dead: 'Incomplete sessions',
  };
  return descriptionMap[treeType];
}
