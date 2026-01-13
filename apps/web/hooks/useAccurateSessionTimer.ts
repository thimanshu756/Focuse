'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseAccurateSessionTimerProps {
  sessionId: string;
  durationSeconds: number;
  startTime: Date;
  endTime: Date;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
  timeElapsed?: number;
  onComplete: () => void;
  onSessionUpdate?: (session: any) => void;
}

interface TimerState {
  remainingSeconds: number;
  progressPercent: number;
  isCompleted: boolean;
  isOffline: boolean;
  syncWarning: boolean;
}

/**
 * Enhanced session timer with drift correction, resync, and edge case handling
 */
export function useAccurateSessionTimer({
  sessionId,
  durationSeconds,
  startTime,
  endTime,
  status,
  timeElapsed = 0,
  onComplete,
  onSessionUpdate,
}: UseAccurateSessionTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>({
    remainingSeconds: 0,
    progressPercent: 0,
    isCompleted: false,
    isOffline: false,
    syncWarning: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const resyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTimeRef = useRef<number>(Date.now());
  const isRequestPendingRef = useRef(false);

  // Calculate remaining time from server timestamps
  const calculateRemainingFromServer = useCallback((): number => {
    if (status === 'COMPLETED' || durationSeconds === 0) {
      return 0;
    }

    if (status === 'PAUSED') {
      // When paused, use timeElapsed from server
      return Math.max(0, durationSeconds - timeElapsed);
    }

    // When running, calculate from endTime
    const now = new Date();
    const end = new Date(endTime);
    const remaining = Math.max(
      0,
      Math.floor((end.getTime() - now.getTime()) / 1000)
    );
    return remaining;
  }, [endTime, status, durationSeconds, timeElapsed]);

  // Calculate progress percentage
  const calculateProgress = useCallback(
    (remaining: number): number => {
      if (durationSeconds === 0) return 0;
      const elapsed = durationSeconds - remaining;
      return Math.min(
        100,
        Math.max(0, Math.round((elapsed / durationSeconds) * 100))
      );
    },
    [durationSeconds]
  );

  // Update timer state
  const updateTimer = useCallback(() => {
    const remaining = calculateRemainingFromServer();
    const progress = calculateProgress(remaining);
    const isCompleted = remaining === 0 && status !== 'PAUSED';

    setTimerState((prev) => ({
      ...prev,
      remainingSeconds: remaining,
      progressPercent: progress,
      isCompleted,
    }));

    // Trigger completion callback
    if (isCompleted && !timerState.isCompleted) {
      onComplete();
    }
  }, [
    calculateRemainingFromServer,
    calculateProgress,
    status,
    timerState.isCompleted,
    onComplete,
  ]);

  // Resync with server
  const resyncWithServer = useCallback(async () => {
    if (isRequestPendingRef.current || !sessionId) return;

    try {
      isRequestPendingRef.current = true;
      const response = await api.get(`/sessions/${sessionId}`);

      if (response.data.success && response.data.data?.session) {
        const session = response.data.data.session;
        const serverEndTime = new Date(session.endTime);
        const serverRemaining = Math.max(
          0,
          Math.floor((serverEndTime.getTime() - Date.now()) / 1000)
        );

        // Check for drift
        const currentRemaining = calculateRemainingFromServer();
        const drift = Math.abs(serverRemaining - currentRemaining);

        if (drift > 3) {
          // Significant drift detected - correct it
          setTimerState((prev) => ({
            ...prev,
            remainingSeconds: serverRemaining,
            progressPercent: calculateProgress(serverRemaining),
            syncWarning: drift > 10, // Show warning for extreme drift
          }));

          // Update session data if callback provided
          if (onSessionUpdate) {
            onSessionUpdate(session);
          }

          // Auto-dismiss sync warning after 5 seconds
          if (drift > 10) {
            setTimeout(() => {
              setTimerState((prev) => ({ ...prev, syncWarning: false }));
            }, 5000);
          }
        } else {
          // No significant drift - clear any existing warning
          setTimerState((prev) => ({ ...prev, syncWarning: false }));
        }

        lastSyncTimeRef.current = Date.now();
        setTimerState((prev) => ({ ...prev, isOffline: false }));
      }
    } catch (error: any) {
      // Network error - mark as offline but keep local timer running
      if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
        setTimerState((prev) => ({ ...prev, isOffline: true }));
      }
      console.error('Failed to resync timer:', error);
    } finally {
      isRequestPendingRef.current = false;
    }
  }, [
    sessionId,
    calculateRemainingFromServer,
    calculateProgress,
    onSessionUpdate,
  ]);

  // Handle visibility change (tab switching, sleep/wake)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible - force immediate resync
        resyncWithServer();
        // Update timer immediately
        updateTimer();
      }
    };

    const handleOnline = () => {
      // Network came back - resync immediately
      resyncWithServer();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [resyncWithServer, updateTimer]);

  // Initial calculation
  useEffect(() => {
    updateTimer();
  }, [updateTimer]);

  // Start/stop timer based on status
  useEffect(() => {
    // Clear existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (resyncIntervalRef.current) {
      clearInterval(resyncIntervalRef.current);
      resyncIntervalRef.current = null;
    }

    if (status === 'RUNNING' && !timerState.isCompleted) {
      // Start local tick
      intervalRef.current = setInterval(updateTimer, 1000);

      // Start resync interval (every 10 seconds)
      resyncIntervalRef.current = setInterval(resyncWithServer, 10000);
    } else if (status === 'PAUSED') {
      // Paused - update once but don't tick
      updateTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (resyncIntervalRef.current) {
        clearInterval(resyncIntervalRef.current);
        resyncIntervalRef.current = null;
      }
    };
  }, [status, timerState.isCompleted, updateTimer, resyncWithServer]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (durationSeconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get ring color based on time remaining
  const getRingColor = (): string => {
    const remaining = timerState.remainingSeconds;
    if (remaining > 900) return '#22C55E'; // Green: > 15 min
    if (remaining > 300) return '#EAB308'; // Yellow: 5-15 min
    return '#EF4444'; // Red: < 5 min
  };

  // Get aria label for accessibility
  const getAriaLabel = (): string => {
    const mins = Math.floor(timerState.remainingSeconds / 60);
    const secs = timerState.remainingSeconds % 60;
    return `Time remaining: ${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  };

  return {
    timeRemaining: timerState.remainingSeconds,
    progress: timerState.progressPercent,
    formattedTime: formatTime(timerState.remainingSeconds),
    isUrgent: timerState.remainingSeconds < 300,
    isCompleted: timerState.isCompleted,
    isOffline: timerState.isOffline,
    syncWarning: timerState.syncWarning,
    ringColor: getRingColor(),
    ariaLabel: getAriaLabel(),
  };
}
