import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    Alert,
    Modal,
    FlatList,
    TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { api } from '@/services/api.service';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Task {
    id: string;
    title: string;
}

interface ActiveSessionData {
    id: string;
    taskTitle?: string;
    duration: number;
    timeElapsed: number;
}

interface QuickStartSessionProps {
    tasks: Task[];
    activeSession?: ActiveSessionData | null;
}

const DURATIONS = [15, 25, 50];

export function QuickStartSession({ tasks, activeSession }: QuickStartSessionProps) {
    const router = useRouter();
    const [selectedTask, setSelectedTask] = useState<string>('');
    const [selectedDuration, setSelectedDuration] = useState<number | null>(25);
    const [customDuration, setCustomDuration] = useState<string>('');
    const [isStarting, setIsStarting] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    // If active session exists with valid ID, show resume card
    if (activeSession && activeSession.id) {
        const remainingSeconds = activeSession.duration - activeSession.timeElapsed;
        const remainingMinutes = Math.floor(remainingSeconds / 60);
        const remainingSecs = remainingSeconds % 60;

        return (
            <Card style={styles.card}>
                <View style={styles.iconHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="play" size={24} color="#F59E0B" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Session in Progress</Text>
                        <Text style={styles.headerSubtitle}>
                            {activeSession.taskTitle || 'Focus Session'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.timeRemaining}>
                    {remainingMinutes}:{remainingSecs.toString().padStart(2, '0')} remaining
                </Text>

                <Button
                    title="Resume Session →"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={() => router.push('/session' as any)}
                />
            </Card>
        );
    }

    const handleStartSession = async () => {
        const duration = selectedDuration || parseInt(customDuration);

        if (!duration || duration < 5 || duration > 240) {
            Alert.alert('Invalid Duration', 'Duration must be between 5 and 240 minutes');
            return;
        }

        setIsStarting(true);

        try {
            const response = await api.post('/sessions', {
                ...(selectedTask ? { taskId: selectedTask } : {}),
                duration,
            });

            if (response.data.success && response.data.data?.session) {
                router.push(`/session?sessionId=${response.data.data.session.id}` as any);
            }
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.error?.message ||
                error.response?.data?.message ||
                'Failed to start session'
            );
        } finally {
            setIsStarting(false);
        }
    };

    const selectedTaskTitle = tasks.find(t => t.id === selectedTask)?.title || 'Select a task...';

    return (
        <Card style={styles.card}>
            <View style={styles.iconHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="time-outline" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.headerTitle}>Quick Start Focus Session</Text>
            </View>

            {/* Task Selection */}
            <View style={styles.section}>
                <Text style={styles.label}>Select task (optional)</Text>
                <Pressable
                    style={styles.selector}
                    onPress={() => setShowPicker(true)}
                >
                    <Text style={[
                        styles.selectorText,
                        !selectedTask && styles.selectorPlaceholder
                    ]}>
                        {selectedTask ? selectedTaskTitle : 'Choose a task...'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
                </Pressable>
                {selectedTask ? (
                    <Pressable
                        style={styles.clearButton}
                        onPress={() => setSelectedTask('')}
                    >
                        <Text style={styles.clearButtonText}>Clear selection</Text>
                    </Pressable>
                ) : null}
            </View>

            {/* Duration Selection */}
            <View style={styles.section}>
                <Text style={styles.label}>Duration</Text>
                <View style={styles.durationRow}>
                    {DURATIONS.map((duration) => (
                        <Pressable
                            key={duration}
                            onPress={() => {
                                setSelectedDuration(duration);
                                setCustomDuration('');
                            }}
                            style={({ pressed }) => [
                                styles.durationButton,
                                selectedDuration === duration && styles.durationButtonActive,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.durationButtonText,
                                    selectedDuration === duration && styles.durationButtonTextActive,
                                ]}
                            >
                                {duration}m
                            </Text>
                        </Pressable>
                    ))}
                    <Pressable
                        onPress={() => {
                            setSelectedDuration(null);
                        }}
                        style={({ pressed }) => [
                            styles.durationButton,
                            !selectedDuration && !!customDuration && styles.durationButtonActive,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text
                            style={[
                                styles.durationButtonText,
                                !selectedDuration && !!customDuration && styles.durationButtonTextActive,
                            ]}
                        >
                            Custom
                        </Text>
                    </Pressable>
                </View>

                {(!selectedDuration || customDuration) && (
                    <TextInput
                        style={styles.customInput}
                        placeholder="Enter minutes (5-240)"
                        placeholderTextColor={COLORS.text.muted}
                        keyboardType="number-pad"
                        value={customDuration}
                        onChangeText={(text) => {
                            setCustomDuration(text);
                            setSelectedDuration(null);
                        }}
                    />
                )}
            </View>

            {/* Start Button */}
            <Button
                title={isStarting ? 'Starting...' : 'Start Focus Session 🌱'}
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleStartSession}
                isLoading={isStarting}
                disabled={!selectedDuration && !customDuration}
            />

            {/* Task Picker Modal */}
            <Modal
                visible={showPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Task</Text>
                            <Pressable onPress={() => setShowPicker(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={COLORS.text.primary} />
                            </Pressable>
                        </View>

                        <FlatList
                            data={[
                                { id: '', title: 'No task' },
                                ...tasks
                            ]}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        selectedTask === item.id && styles.optionItemSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedTask(item.id);
                                        setShowPicker(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedTask === item.id && styles.optionTextSelected
                                    ]}>
                                        {item.title}
                                    </Text>
                                    {selectedTask === item.id && (
                                        <Ionicons name="checkmark" size={20} color={COLORS.primary.accent} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                </View>
            </Modal>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: SPACING.lg,
    },
    clearButton: {
        marginTop: SPACING.xs,
    },
    clearButtonText: {
        color: COLORS.text.muted,
        fontSize: FONT_SIZES.xs,
    },
    closeButton: {
        padding: 4,
    },
    customInput: {
        backgroundColor: COLORS.background.card,
        borderColor: COLORS.text.muted,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
        height: 48,
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.lg,
    },
    durationButton: {
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: BORDER_RADIUS.sm,
        flex: 1,
        justifyContent: 'center',
        marginRight: SPACING.sm,
        paddingVertical: SPACING.md,
    },
    durationButtonActive: {
        backgroundColor: COLORS.primary.accent,
    },
    durationButtonText: {
        color: COLORS.text.secondary,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    durationButtonTextActive: {
        color: COLORS.text.primary,
    },
    durationRow: {
        flexDirection: 'row',
        marginTop: SPACING.sm,
    },
    headerSubtitle: {
        color: COLORS.text.secondary,
        fontSize: FONT_SIZES.sm,
    },
    headerTextContainer: {
        marginLeft: SPACING.md,
    },
    headerTitle: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
    },
    helperText: {
        color: COLORS.text.muted,
        fontSize: FONT_SIZES.xs,
        marginTop: 2,
    },
    iconContainer: {
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
        height: 48,
        justifyContent: 'center',
        width: 48,
    },
    iconHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: SPACING.lg,
    },
    label: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        maxHeight: '80%',
        paddingBottom: SPACING.xl,
        width: '100%',
    },
    modalHeader: {
        alignItems: 'center',
        borderBottomColor: '#E2E8F0',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    modalOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalTitle: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
    },
    optionItem: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
    },
    optionItemSelected: {
        backgroundColor: COLORS.background.card,
    },
    optionText: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
    },
    optionTextSelected: {
        color: COLORS.primary.accent,
        fontWeight: '600',
    },
    pressed: {
        opacity: 0.7,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    selector: {
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderColor: '#E2E8F0',
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        flexDirection: 'row',
        height: 48,
        justifyContent: 'space-between',
        marginTop: SPACING.xs,
        paddingHorizontal: SPACING.md,
    },
    selectorPlaceholder: {
        color: COLORS.text.muted,
    },
    selectorText: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
    },
    separator: {
        backgroundColor: '#E2E8F0',
        height: 1,
        marginLeft: SPACING.lg,
    },
    timeRemaining: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.xxl,
        fontWeight: '600',
        marginBottom: SPACING.lg,
    },
});
