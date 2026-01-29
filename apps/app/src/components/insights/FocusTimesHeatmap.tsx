import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { HeatmapCell } from './HeatmapCell';
import { processHeatmapData, mobileHours, days } from '@/utils/heatmap-helpers';
import { Session } from '@/types/session.types';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

interface FocusTimesHeatmapProps {
  sessions: Session[];
  isLoading?: boolean;
}

export function FocusTimesHeatmap({
  sessions,
  isLoading = false,
}: FocusTimesHeatmapProps) {
  const heatmapData = useMemo(() => {
    if (!sessions.length) return null;
    return processHeatmapData(sessions);
  }, [sessions]);

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Skeleton width={180} height={20} />
        </View>
        <Skeleton width="100%" height={220} style={styles.chartSkeleton} />
      </Card>
    );
  }

  if (!heatmapData || sessions.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Best Focus Times 🔥</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No session data for this period</Text>
        </View>
      </Card>
    );
  }

  const { grid, maxValue, peakTime } = heatmapData;

  // For mobile, show only 9 AM - 5 PM (indices 3-11 in the grid)
  const mobileGrid = grid.slice(3, 12);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Best Focus Times 🔥</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.heatmapContainer}>
          {/* Grid with labels */}
          <View style={styles.gridRow}>
            {/* Hour labels column */}
            <View style={styles.hourLabelsColumn}>
              <View style={styles.cornerSpace} />
              {mobileHours.map((hour, index) => {
                // Show labels for every 3 hours
                const showLabel = index % 3 === 0 || index === mobileHours.length - 1;
                return (
                  <View key={hour} style={styles.hourLabelContainer}>
                    {showLabel && (
                      <Text style={styles.hourLabel}>{hour}</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Grid cells */}
            <View style={styles.gridContent}>
              {/* Day labels row */}
              <View style={styles.dayLabelsRow}>
                {days.map((day) => (
                  <View key={day} style={styles.dayLabelContainer}>
                    <Text style={styles.dayLabel}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Heatmap cells */}
              {mobileGrid.map((row, hourIndex) => (
                <View key={hourIndex} style={styles.cellRow}>
                  {row.map((value, dayIndex) => (
                    <View key={dayIndex} style={styles.cellContainer}>
                      <HeatmapCell
                        value={value}
                        maxValue={maxValue}
                        hour={mobileHours[hourIndex]}
                        day={days[dayIndex]}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Peak time display */}
      {peakTime && (
        <View style={styles.peakTimeContainer}>
          <Text style={styles.peakTimeText}>
            ⭐ Peak: {peakTime.hour} on {peakTime.day} ({peakTime.value.toFixed(1)}h)
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={styles.legendGradient}>
          <View style={[styles.legendBox, { backgroundColor: '#F1F5F9' }]} />
          <View style={[styles.legendBox, { backgroundColor: '#FEF9C3' }]} />
          <View style={[styles.legendBox, { backgroundColor: '#FDE047' }]} />
          <View style={[styles.legendBox, { backgroundColor: '#FACC15' }]} />
          <View style={[styles.legendBox, { backgroundColor: '#EAB308' }]} />
        </View>
        <Text style={styles.legendLabel}>More</Text>
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
  chartSkeleton: {
    marginTop: SPACING.md,
  },
  emptyState: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  heatmapContainer: {
    marginTop: SPACING.sm,
  },
  gridRow: {
    flexDirection: 'row',
  },
  hourLabelsColumn: {
    marginRight: SPACING.sm,
  },
  cornerSpace: {
    height: 24,
    marginBottom: SPACING.xs,
  },
  hourLabelContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    minWidth: 50,
  },
  hourLabel: {
    fontSize: 10,
    color: COLORS.text.muted,
    textAlign: 'right',
  },
  gridContent: {
    flex: 1,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  dayLabelContainer: {
    width: 32,
    marginRight: SPACING.xs,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  cellRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  cellContainer: {
    marginRight: SPACING.xs,
  },
  peakTimeContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.card,
  },
  peakTimeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  legendLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 4,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});
