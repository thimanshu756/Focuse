import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { format } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Task } from '@/types/api.types';

interface TaskCardProps {
    task: Task;
    onPress?: (task: Task) => void;
    onStartSession?: (task: Task) => void;
    onComplete?: (taskId: string) => void;
    onDelete?: (task: Task) => void;
}

export function TaskCard({
    task,
    onPress,
    onStartSession,
    onComplete,
    onDelete,
}: TaskCardProps) {
    const priorityConfig = {
        URGENT: { icon: 'alert-circle' as const, color: '#EF4444', bg: '#FEE2E2' },
        HIGH: { icon: 'alert-circle' as const, color: '#F59E0B', bg: '#FEF3C7' },
        MEDIUM: { icon: 'document-text' as const, color: '#3B82F6', bg: '#DBEAFE' },
        LOW: { icon: 'document-text' as const, color: '#6B7280', bg: '#F3F4F6' },
    };

    const config = priorityConfig[task.priority] || priorityConfig.MEDIUM;
    const isCompleted = task.status === 'COMPLETED';

    const getDueDateLabel = () => {
        if (!task.dueDate) return null;
        try {
            return format(new Date(task.dueDate), 'MMM d, yyyy');
        } catch {
            return null;
        }
    };

    const dueDateLabel = getDueDateLabel();

    return (
        <Card style={[styles.card, isCompleted && styles.completedCard]}>
            <Pressable
                onPress={() => onPress?.(task)}
                style={({ pressed }) => [
                    styles.content,
                    pressed && styles.pressed,
                ]}
            >
                <View style={styles.main}>
                    <Pressable
                        style={[styles.iconContainer, { backgroundColor: config.bg }]}
                        onPress={() => onComplete?.(task.id)}
                    >
                        {isCompleted ? (
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                        ) : (
                            <Ionicons name={config.icon} size={18} color={config.color} />
                        )}
                    </Pressable>
                    <View style={styles.info}>
                        <Text style={[styles.title, isCompleted && styles.completedText]} numberOfLines={1}>
                            {task.title}
                        </Text>
                        <View style={styles.metaContainer}>
                            {dueDateLabel && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="calendar-outline" size={12} color={COLORS.text.secondary} />
                                    <Text style={styles.metaText}>{dueDateLabel}</Text>
                                </View>
                            )}
                            {task.estimatedMinutes && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={12} color={COLORS.text.secondary} />
                                    <Text style={styles.metaText}>{task.estimatedMinutes}m</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <View style={styles.actions}>
                    {onStartSession && !isCompleted && (
                        <Button
                            title="Start"
                            variant="ghost"
                            size="sm"
                            onPress={() => onStartSession(task)}
                        />
                    )}
                    {onDelete && (
                        <Pressable
                            onPress={() => onDelete(task)}
                            style={({ pressed }) => [
                                styles.deleteButton,
                                pressed && styles.pressed
                            ]}
                            hitSlop={8}
                        >
                            <Ionicons name="trash-outline" size={20} color={COLORS.text.muted} />
                        </Pressable>
                    )}
                </View>
            </Pressable>
        </Card>
    );
}

const styles = StyleSheet.create({
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    deleteButton: {
        padding: SPACING.sm,
    },
    card: {
        width: '100%',
        marginBottom: SPACING.md,
    },
    completedCard: {
        opacity: 0.7,
    },
    content: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.md,
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
    title: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginBottom: 4,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: COLORS.text.secondary,
    },
    metaContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    metaText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
    },
});
