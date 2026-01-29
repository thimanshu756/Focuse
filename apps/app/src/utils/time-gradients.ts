/**
 * Time-based gradient utilities
 * Provides gradients and themes based on time of day
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type ParticleType = 'leaves' | 'fireflies' | 'stars' | 'none';

/**
 * Get time of day category based on hour
 */
export function getTimeOfDay(hour?: number): TimeOfDay {
  const currentHour = hour !== undefined ? hour : new Date().getHours();

  if (currentHour >= 6 && currentHour < 12) {
    return 'morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    return 'afternoon';
  } else if (currentHour >= 18 && currentHour < 22) {
    return 'evening';
  } else {
    return 'night';
  }
}

/**
 * Get gradient colors for expo-linear-gradient based on time of day
 * Returns an array of colors for LinearGradient component
 */
export function getGradientForTime(timeOfDay: TimeOfDay): {
  colors: string[];
  locations?: number[];
} {
  switch (timeOfDay) {
    case 'morning':
      // Purple gradient (dawn/sunrise)
      return {
        colors: ['#667eea', '#764ba2'],
        locations: [0, 1],
      };

    case 'afternoon':
      // Pink-coral gradient (bright day)
      return {
        colors: ['#f093fb', '#f5576c'],
        locations: [0, 1],
      };

    case 'evening':
      // Blue-cyan gradient (sunset)
      return {
        colors: ['#4facfe', '#00f2fe'],
        locations: [0, 1],
      };

    case 'night':
      // Dark blue 3-color gradient (night sky)
      return {
        colors: ['#0f2027', '#203a43', '#2c5364'],
        locations: [0, 0.5, 1],
      };

    default:
      return {
        colors: ['#667eea', '#764ba2'],
        locations: [0, 1],
      };
  }
}

/**
 * Get particle type to display based on time of day
 */
export function getParticleType(timeOfDay: TimeOfDay): ParticleType {
  switch (timeOfDay) {
    case 'morning':
    case 'afternoon':
      return 'leaves';
    case 'evening':
      return 'fireflies';
    case 'night':
      return 'stars';
    default:
      return 'leaves';
  }
}

/**
 * Should show clouds based on time of day
 */
export function shouldShowClouds(timeOfDay: TimeOfDay): boolean {
  return timeOfDay === 'morning' || timeOfDay === 'afternoon';
}
