import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

interface DailyData {
    day: string;
    hours: number;
    sessions: number;
}

interface WeeklyChartProps {
    data?: DailyData[];
    isLoading?: boolean;
}

const screenWidth = Dimensions.get('window').width;

export function WeeklyChart({ data, isLoading = false }: WeeklyChartProps) {
    // Show skeleton if loading or if data is not available yet
    if (isLoading || !data) {
        return (
            <Card style={styles.card}>
                <View style={styles.header}>
                    <Skeleton width={200} height={22} />
                </View>

                {/* Chart bars skeleton */}
                <View style={styles.chartContainer}>
                    <View style={styles.barsContainer}>
                        {[60, 80, 45, 90, 70, 55, 65].map((height, index) => (
                            <View key={index} style={styles.barWrapper}>
                                <Skeleton
                                    width={24}
                                    height={height}
                                    borderRadius={4}
                                    style={styles.barSkeleton}
                                />
                                <Skeleton width={20} height={12} style={styles.barLabelSkeleton} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Legend skeleton */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <Skeleton width={8} height={8} borderRadius={4} />
                        <Skeleton width={90} height={14} style={styles.legendTextSkeleton} />
                    </View>
                </View>
            </Card>
        );
    }

    const hasData = data.some((d) => d.hours > 0 || d.sessions > 0);

    if (!hasData) {
        return (
            <Card style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>📊 This Week's Progress</Text>
                </View>
                <EmptyState
                    icon="🌱"
                    title="No sessions yet"
                    description="Start your first focus session to see your progress here!"
                />
            </Card>
        );
    }

    const maxHours = Math.max(...data.map((d) => d.hours), 1);
    const maxValue = Math.ceil(maxHours * 1.2); // Add some buffer

    const chartData = data.map(d => ({
        value: d.hours,
        label: d.day,
        frontColor: COLORS.primary.accent,
        spacing: 14,
        labelTextStyle: { color: COLORS.text.secondary, fontSize: 12 },
    }));

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.headerText}>📊 This Week's Progress</Text>
            </View>

            <View style={styles.chartContainer}>
                <BarChart
                    data={chartData}
                    barWidth={24}
                    spacing={24}
                    roundedTop
                    roundedBottom={false}
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: COLORS.text.muted, fontSize: 10 }}
                    noOfSections={4}
                    maxValue={maxValue || 4}
                    height={200}
                    width={screenWidth - 80}
                    isAnimated
                />
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.primary.accent }]} />
                    <Text style={styles.legendText}>Focus Hours</Text>
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: SPACING.lg,
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: SPACING.md,
        // Gifted charts have some internal padding/margin quirks, usually require overflow visible if too tight
        overflow: 'hidden',
    },
    chartSkeleton: {
        marginTop: SPACING.lg,
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 200,
        gap: 24,
        paddingHorizontal: SPACING.md,
    },
    barWrapper: {
        alignItems: 'center',
        gap: SPACING.xs,
    },
    barSkeleton: {
        marginBottom: SPACING.xs,
    },
    barLabelSkeleton: {
        marginTop: 4,
    },
    legendTextSkeleton: {
        marginLeft: SPACING.xs,
    },
    header: {
        marginBottom: SPACING.sm,
    },
    headerText: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
    },
    legend: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    legendDot: {
        borderRadius: 4,
        height: 8,
        marginRight: SPACING.xs,
        width: 8,
    },
    legendItem: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    legendText: {
        color: COLORS.text.secondary,
        fontSize: FONT_SIZES.sm,
    },
});
