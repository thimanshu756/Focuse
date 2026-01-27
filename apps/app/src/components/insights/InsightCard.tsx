import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Skeleton } from '@/components/ui/Skeleton';

interface InsightCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    isLoading?: boolean;
}

export function InsightCard({
    label,
    value,
    icon,
    color,
    isLoading = false,
}: InsightCardProps) {
    if (isLoading) {
        return (
            <Card style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.background.card }]}>
                    <Skeleton width={24} height={24} style={{ borderRadius: 12 }} />
                </View>
                <View style={styles.content}>
                    <Skeleton width={60} height={24} style={{ marginBottom: 4 }} />
                    <Skeleton width={40} height={16} />
                </View>
            </Card>
        );
    }

    return (
        <Card style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.content}>
                <Text style={styles.value} numberOfLines={1}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    value: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: 2,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },
});
