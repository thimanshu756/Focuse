/**
 * TimerControls Component
 * Pause/Resume and secondary action buttons for session control
 */

import React from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { Pause, Play, Volume2 } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

interface TimerControlsProps {
  /** Current session status */
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  /** Is API request pending */
  isRequestPending?: boolean;
  /** Is offline */
  isOffline?: boolean;
  /** Pause callback */
  onPause: () => void;
  /** Resume callback */
  onResume: () => void;
  /** Sound toggle callback */
  onSoundClick?: () => void;
  /** Is sound enabled */
  isSoundEnabled?: boolean;
}

export function TimerControls({
  status,
  isRequestPending = false,
  isOffline = false,
  onPause,
  onResume,
  onSoundClick,
  isSoundEnabled = false,
}: TimerControlsProps) {
  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';
  const isCompleted = status === 'COMPLETED';

  // Disable controls if offline or request pending
  const isDisabled = isOffline || isRequestPending || isCompleted;

  return (
    <View style={styles.container}>
      {/* Primary Control: Pause/Resume */}
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          isRunning ? styles.pauseButton : styles.resumeButton,
          isDisabled && styles.disabledButton,
          pressed && !isDisabled && styles.pressedButton,
        ]}
        onPress={isRunning ? onPause : onResume}
        disabled={isDisabled}
        accessibilityLabel={isRunning ? 'Pause timer' : 'Resume timer'}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {isRequestPending ? (
          <ActivityIndicator size="small" color={COLORS.text.primary} />
        ) : isRunning ? (
          <Pause size={32} color={COLORS.text.primary} />
        ) : (
          <Play size={32} color={COLORS.text.primary} />
        )}
        <Text style={styles.buttonText}>
          {isRequestPending
            ? 'Loading...'
            : isRunning
              ? 'Pause'
              : isPaused
                ? 'Resume'
                : 'Start'}
        </Text>
      </Pressable>

      {/* Secondary Controls */}
      {onSoundClick && (
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            isSoundEnabled && styles.soundActiveButton,
            pressed && styles.pressedSecondaryButton,
          ]}
          onPress={onSoundClick}
          accessibilityLabel={isSoundEnabled ? 'Sound on' : 'Sound off'}
          accessibilityRole="button"
        >
          <Volume2
            size={24}
            color={isSoundEnabled ? COLORS.primary.accent : COLORS.text.secondary}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.xxl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.pill,
    minWidth: 160,
  },
  pauseButton: {
    backgroundColor: COLORS.primary.accent,
  },
  resumeButton: {
    backgroundColor: COLORS.success,
  },
  disabledButton: {
    backgroundColor: COLORS.text.muted,
    opacity: 0.5,
  },
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundActiveButton: {
    backgroundColor: COLORS.primary.soft,
  },
  pressedSecondaryButton: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
