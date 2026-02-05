import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { TaskBar } from './TaskBar';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

interface TaskBreakdown {
  taskId: string;
  taskTitle: string;
  sessions: number;
  focusTime: number; // in seconds
}

interface TopTasksChartProps {
  taskBreakdown: TaskBreakdown[];
  isLoading?: boolean;
}

export function TopTasksChart({
  taskBreakdown,
  isLoading = false,
}: TopTasksChartProps) {
  const topTasks = useMemo(() => {
    if (!taskBreakdown.length) return [];

    return [...taskBreakdown]
      .sort((a, b) => b.focusTime - a.focusTime)
      .slice(0, 5)
      .map((task, index) => ({
        rank: index + 1,
        taskTitle: task.taskTitle,
        hours: (task.focusTime / 3600).toFixed(1),
        focusTime: task.focusTime,
      }));
  }, [taskBreakdown]);

  const maxTime = useMemo(() => {
    if (!topTasks.length) return 0;
    return Math.max(...topTasks.map((t) => t.focusTime));
  }, [topTasks]);

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Skeleton width={150} height={20} />
        </View>
        <Skeleton width="100%" height={200} style={styles.chartSkeleton} />
      </Card>
    );
  }

  if (topTasks.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Top Tasks 🎯</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No task data available</Text>
          <Text style={styles.emptySubtitle}>
            Link sessions to tasks to see insights here
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Tasks 🎯</Text>
        <Text style={styles.subtitle}>By focus time</Text>
      </View>

      <View style={styles.tasksContainer}>
        {topTasks.map((task, index) => (
          <TaskBar
            key={task.taskTitle}
            task={task}
            maxTime={maxTime}
            index={index}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  chartSkeleton: {
    marginTop: SPACING.md,
  },
  emptyState: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  tasksContainer: {
    marginTop: SPACING.sm,
  },
});
