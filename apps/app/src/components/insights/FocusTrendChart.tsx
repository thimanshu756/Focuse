import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { format } from 'date-fns';

interface ChartDataPoint {
    date: string;
    focusTime: number; // in seconds
}

interface FocusTrendChartProps {
    data: ChartDataPoint[];
    period: string;
    isLoading?: boolean;
}

const screenWidth = Dimensions.get('window').width;

export function FocusTrendChart({ data, period, isLoading = false }: FocusTrendChartProps) {
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

    const hasData = data.some((d) => d.focusTime > 0);
    const chartWidth = screenWidth - (SPACING.xl * 2) - (SPACING.lg * 2); // Screen - Page Padding - Card Padding

    // Transform data for chart
    const chartData = data.map((d) => {
        const date = new Date(d.date);
        let label = '';
        if (period === 'today') {
            label = format(date, 'HH:mm');
        } else if (period === 'week') {
            label = format(date, 'EEE');
        } else if (period === 'month') {
            label = format(date, 'd');
        } else if (period === 'year') {
            label = format(date, 'MMM');
        } else {
            label = format(date, 'MM/dd');
        }

        const hours = Number((d.focusTime / 3600).toFixed(1));

        return {
            value: hours,
            label,
            frontColor: COLORS.primary.accent,
            spacing: period === 'month' ? 4 : 14,
            labelTextStyle: { color: COLORS.text.secondary, fontSize: 10 },
        };
    });

    // Ensure we have at least some dummy max value if empty
    const maxHours = Math.max(...chartData.map((d) => d.value), 1);
    const maxValue = Math.ceil(maxHours * 1.2);

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Focus Trend (Hours)</Text>
            </View>

            {hasData ? (
                <View style={styles.chartContainer}>
                    <BarChart
                        data={chartData}
                        barWidth={period === 'month' ? 8 : 24}
                        spacing={period === 'month' ? 8 : 24}
                        roundedTop
                        roundedBottom={false}
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: COLORS.text.muted, fontSize: 10 }}
                        noOfSections={4}
                        maxValue={maxValue}
                        height={200}
                        width={chartWidth}
                        initialSpacing={10}
                        isAnimated
                        key={period} // Force re-render on period change
                    />
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No data available for this period</Text>
                </View>
            )}
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
    headerText: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    chartSkeleton: {
        marginTop: SPACING.md,
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: SPACING.sm,
        overflow: 'hidden',
    },
    emptyContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.text.muted,
        fontSize: FONT_SIZES.sm,
    },
});
