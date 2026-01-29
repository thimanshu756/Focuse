/**
 * useAccurateSessionTimer Hook
 * Enhanced session timer with drift correction, offline handling, and background support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { api } from '@/services/api.service';
import type { Session, TimerState } from '@/types/session.types';
import { formatTime, getRingColor } from '@/utils/session-helpers';

interface UseAccurateSessionTimerProps {
  sessionId: string;
  durationSeconds: number;
  startTime: Date;
  endTime: Date;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  timeElapsed?: number;
  onComplete: () => void;
  onSessionUpdate?: (session: Session) => void;
}

interface TimerResult extends TimerState {
  formattedTime: string;
  isUrgent: boolean;
  ringColor: string;
  ariaLabel: string;
}

/**
 * Accurate session timer with drift correction and edge case handling
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
}: UseAccurateSessionTimerProps): TimerResult {
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
  const completionFiredRef = useRef(false);

  /**
   * Calculate remaining time from server timestamps
   */
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

  /**
   * Calculate progress percentage
   */
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

  /**
   * Update timer state
   */
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

    // Trigger completion callback (only once)
    if (isCompleted && !completionFiredRef.current) {
      completionFiredRef.current = true;
      onComplete();
    }
  }, [
    calculateRemainingFromServer,
    calculateProgress,
    status,
    onComplete,
  ]);

  /**
   * Resync with server to detect drift
   */
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
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
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

  /**
   * Handle app state changes (background/foreground)
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - force immediate resync
        resyncWithServer();
        // Update timer immediately
        updateTimer();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [resyncWithServer, updateTimer]);

  /**
   * Handle network state changes
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        // Network came back - resync immediately
        resyncWithServer();
      } else {
        setTimerState((prev) => ({ ...prev, isOffline: true }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [resyncWithServer]);

  /**
   * Initial calculation
   */
  useEffect(() => {
    updateTimer();
  }, [updateTimer]);

  /**
   * Start/stop timer based on status
   */
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

  /**
   * Get aria label for accessibility
   */
  const getAriaLabel = (): string => {
    const mins = Math.floor(timerState.remainingSeconds / 60);
    const secs = timerState.remainingSeconds % 60;
    return `Time remaining: ${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  };

  return {
    ...timerState,
    formattedTime: formatTime(timerState.remainingSeconds),
    isUrgent: timerState.remainingSeconds < 300,
    ringColor: getRingColor(timerState.remainingSeconds),
    ariaLabel: getAriaLabel(),
  };
}
