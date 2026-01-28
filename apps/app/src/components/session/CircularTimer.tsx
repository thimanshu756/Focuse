/**
 * CircularTimer Component
 * SVG-based circular progress ring with centered time display
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONT_SIZES } from '@/constants/theme';

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
  size = 280,
}: CircularTimerProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Shared value for animated stroke
  const strokeDashoffset = useSharedValue(circumference);

  // Shared value for pulse animation
  const pulseScale = useSharedValue(1);

  // Animate progress
  useEffect(() => {
    const offset = circumference - (progress / 100) * circumference;
    strokeDashoffset.value = withTiming(offset, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, circumference]);

  // Pulse animation when urgent
  useEffect(() => {
    if (isUrgent) {
      // Pulse effect
      pulseScale.value = withTiming(
        1.05,
        { duration: 600, easing: Easing.inOut(Easing.ease) },
        (finished) => {
          if (finished) {
            pulseScale.value = withTiming(1, {
              duration: 600,
              easing: Easing.inOut(Easing.ease),
            });
          }
        }
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isUrgent, timeRemaining]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Circle */}
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.background.card}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Centered Time Display */}
      <View style={styles.timeContainer}>
        <Text
          style={[
            styles.timeText,
            isUrgent && styles.urgentText,
            { fontSize: size * 0.18 },
          ]}
          accessibilityLabel={`Time remaining: ${formattedTime}`}
          accessibilityRole="timer"
          accessibilityLiveRegion="polite"
        >
          {formattedTime}
        </Text>
        <Text style={[styles.progressText, { fontSize: size * 0.08 }]}>
          {progress}% complete
        </Text>
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
  timeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: '600',
    letterSpacing: -1,
    color: COLORS.text.primary,
  },
  urgentText: {
    color: COLORS.error,
  },
  progressText: {
    marginTop: 8,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});
