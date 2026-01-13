/**
 * Utility functions for time-based gradient backgrounds and particle types
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type ParticleType = 'leaves' | 'fireflies' | 'stars' | 'none';

/**
 * Determines the time of day based on current hour
 * @param hour - Current hour (0-23)
 * @returns Time of day string
 */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else if (hour >= 18 && hour < 22) {
    return 'evening';
  } else {
    return 'night';
  }
}

/**
 * Gets the CSS gradient string for a given time of day
 * @param timeOfDay - Current time of day
 * @returns CSS linear-gradient string
 */
export function getGradientForTime(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'morning':
      // Sunrise gradient: deep purple blue to lighter purple
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    case 'afternoon':
      // Bright day gradient: pink to coral red
      return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    case 'evening':
      // Sunset gradient: light blue to cyan
      return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    case 'night':
      // Dark night gradient: three-color gradient
      return 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
    default:
      return 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
  }
}

/**
 * Determines which particle type to show based on time of day
 * @param timeOfDay - Current time of day
 * @returns Particle type string
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
      return 'none';
  }
}

/**
 * Checks if clouds should be visible based on time of day
 * @param timeOfDay - Current time of day
 * @returns Boolean indicating if clouds should show
 */
export function shouldShowClouds(timeOfDay: TimeOfDay): boolean {
  return timeOfDay === 'morning' || timeOfDay === 'afternoon';
}
