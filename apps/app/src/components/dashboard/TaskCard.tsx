import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { formatDistanceToNow } from '@/utils/date.utils';
import Ionicons from '@expo/vector-icons/Ionicons';

interface TaskCardProps {
    id: string;
    title: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: string;
    dueDate?: string | Date | null;
    onPress?: () => void;
    onStartSession?: (taskId: string) => void;
}

export function TaskCard({
    id,
    title,
    priority,
    status,
    dueDate,
    onPress,
    onStartSession,
}: TaskCardProps) {
    const priorityConfig = {
        URGENT: { icon: 'alert-circle' as const, color: '#EF4444', bg: '#FEE2E2' },
        HIGH: { icon: 'alert-circle' as const, color: '#F59E0B', bg: '#FEF3C7' },
        MEDIUM: { icon: 'document-text' as const, color: '#3B82F6', bg: '#DBEAFE' },
        LOW: { icon: 'document-text' as const, color: '#6B7280', bg: '#F3F4F6' },
    };

    const statusConfig: Record<string, { label: string; color: string }> = {
        COMPLETED: { label: 'Completed', color: COLORS.success },
        IN_PROGRESS: { label: 'In Progress', color: '#3B82F6' },
        TODO: {
            label: dueDate ? formatDistanceToNow(dueDate) : 'Pending',
            color: COLORS.text.secondary,
        },
    };

    const config = priorityConfig[priority] || priorityConfig.MEDIUM;
    const statusInfo = statusConfig[status] || statusConfig.TODO;

    return (
        <Card style={styles.card}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.content,
                    pressed && styles.pressed,
                ]}
            >
                <View style={styles.main}>
                    <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                        <Ionicons name={config.icon} size={18} color={config.color} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={1}>
                            {title}
                        </Text>
                        <Text style={[styles.status, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </View>
                </View>
                {onStartSession && status !== 'COMPLETED' && (
                    <Button
                        title="Start"
                        variant="ghost"
                        size="sm"
                        onPress={() => onStartSession(id)}
                    />
                )}
            </Pressable>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        marginBottom: SPACING.md,
        // padding: SPACING.lg,
    },
    content: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconContainer: {
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.sm,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },
    info: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    main: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
    },
    pressed: {
        opacity: 0.7,
    },
    status: {
        fontSize: FONT_SIZES.sm,
        marginTop: 2,
    },
    title: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
});
