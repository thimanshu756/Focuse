/**
 * TimerPanel Component
 * Premium timer container with glassmorphism design
 * Integrates CircularTimer, controls, and session info
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { CircularTimer } from './CircularTimer';
import { TimerControls } from './TimerControls';
import { useAccurateSessionTimer } from '@/hooks/useAccurateSessionTimer';
import { api } from '@/services/api.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { AlertCircle, Clock, Target } from 'lucide-react-native';

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
  onComplete,
  onSessionUpdate,
  onProgressUpdate,
  orientation = 'portrait',
  isMobile = true,
}: TimerPanelProps) {
  const { width, height } = useWindowDimensions();
  const [isRequestPending, setIsRequestPending] = useState(false);

  // Memoize Date objects
  const startTimeDate = useMemo(() => new Date(startTime), [startTime]);
  const endTimeDate = useMemo(() => new Date(endTime), [endTime]);

  // Use ref to track the progress callback
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

  // Update progress for tree animation
  React.useEffect(() => {
    if (onProgressUpdateRef.current) {
      onProgressUpdateRef.current(timer.progressPercent);
    }
  }, [timer.progressPercent]);

  const handlePause = useCallback(async () => {
    if (isRequestPending) return;
    setIsRequestPending(true);
    try {
      await api.put(`/sessions/${sessionId}/pause`);
    } catch (error: any) {
      console.error('Failed to pause session:', error);
    } finally {
      setIsRequestPending(false);
    }
  }, [sessionId, isRequestPending]);

  const handleResume = useCallback(async () => {
    if (isRequestPending) return;
    setIsRequestPending(true);
    try {
      const response = await api.put(`/sessions/${sessionId}/resume`);
      if (response.data.success && onSessionUpdate) {
        onSessionUpdate(response.data.data.session);
      }
    } catch (error: any) {
      console.error('Failed to resume session:', error);
    } finally {
      setIsRequestPending(false);
    }
  }, [sessionId, isRequestPending, onSessionUpdate]);

  // Responsive timer size - optimized for space
  const timerSize = isMobile
    ? orientation === 'landscape'
      ? Math.min(height * 0.5, 180)
      : Math.min(width * 0.48, 200)
    : 300;

  // Show compact layout on small screens or landscape
  const isCompact = (isMobile && orientation === 'landscape') || width < 360;

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  // Container setup based on orientation
  const ContainerComponent = orientation === 'landscape' ? ScrollView : View;
  const containerProps =
    orientation === 'landscape'
      ? {
          style: styles.scrollContainer,
          contentContainerStyle: styles.scrollContent,
          showsVerticalScrollIndicator: false,
        }
      : {
          style: styles.container,
        };

  return (
    <ContainerComponent {...containerProps}>
      {/* Status Badges */}
      <View style={styles.badgeContainer}>
        {timer.isOffline && (
          <View style={styles.offlineBadge}>
            <AlertCircle size={14} color={COLORS.warning} />
            <Text style={styles.badgeText}>Offline</Text>
          </View>
        )}
        {timer.syncWarning && (
          <View style={styles.syncBadge}>
            <Clock size={14} color={COLORS.session.textSecondary} />
            <Text style={styles.badgeText}>Synced</Text>
          </View>
        )}
      </View>

      {/* Glass Card Container */}
      <View style={styles.glassCard}>
        {/* Task Info - Compact version */}
        {taskTitle && !isCompact && (
          <View style={styles.taskSection}>
            <View style={styles.taskIconContainer}>
              <Target size={16} color={COLORS.primary.accent} />
            </View>
            <View style={styles.taskTextContainer}>
              <Text style={styles.taskLabel}>FOCUSING ON</Text>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {taskTitle}
              </Text>
            </View>
          </View>
        )}

        {/* Circular Timer - Central focus */}
        <View style={styles.timerSection}>
          <CircularTimer
            progress={timer.progressPercent}
            timeRemaining={timer.remainingSeconds}
            formattedTime={timer.formattedTime}
            ringColor={timer.ringColor}
            isUrgent={timer.isUrgent}
            size={timerSize}
          />
        </View>

        {/* Session Duration Info - Only show if no task title */}
        {!taskTitle && (
          <View style={styles.durationInfo}>
            <Text style={styles.durationLabel}>Session Duration</Text>
            <Text style={styles.durationValue}>{formatDuration(durationSeconds)}</Text>
          </View>
        )}
      </View>

      {/* Timer Controls - Outside card for prominence */}
      {status !== 'COMPLETED' && status !== 'FAILED' && (
        <View style={styles.controlsContainer}>
          <TimerControls
            status={status}
            isRequestPending={isRequestPending}
            isOffline={timer.isOffline}
            onPause={handlePause}
            onResume={handleResume}
          />
        </View>
      )}

      {/* Completion Message */}
      {status === 'COMPLETED' && (
        <View style={styles.completedContainer}>
          <View style={styles.completedBadge}>
            <Text style={styles.completedEmoji}>🎉</Text>
          </View>
          <Text style={styles.completedText}>Session Complete!</Text>
          <Text style={styles.completedSubtext}>
            Great focus! Your tree has been planted.
          </Text>
        </View>
      )}
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    minHeight: 28,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.session.card,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.session.cardBorder,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.session.textSecondary,
  },
  glassCard: {
    width: '100%',
    backgroundColor: COLORS.session.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.session.cardBorder,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  taskSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.session.cardBorder,
    marginBottom: SPACING.sm,
  },
  taskIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(215, 245, 10, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskLabel: {
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: '600',
    color: COLORS.primary.accent,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.session.textPrimary,
    lineHeight: FONT_SIZES.md * 1.3,
  },
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  durationInfo: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.session.cardBorder,
    width: '100%',
  },
  durationLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.session.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.session.textSecondary,
    marginTop: SPACING.xs,
  },
  controlsContainer: {
    marginTop: SPACING.md,
    width: '100%',
    alignItems: 'center',
  },
  completedContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  completedBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  completedEmoji: {
    fontSize: 32,
  },
  completedText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  completedSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.session.textSecondary,
    textAlign: 'center',
  },
});
