import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    color: 'blue' | 'green' | 'red';
    isLoading?: boolean;
    onPress?: () => void;
}

export function StatCard({
    icon,
    label,
    value,
    color,
    isLoading = false,
    onPress,
}: StatCardProps) {
    const colorConfig = {
        blue: {
            bg: '#E9F0FF',
            text: '#3B82F6',
        },
        green: {
            bg: '#E6FFE8',
            text: '#22C55E',
        },
        red: {
            bg: '#FEE2E2',
            text: '#EF4444',
        },
    };

    const config = colorConfig[color];

    if (isLoading) {
        return (
            <Card style={styles.card}>
                <View style={styles.header}>
                    <Skeleton width={48} height={48} borderRadius={BORDER_RADIUS.md} />
                </View>
                <Skeleton width={80} height={32} style={styles.valueSkeleton} />
                <Skeleton width={80} height={16} />
            </Card>
        );
    }

    const content = (
        <>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                    <Ionicons name={icon} size={24} color={config.text} />
                </View>
            </View>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.pressable,
                    pressed && styles.pressed,
                ]}
            >
                <Card style={styles.card}>{content}</Card>
            </Pressable>
        );
    }

    return <Card style={styles.card}>{content}</Card>;
}

const styles = StyleSheet.create({
    card: {
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.md,
    },
    iconContainer: {
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
        height: 48,
        justifyContent: 'center',
        width: 48,
    },
    label: {
        color: COLORS.text.secondary,
        fontSize: FONT_SIZES.sm,
    },
    pressable: {
        flex: 1,
    },
    pressed: {
        opacity: 0.7,
    },
    value: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.xxl,
        fontWeight: '600',
        letterSpacing: -0.5,
        marginBottom: SPACING.xs,
    },
    valueSkeleton: {
        marginBottom: SPACING.sm,
    },
});
