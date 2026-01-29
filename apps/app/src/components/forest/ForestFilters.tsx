import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { DateFilterOption, TreeTypeFilterOption } from '@/hooks/useForestData';

interface ForestFiltersProps {
    dateFilter: DateFilterOption;
    onDateFilterChange: (filter: DateFilterOption) => void;
}

const DATE_OPTIONS: { label: string; value: DateFilterOption }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'All Time', value: 'all' },
];

export function ForestFilters({ dateFilter, onDateFilterChange }: ForestFiltersProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {DATE_OPTIONS.map((option) => (
                    <Pressable
                        key={option.value}
                        style={[
                            styles.chip,
                            dateFilter === option.value && styles.activeChip,
                        ]}
                        onPress={() => onDateFilterChange(option.value)}
                    >
                        <Text style={[
                            styles.chipText,
                            dateFilter === option.value && styles.activeChipText
                        ]}>
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    content: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.sm,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.pill,
        backgroundColor: COLORS.background.card,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeChip: {
        backgroundColor: COLORS.primary.accent,
    },
    chipText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
    activeChipText: {
        color: COLORS.text.primary,
        fontWeight: '600',
    },
});
