/**
 * useTimeOfDay Hook
 * Returns current time of day category, updates every minute
 */

import { useState, useEffect } from 'react';
import { getTimeOfDay, type TimeOfDay } from '@/utils/time-gradients';

export function useTimeOfDay(): { timeOfDay: TimeOfDay } {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());

  useEffect(() => {
    // Update immediately
    setTimeOfDay(getTimeOfDay());

    // Update every 60 seconds
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { timeOfDay };
}
