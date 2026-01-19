'use client';

import { useState, useEffect } from 'react';
import { TimeOfDay, getTimeOfDay } from '@/utils/time-gradients';

/**
 * Custom hook that returns current time of day and updates when hour changes
 * @returns Object with current time of day string
 */
export function useTimeOfDay(): { timeOfDay: TimeOfDay } {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => {
    // Initialize with current time
    const hour = new Date().getHours();
    return getTimeOfDay(hour);
  });

  useEffect(() => {
    // Update time of day every minute to catch hour changes
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      setTimeOfDay(getTimeOfDay(hour));
    };

    // Update immediately
    updateTimeOfDay();

    // Set interval to check every 60 seconds
    const interval = setInterval(updateTimeOfDay, 60000);

    return () => clearInterval(interval);
  }, []);

  return { timeOfDay };
}
