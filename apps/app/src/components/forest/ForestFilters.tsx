import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '@/constants/theme';
import { DateFilterOption } from '@/hooks/useForestData';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FilterChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
}

const FilterChip = React.memo(({ label, isActive, onPress }: FilterChipProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    return (
        <AnimatedPressable
            style={[
                styles.chip,
                isActive && styles.activeChip,
                animatedStyle,
            ]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Text style={[
                styles.chipText,
                isActive && styles.activeChipText
            ]}>
                {label}
            </Text>
        </AnimatedPressable>
    );
});

export function ForestFilters({ dateFilter, onDateFilterChange }: ForestFiltersProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {DATE_OPTIONS.map((option) => (
                    <FilterChip
                        key={option.value}
                        label={option.label}
                        isActive={dateFilter === option.value}
                        onPress={() => onDateFilterChange(option.value)}
                    />
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
