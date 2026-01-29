import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    ScrollView,
    Pressable,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Task } from '@/types/api.types';

export interface TaskFormData {
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: Date;
    estimatedMinutes?: number;
}

interface TaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<any>;
    task?: Task | null;
    isLoading?: boolean;
}

const PRIORITY_OPTIONS = [
    { value: 'LOW', label: 'Low', color: '#6B7280' },
    { value: 'MEDIUM', label: 'Medium', color: '#3B82F6' },
    { value: 'HIGH', label: 'High', color: '#F59E0B' },
    { value: 'URGENT', label: 'Urgent', color: '#EF4444' },
];

export function TaskModal({
    visible,
    onClose,
    onSubmit,
    task,
    isLoading = false,
}: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
    const [dueDateStr, setDueDateStr] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens or task changes
    useEffect(() => {
        if (visible) {
            if (task) {
                setTitle(task.title || '');
                setDescription(task.description || '');
                setPriority(task.priority);
                // Format date as YYYY-MM-DD for input
                if (task.dueDate) {
                    try {
                        const date = new Date(task.dueDate);
                        setDueDateStr(date.toISOString().split('T')[0]);
                    } catch {
                        setDueDateStr('');
                    }
                } else {
                    setDueDateStr('');
                }
                setEstimatedMinutes(task.estimatedMinutes?.toString() || '');
            } else {
                // Reset to defaults for new task
                setTitle('');
                setDescription('');
                setPriority('MEDIUM');
                setDueDateStr('');
                setEstimatedMinutes('');
            }
            setErrors({});
        }
    }, [visible, task]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (title.length > 200) {
            newErrors.title = 'Title too long (max 200 characters)';
        }

        if (description && description.length > 1000) {
            newErrors.description = 'Description too long (max 1000 characters)';
        }

        if (estimatedMinutes) {
            const minutes = parseInt(estimatedMinutes);
            if (isNaN(minutes) || minutes < 5 || minutes > 480) {
                newErrors.estimatedMinutes = 'Must be between 5 and 480 minutes';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const formData: TaskFormData = {
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            dueDate: dueDateStr ? new Date(`${dueDateStr}T23:59:59`) : undefined,
            estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        };

        await onSubmit(formData);
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Card style={styles.card}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>
                                {task ? 'Edit Task' : 'New Task'}
                            </Text>
                            <Pressable onPress={handleClose} disabled={isLoading}>
                                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Title */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Title *</Text>
                                <TextInput
                                    style={[styles.input, errors.title ? styles.inputError : null]}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Enter task title"
                                    placeholderTextColor={COLORS.text.muted}
                                    editable={!isLoading}
                                />
                                {errors.title && (
                                    <Text style={styles.errorText}>{errors.title}</Text>
                                )}
                            </View>

                            {/* Description */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.textArea, errors.description ? styles.inputError : null]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Add description (optional)"
                                    placeholderTextColor={COLORS.text.muted}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    editable={!isLoading}
                                />
                                {errors.description && (
                                    <Text style={styles.errorText}>{errors.description}</Text>
                                )}
                            </View>

                            {/* Priority */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Priority</Text>
                                <View style={styles.priorityContainer}>
                                    {PRIORITY_OPTIONS.map((option) => (
                                        <Pressable
                                            key={option.value}
                                            onPress={() => setPriority(option.value as any)}
                                            style={[
                                                styles.priorityButton,
                                                priority === option.value && styles.priorityButtonActive,
                                                { borderColor: option.color },
                                                priority === option.value && { backgroundColor: `${option.color}20` },
                                            ]}
                                            disabled={isLoading}
                                        >
                                            <Text
                                                style={[
                                                    styles.priorityText,
                                                    priority === option.value && { color: option.color, fontWeight: '600' },
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Due Date */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Due Date (optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={dueDateStr}
                                    onChangeText={setDueDateStr}
                                    placeholder="YYYY-MM-DD (e.g., 2026-01-31)"
                                    placeholderTextColor={COLORS.text.muted}
                                    editable={!isLoading}
                                />
                                <Text style={styles.helperText}>
                                    Enter date in format: YYYY-MM-DD
                                </Text>
                            </View>

                            {/* Estimated Time */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Estimated Time (minutes)</Text>
                                <TextInput
                                    style={[styles.input, errors.estimatedMinutes ? styles.inputError : null]}
                                    value={estimatedMinutes}
                                    onChangeText={setEstimatedMinutes}
                                    placeholder="e.g., 60"
                                    placeholderTextColor={COLORS.text.muted}
                                    keyboardType="number-pad"
                                    editable={!isLoading}
                                />
                                {errors.estimatedMinutes && (
                                    <Text style={styles.errorText}>{errors.estimatedMinutes}</Text>
                                )}
                            </View>

                            {/* Bottom padding for scroll */}
                            <View style={{ height: SPACING.xxl }} />
                        </ScrollView>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Button
                                title="Cancel"
                                variant="ghost"
                                size="lg"
                                onPress={handleClose}
                                disabled={isLoading}
                                style={styles.actionButton}
                            />
                            <Button
                                title={task ? 'Update Task' : 'Create Task'}
                                variant="primary"
                                size="lg"
                                onPress={handleSubmit}
                                isLoading={isLoading}
                                style={styles.actionButton}
                            />
                        </View>
                    </Card>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        flex: 1,
    },
    actions: {
        borderTopColor: COLORS.text.muted,
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: SPACING.md,
        paddingTop: SPACING.lg,
    },
    card: {
        maxHeight: '90%',
        padding: SPACING.xl,
        width: '100%',
    },
    clearButton: {
        marginLeft: 'auto',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: SPACING.lg,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONT_SIZES.sm,
        marginTop: SPACING.xs,
    },
    fieldContainer: {
        marginBottom: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    headerTitle: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
    },
    helperText: {
        color: COLORS.text.muted,
        fontSize: FONT_SIZES.xs,
        marginTop: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.background.card,
        borderColor: COLORS.text.muted,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
        height: 48,
        paddingHorizontal: SPACING.lg,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    label: {
        color: COLORS.text.secondary,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        marginBottom: SPACING.sm,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
    },
    priorityButton: {
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        flex: 1,
        paddingVertical: SPACING.md,
    },
    priorityButtonActive: {
        borderWidth: 2,
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    priorityText: {
        color: COLORS.text.secondary,
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
    },
    scrollView: {
        maxHeight: '70%',
    },
    textArea: {
        backgroundColor: COLORS.background.card,
        borderColor: COLORS.text.muted,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
        minHeight: 100,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
});
