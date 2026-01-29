import React from 'react';
import { View, StyleSheet } from 'react-native';
import { InsightCard } from '@/components/insights/InsightCard';
import { ForestStats as ForestStatsType } from '@/hooks/useForestData';
import { COLORS, SPACING } from '@/constants/theme';

interface ForestStatsProps {
    stats: ForestStatsType;
    isLoading?: boolean;
}

export function ForestStats({ stats, isLoading }: ForestStatsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <InsightCard
                    label="Trees Grown"
                    value={stats.totalTrees}
                    icon="leaf"
                    color={COLORS.success}
                    isLoading={isLoading}
                />
                <InsightCard
                    label="Day Streak"
                    value={stats.currentStreak}
                    icon="flame"
                    color={COLORS.error}
                    isLoading={isLoading}
                />
            </View>
           
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    fullWidth: {
        width: '100%',
    },
});
