import { Session } from '@/types/session.types';

export interface HeatmapGrid {
  grid: number[][];
  maxValue: number;
  peakTime: {
    hour: string;
    day: string;
    value: number;
  } | null;
}

// Full hours array (6 AM - 11 PM)
export const hours = [
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
];

// Mobile hours (9 AM - 5 PM for compact display)
export const mobileHours = hours.slice(3, 12); // Indices 3-11 = 9 AM to 5 PM

export const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Processes sessions data into heatmap grid
 * @param sessions - Array of session objects with startTime and duration
 * @returns Processed heatmap data with grid, maxValue, and peakTime
 */
export function processHeatmapData(sessions: Session[]): HeatmapGrid {
  // Initialize 18 hours × 7 days grid (all zeros)
  const grid: number[][] = Array(18)
    .fill(null)
    .map(() => Array(7).fill(0));

  sessions.forEach((session) => {
    const date = new Date(session.startTime);
    const hour = date.getHours(); // 0-23
    let day = date.getDay(); // 0 (Sun) - 6 (Sat)

    // Rearrange: Monday = 0, Sunday = 6
    day = day === 0 ? 6 : day - 1;

    // Only track hours between 6 AM and 11 PM
    if (hour >= 6 && hour <= 23) {
      const hourIndex = hour - 6; // 0-17
      grid[hourIndex][day] += session.duration / 3600; // Add hours
    }
  });

  // Find max value for color scaling
  const maxValue = Math.max(...grid.flat(), 0);

  // Find peak time
  let peakTime: { hour: string; day: string; value: number } | null = null;
  let maxValueInGrid = 0;
  let peakHour = '';
  let peakDay = '';

  grid.forEach((row, hourIndex) => {
    row.forEach((value, dayIndex) => {
      if (value > maxValueInGrid) {
        maxValueInGrid = value;
        peakHour = hours[hourIndex];
        peakDay = days[dayIndex];
      }
    });
  });

  if (maxValueInGrid > 0) {
    peakTime = {
      hour: peakHour,
      day: peakDay,
      value: maxValueInGrid,
    };
  }

  return {
    grid,
    maxValue,
    peakTime,
  };
}

/**
 * Gets heatmap color based on hours and intensity
 * @param hours - Hours of focus time
 * @param intensity - Intensity ratio (0-1)
 * @returns Hex color string
 */
export function getHeatmapColor(hours: number, intensity: number): string {
  if (hours === 0) return '#F1F5F9'; // Light gray (no data)

  // Yellow gradient based on intensity
  if (intensity < 0.25) return '#FEF9C3'; // Very light yellow
  if (intensity < 0.5) return '#FDE047'; // Light yellow
  if (intensity < 0.75) return '#FACC15'; // Medium yellow
  return '#EAB308'; // Dark yellow/gold (highest)
}
