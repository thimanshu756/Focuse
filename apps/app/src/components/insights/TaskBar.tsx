import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface Task {
  rank: number;
  taskTitle: string;
  hours: string;
  focusTime: number;
}

interface TaskBarProps {
  task: Task;
  maxTime: number;
  index: number;
}

export function TaskBar({ task, maxTime, index }: TaskBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentage = maxTime > 0 ? (task.focusTime / maxTime) * 100 : 0;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 800,
      delay: index * 100,
      useNativeDriver: false,
    }).start();
  }, [percentage, index]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Rank */}
      <Text style={styles.rank}>{task.rank}.</Text>

      {/* Task Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {task.taskTitle}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: widthInterpolate },
            ]}
          />
        </View>
      </View>

      {/* Time */}
      <Text style={styles.time}>{task.hours}h</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  rank: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
    width: 24,
  },
  titleContainer: {
    flex: 1,
    minWidth: 120,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  progressBarContainer: {
    flex: 2,
    minWidth: 100,
  },
  progressBarBackground: {
    height: 32,
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary.accent,
    borderRadius: BORDER_RADIUS.pill,
  },
  time: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    width: 50,
    textAlign: 'right',
  },
});
