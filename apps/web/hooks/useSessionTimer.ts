'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSessionTimerProps {
  duration: number; // Total duration in seconds
  startTime: Date;
  endTime: Date;
  status: 'RUNNING' | 'PAUSED';
  timeElapsed?: number; // Actual elapsed time (excluding pauses) from server
  onComplete: () => void;
}

export function useSessionTimer({
  duration,
  startTime,
  endTime,
  status,
  timeElapsed = 0,
  onComplete,
}: UseSessionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate time remaining based on status
  const calculateTimeRemaining = useCallback(() => {
    if (status === 'PAUSED') {
      // When paused, use server's timeElapsed to calculate remaining
      const remaining = Math.max(0, duration - timeElapsed);
      return remaining;
    } else {
      // When running, calculate from endTime
      const now = new Date();
      const end = new Date(endTime);
      const remaining = Math.max(
        0,
        Math.floor((end.getTime() - now.getTime()) / 1000)
      );
      return remaining;
    }
  }, [endTime, status, duration, timeElapsed]);

  // Calculate progress percentage
  const calculateProgress = useCallback(
    (remaining: number) => {
      const elapsed = duration - remaining;
      return Math.min(100, Math.max(0, (elapsed / duration) * 100));
    },
    [duration]
  );

  // Update timer
  const updateTimer = useCallback(() => {
    const remaining = calculateTimeRemaining();
    setTimeRemaining(remaining);
    setProgress(calculateProgress(remaining));

    if (remaining === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      onComplete();
    }
  }, [calculateTimeRemaining, calculateProgress, onComplete]);

  // Start/stop timer based on status
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (status === 'RUNNING') {
      // Initial update
      updateTimer();

      // Start interval
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      // Paused - update once to get current state (no interval, stays frozen)
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      setProgress(calculateProgress(remaining));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    status,
    endTime,
    timeElapsed,
    updateTimer,
    calculateTimeRemaining,
    calculateProgress,
  ]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    progress,
    formattedTime: formatTime(timeRemaining),
    isUrgent: timeRemaining < 300, // Less than 5 minutes
  };
}
