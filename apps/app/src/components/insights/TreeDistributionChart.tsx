import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Session } from '@/types/session.types';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

interface TreeDistributionChartProps {
  sessions: Session[];
  isLoading?: boolean;
}

interface TreeData {
  name: string;
  count: number;
  percentage: number;
  color: string;
  icon: string;
  label: string;
}

export function TreeDistributionChart({
  sessions,
  isLoading = false,
}: TreeDistributionChartProps) {
  const treeData = useMemo((): TreeData[] => {
    if (!sessions.length) {
      return [
        { name: 'Basic', count: 0, percentage: 0, color: '#86EFAC', icon: '🌱', label: '≤15 min' },
        { name: 'Premium', count: 0, percentage: 0, color: '#22C55E', icon: '🌳', label: '16-45 min' },
        { name: 'Elite', count: 0, percentage: 0, color: '#15803D', icon: '🏆', label: '>45 min' },
      ];
    }

    const basic = sessions.filter((s) => s.duration <= 900).length; // ≤15 min
    const premium = sessions.filter((s) => s.duration > 900 && s.duration <= 2700).length; // 16-45 min
    const elite = sessions.filter((s) => s.duration > 2700).length; // >45 min

    const total = sessions.length;

    return [
      {
        name: 'Basic',
        count: basic,
        percentage: total > 0 ? Math.round((basic / total) * 100) : 0,
        color: '#86EFAC',
        icon: '🌱',
        label: '≤15 min',
      },
      {
        name: 'Premium',
        count: premium,
        percentage: total > 0 ? Math.round((premium / total) * 100) : 0,
        color: '#22C55E',
        icon: '🌳',
        label: '16-45 min',
      },
      {
        name: 'Elite',
        count: elite,
        percentage: total > 0 ? Math.round((elite / total) * 100) : 0,
        color: '#15803D',
        icon: '🏆',
        label: '>45 min',
      },
    ];
  }, [sessions]);

  const chartData = useMemo(() => {
    return treeData
      .filter((item) => item.count > 0)
      .map((item) => ({
        value: item.count,
        color: item.color,
        text: `${item.percentage}%`,
      }));
  }, [treeData]);

  const totalSessions = sessions.length;

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Skeleton width={180} height={20} />
        </View>
        <Skeleton width="100%" height={250} style={styles.chartSkeleton} />
      </Card>
    );
  }

  if (totalSessions === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Tree Distribution 🌳</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Complete sessions to see your tree distribution
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Tree Distribution 🌳</Text>
        <Text style={styles.subtitle}>By session duration</Text>
      </View>

      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            donut
            innerRadius={60}
            radius={90}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.centerValue}>{totalSessions}</Text>
                <Text style={styles.centerText}>Total Trees</Text>
              </View>
            )}
            showText
            textColor={COLORS.text.primary}
            textSize={12}
            fontWeight="600"
          />
        ) : (
          <View style={styles.noDataCircle}>
            <Text style={styles.centerValue}>{totalSessions}</Text>
            <Text style={styles.centerText}>Total Trees</Text>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {treeData.map((item) => (
          <View key={item.name} style={styles.legendItem}>
            <View style={styles.legendLeft}>
              <Text style={styles.legendIcon}>{item.icon}</Text>
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendName}>{item.name}</Text>
                <Text style={styles.legendLabel}>{item.label}</Text>
              </View>
            </View>
            <View style={styles.legendRight}>
              <Text style={styles.legendCount}>{item.count}</Text>
              <Text style={styles.legendPercentage}>({item.percentage}%)</Text>
            </View>
          </View>
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
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  centerText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  noDataCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  legendLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  legendPercentage: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});
