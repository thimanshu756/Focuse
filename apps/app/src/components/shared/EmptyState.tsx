import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {actionLabel && onAction && (
                <View style={styles.actionContainer}>
                    <Button title={actionLabel} onPress={onAction} variant="primary" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        marginTop: SPACING.lg,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl,
    },
    description: {
        color: COLORS.text.secondary,
        fontSize: FONT_SIZES.sm,
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
    icon: {
        fontSize: 48,
        marginBottom: SPACING.lg,
    },
    title: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
    },
});
