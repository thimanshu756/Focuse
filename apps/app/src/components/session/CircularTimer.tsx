/**
 * CircularTimer Component
 * Premium SVG-based circular progress ring with centered time display
 * Design matches the app's premium, calm aesthetic
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, SPACING } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularTimerProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Time remaining in seconds */
  timeRemaining: number;
  /** Formatted time string (MM:SS) */
  formattedTime: string;
  /** Ring color hex code */
  ringColor: string;
  /** Is urgent state (< 5 min) */
  isUrgent?: boolean;
  /** Component size in pixels */
  size?: number;
}

export function CircularTimer({
  progress,
  timeRemaining,
  formattedTime,
  ringColor,
  isUrgent = false,
  size = 220,
}: CircularTimerProps) {
  // Premium design: thicker stroke for better visibility
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Shared values
  const strokeDashoffset = useSharedValue(circumference);
  const pulseOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  // Animate progress smoothly
  useEffect(() => {
    const offset = circumference - (progress / 100) * circumference;
    strokeDashoffset.value = withTiming(offset, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, circumference]);

  // Pulse animation when urgent
  useEffect(() => {
    if (isUrgent) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulseOpacity.value = withTiming(0);
      glowScale.value = withTiming(1);
    }
  }, [isUrgent]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  // Animated style for urgent pulse
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  // Calculate remaining time label
  const getTimeLabel = () => {
    if (timeRemaining <= 0) return 'Complete';
    if (timeRemaining < 60) return 'Almost there!';
    if (timeRemaining < 300) return 'Final stretch';
    return 'remaining';
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow ring for urgent state */}
      {isUrgent && (
        <Animated.View
          style={[
            styles.urgentGlow,
            {
              width: size + 20,
              height: size + 20,
              borderRadius: (size + 20) / 2,
            },
            pulseStyle,
          ]}
        />
      )}

      {/* SVG Ring */}
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={ringColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.primary.soft} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background Circle - subtle track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.session.ring.background}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle - with gradient */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isUrgent ? COLORS.session.ring.urgent : 'url(#progressGradient)'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Centered Content */}
      <View style={styles.contentContainer}>
        {/* Time Display */}
        <Text
          style={[
            styles.timeText,
            isUrgent && styles.urgentTimeText,
            { fontSize: size * 0.2 },
          ]}
          accessibilityLabel={`Time remaining: ${formattedTime}`}
          accessibilityRole="timer"
          accessibilityLiveRegion="polite"
        >
          {formattedTime}
        </Text>

        {/* Status Label */}
        <Text style={[styles.statusLabel, { fontSize: size * 0.06 }]}>
          {getTimeLabel()}
        </Text>

        {/* Progress Percentage */}
        <View style={styles.progressBadge}>
          <Text style={[styles.progressText, { fontSize: size * 0.055 }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  urgentGlow: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: '700',
    letterSpacing: -1.5,
    color: COLORS.session.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  urgentTimeText: {
    color: COLORS.error,
  },
  statusLabel: {
    color: COLORS.session.textMuted,
    fontWeight: '500',
    marginTop: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBadge: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.session.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.session.cardBorder,
  },
  progressText: {
    color: COLORS.primary.accent,
    fontWeight: '600',
  },
});
