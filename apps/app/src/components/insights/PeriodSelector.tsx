import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { InsightPeriod } from '@/hooks/useInsightsData';

interface PeriodSelectorProps {
    value: InsightPeriod;
    onChange: (period: InsightPeriod) => void;
}

const PERIODS: { label: string; value: InsightPeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
    { label: 'All', value: 'all' },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {PERIODS.map((period) => (
                    <Pressable
                        key={period.value}
                        style={[
                            styles.item,
                            value === period.value && styles.activeItem,
                        ]}
                        onPress={() => onChange(period.value)}
                    >
                        <Text
                            style={[
                                styles.text,
                                value === period.value && styles.activeText,
                            ]}
                        >
                            {period.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    content: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.sm,
    },
    item: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.pill,
        backgroundColor: COLORS.background.card,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeItem: {
        backgroundColor: COLORS.text.primary,
    },
    text: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
    activeText: {
        color: COLORS.text.white,
    },
});
