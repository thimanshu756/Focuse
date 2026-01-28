/**
 * TimerPanel Component
 * Main timer container integrating CircularTimer, controls, and session info
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { CircularTimer } from './CircularTimer';
import { TimerControls } from './TimerControls';
import { useAccurateSessionTimer } from '@/hooks/useAccurateSessionTimer';
import { api } from '@/services/api.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { AlertCircle } from 'lucide-react-native';

interface TimerPanelProps {
  sessionId: string;
  durationSeconds: number;
  startTime: string;
  endTime: string;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  timeElapsed: number;
  taskTitle?: string;
  taskDescription?: string;
  onComplete: () => void;
  onSessionUpdate?: (session: any) => void;
  onProgressUpdate?: (progress: number) => void;
  orientation?: 'portrait' | 'landscape';
  isMobile?: boolean;
}

export function TimerPanel({
  sessionId,
  durationSeconds,
  startTime,
  endTime,
  status,
  timeElapsed,
  taskTitle,
  taskDescription,
  onComplete,
  onSessionUpdate,
  onProgressUpdate,
  orientation = 'portrait',
  isMobile = true,
}: TimerPanelProps) {
  const { width, height } = useWindowDimensions();
  const [isRequestPending, setIsRequestPending] = useState(false);

  // Memoize Date objects to prevent new instances on every render
  const startTimeDate = useMemo(() => new Date(startTime), [startTime]);
  const endTimeDate = useMemo(() => new Date(endTime), [endTime]);

  // Use ref to track the progress callback to avoid dependency issues
  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;

  // Use accurate timer hook
  const timer = useAccurateSessionTimer({
    sessionId,
    durationSeconds,
    startTime: startTimeDate,
    endTime: endTimeDate,
    status,
    timeElapsed,
    onComplete,
    onSessionUpdate,
  });

  // Update progress for tree animation - use ref to avoid dependency on callback
  React.useEffect(() => {
    if (onProgressUpdateRef.current) {
      onProgressUpdateRef.current(timer.progressPercent);
    }
  }, [timer.progressPercent]);

  /**
   * Handle pause action
   */
  const handlePause = useCallback(async () => {
    if (isRequestPending) return;

    setIsRequestPending(true);
    try {
      await api.put(`/sessions/${sessionId}/pause`);
      // Session will be updated via polling (useSessionSync)
    } catch (error: any) {
      console.error('Failed to pause session:', error);
      // Show error toast here if needed
    } finally {
      setIsRequestPending(false);
    }
  }, [sessionId, isRequestPending]);

  /**
   * Handle resume action
   */
  const handleResume = useCallback(async () => {
    if (isRequestPending) return;

    setIsRequestPending(true);
    try {
      const response = await api.put(`/sessions/${sessionId}/resume`);
      // Session will be updated via polling (useSessionSync)
      if (response.data.success && onSessionUpdate) {
        onSessionUpdate(response.data.data.session);
      }
    } catch (error: any) {
      console.error('Failed to resume session:', error);
      // Show error toast here if needed
    } finally {
      setIsRequestPending(false);
    }
  }, [sessionId, isRequestPending, onSessionUpdate]);

  // Responsive timer size
  const timerSize = isMobile
    ? orientation === 'landscape'
      ? Math.min(height * 0.5, 180)
      : Math.min(width * 0.6, 200)
    : 280;

  // Show compact layout on small screens or landscape
  const isCompact = (isMobile && orientation === 'landscape') || width < 360;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: 'white' }}>TimerPanel</Text>
      {/* Offline Badge */}
      {timer.isOffline && (
        <View style={styles.offlineBadge}>
          <AlertCircle size={16} color={COLORS.error} />
          <Text style={styles.offlineText}>Offline</Text>
        </View>
      )}

      {/* Sync Warning */}
      {timer.syncWarning && (
        <View style={styles.syncWarning}>
          <Text style={styles.syncWarningText}>Time adjusted</Text>
        </View>
      )}

      {/* Task Info */}
      {taskTitle && !isCompact && (
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {taskTitle}
          </Text>
          {taskDescription && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {taskDescription}
            </Text>
          )}
        </View>
      )}

      {/* Circular Timer */}
      <View style={styles.timerContainer}>
        <CircularTimer
          progress={timer.progressPercent}
          timeRemaining={timer.remainingSeconds}
          formattedTime={timer.formattedTime}
          ringColor={timer.ringColor}
          isUrgent={timer.isUrgent}
          size={timerSize}
        />
      </View>

      {/* Timer Controls */}
      {status !== 'COMPLETED' && status !== 'FAILED' && (
        <TimerControls
          status={status}
          isRequestPending={isRequestPending}
          isOffline={timer.isOffline}
          onPause={handlePause}
          onResume={handleResume}
        />
      )}

      {/* Completion Message */}
      {status === 'COMPLETED' && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>Session Complete!</Text>
          <Text style={styles.completedSubtext}>
            Great work! You've completed your focus session.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  offlineText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  syncWarning: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  syncWarningText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: '#92400E',
  },
  taskInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  taskTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  taskDescription: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
  },
  completedContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  completedText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  completedSubtext: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
