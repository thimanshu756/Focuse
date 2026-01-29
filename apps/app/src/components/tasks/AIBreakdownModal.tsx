import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Alert,
    Animated,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { aiApi, api } from '@/services/api.service';
import Ionicons from '@expo/vector-icons/Ionicons';

interface GeneratedTask {
    title: string;
    estimatedMinutes: number;
    description?: string;
}

interface AIBreakdownModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isPro: boolean;
}

const GENERATION_STAGES = [
    { text: 'CHITRA is analyzing your goal...', duration: 1500 },
    { text: 'CHITRA is planning the workflow...', duration: 1500 },
    { text: 'CHITRA is creating smart tasks...', duration: 1500 },
    { text: 'CHITRA is optimizing your plan...', duration: 1000 },
];

export function AIBreakdownModal({
    visible,
    onClose,
    onSuccess,
    isPro,
}: AIBreakdownModalProps) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isCreating, setIsCreating] = useState(false);
    const [currentStage, setCurrentStage] = useState(0);

    // Animation for button width
    const buttonWidth = React.useRef(new Animated.Value(0)).current;

    // Cycle through stages during generation
    useEffect(() => {
        if (!isGenerating) {
            setCurrentStage(0);
            return;
        }

        const timer = setInterval(() => {
            setCurrentStage((prev) => (prev + 1) % GENERATION_STAGES.length);
        }, GENERATION_STAGES[currentStage].duration);

        return () => clearInterval(timer);
    }, [isGenerating, currentStage]);

    // Animate button width when generation state changes
    useEffect(() => {
        Animated.timing(buttonWidth, {
            toValue: isGenerating ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isGenerating]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        if (!isPro) {
            Alert.alert(
                'PRO Feature',
                'AI breakdown is a PRO feature. Upgrade to unlock!',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsGenerating(true);
        setCurrentStage(0);

        try {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 7); // Default 7 days

            const response = await aiApi.post('/tasks/ai-breakdown', {
                prompt: prompt.trim(),
                priority: 'MEDIUM',
                deadline: deadline.toISOString(),
            });

            if (response.data.success && response.data.data?.tasks) {
                const tasks = response.data.data.tasks;
                setGeneratedTasks(tasks);
                // Select all tasks by default
                setSelectedIndices(new Set(tasks.map((_: any, index: number) => index)));
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.error?.message ||
                error.response?.data?.message ||
                'Failed to generate task breakdown';
            Alert.alert('Error', errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateAll = async () => {
        if (generatedTasks.length === 0 || selectedIndices.size === 0) {
            Alert.alert('Error', 'Please select at least one task to create');
            return;
        }

        setIsCreating(true);
        try {
            // Get selected tasks
            const selectedTasks = generatedTasks
                .filter((_, index) => selectedIndices.has(index))
                .map((task) => ({
                    title: task.title,
                    description: task.description,
                    priority: 'MEDIUM' as const,
                    estimatedMinutes: task.estimatedMinutes,
                }));

            // Bulk create selected tasks
            const response = await api.post('/tasks/bulk-create', {
                tasks: selectedTasks,
            });

            if (response.data.success) {
                Alert.alert(
                    'Success',
                    `${response.data.data.createdCount} task(s) created! 🎉`,
                    [{
                        text: 'OK', onPress: () => {
                            onSuccess();
                            handleClose();
                        }
                    }]
                );
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.error?.message ||
                error.response?.data?.message ||
                'Failed to create tasks. Please try again.';
            Alert.alert('Error', errorMsg);
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setPrompt('');
        setGeneratedTasks([]);
        setSelectedIndices(new Set());
        onClose();
    };

    const toggleTask = (index: number) => {
        const newSelected = new Set(selectedIndices);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedIndices(newSelected);
    };

    const toggleAll = () => {
        if (selectedIndices.size === generatedTasks.length) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(generatedTasks.map((_, i) => i)));
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Ionicons name="sparkles" size={20} color={COLORS.primary.accent} />
                            <Text style={styles.headerTitle}>
                                {generatedTasks.length > 0
                                    ? 'Chitra-Generated Task Plan'
                                    : 'Create with Chitra'}
                            </Text>
                            {isPro && (
                                <View style={styles.proBadge}>
                                    <Text style={styles.proText}>PRO</Text>
                                </View>
                            )}
                        </View>
                        <Pressable onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.text.secondary} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {generatedTasks.length === 0 ? (
                            // Input Phase
                            <View style={styles.inputPhase}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Describe your goal</Text>
                                    <TextInput
                                        style={styles.textarea}
                                        value={prompt}
                                        onChangeText={setPrompt}
                                        placeholder="E.g., Study for DBMS exam in 3 days"
                                        placeholderTextColor={COLORS.text.muted}
                                        multiline
                                        numberOfLines={4}
                                        maxLength={200}
                                        editable={!isGenerating}
                                    />
                                    <Text style={styles.charCount}>{prompt.length}/200</Text>
                                </View>

                                {!isPro && (
                                    <View style={styles.proWarning}>
                                        <Text style={styles.proWarningText}>
                                            ✨ AI breakdown is a PRO feature. Upgrade to unlock smart task planning!
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.buttonRow}>
                                    <Animated.View
                                        style={{
                                            flex: buttonWidth.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 0],
                                            }),
                                            opacity: buttonWidth.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 0],
                                            }),
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Button
                                            title="Cancel"
                                            variant="ghost"
                                            onPress={handleClose}
                                            disabled={isGenerating}
                                            style={styles.actionButton}
                                        />
                                    </Animated.View>

                                    <Animated.View
                                        style={{
                                            flex: buttonWidth.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 2],
                                            }),
                                        }}
                                    >
                                        <Pressable
                                            onPress={handleGenerate}
                                            disabled={!prompt.trim() || isGenerating || !isPro}
                                            style={[
                                                styles.generateButton,
                                                (!prompt.trim() || isGenerating || !isPro) && styles.generateButtonDisabled,
                                            ]}
                                        >
                                            {isGenerating ? (
                                                <View style={styles.generatingContent}>
                                                    <ActivityIndicator
                                                        size="small"
                                                        color={COLORS.text.primary}
                                                        style={styles.spinner}
                                                    />
                                                    <Animated.View
                                                        style={[
                                                            styles.generatingTextContainer,
                                                            {
                                                                opacity: buttonWidth,
                                                            }
                                                        ]}
                                                    >
                                                        <Text style={styles.generatingText}>
                                                            {GENERATION_STAGES[currentStage].text}
                                                        </Text>
                                                    </Animated.View>
                                                </View>
                                            ) : (
                                                <View style={styles.generateButtonContent}>
                                                    <Ionicons name="sparkles" size={16} color={COLORS.text.primary} />
                                                    <Text style={styles.generateButtonText}>Ask Chitra</Text>
                                                </View>
                                            )}
                                        </Pressable>
                                    </Animated.View>
                                </View>
                            </View>
                        ) : (
                            // Preview Phase
                            <View style={styles.previewPhase}>
                                {/* Header with select all */}
                                <View style={styles.previewHeader}>
                                    <Text style={styles.previewHeaderTitle}>
                                        AI Generated Tasks ({generatedTasks.length})
                                    </Text>
                                    <Pressable onPress={toggleAll} style={styles.selectAllButton}>
                                        <Ionicons
                                            name={
                                                selectedIndices.size === generatedTasks.length
                                                    ? 'checkbox'
                                                    : 'square-outline'
                                            }
                                            size={18}
                                            color={COLORS.primary.accent}
                                        />
                                        <Text style={styles.selectAllText}>
                                            {selectedIndices.size === generatedTasks.length
                                                ? 'Deselect All'
                                                : 'Select All'}
                                        </Text>
                                    </Pressable>
                                </View>

                                {/* Task List */}
                                <View style={styles.taskList}>
                                    {generatedTasks.map((task, index) => (
                                        <Pressable
                                            key={index}
                                            onPress={() => toggleTask(index)}
                                            style={[
                                                styles.taskCard,
                                                selectedIndices.has(index) && styles.taskCardSelected,
                                            ]}
                                        >
                                            <Ionicons
                                                name={selectedIndices.has(index) ? 'checkbox' : 'square-outline'}
                                                size={24}
                                                color={
                                                    selectedIndices.has(index)
                                                        ? COLORS.primary.accent
                                                        : COLORS.text.muted
                                                }
                                                style={styles.taskCheckbox}
                                            />
                                            <View style={styles.taskContent}>
                                                <Text style={styles.taskTitle}>{task.title}</Text>
                                                {task.description && (
                                                    <Text style={styles.taskDescription} numberOfLines={2}>
                                                        {task.description}
                                                    </Text>
                                                )}
                                                <View style={styles.taskMeta}>
                                                    <View style={styles.metaBadge}>
                                                        <Text style={styles.metaText}>⏱️ {task.estimatedMinutes} min</Text>
                                                    </View>
                                                    <View style={styles.metaBadge}>
                                                        <Text style={styles.metaText}>
                                                            ~{Math.ceil(task.estimatedMinutes / 25)} sessions
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>

                                {/* Selected count info */}
                                <View style={styles.selectedInfo}>
                                    <Text style={styles.selectedInfoText}>
                                        {selectedIndices.size === 0 ? (
                                            'No tasks selected'
                                        ) : (
                                            <>
                                                <Text style={styles.selectedInfoBold}>{selectedIndices.size}</Text> task
                                                {selectedIndices.size !== 1 ? 's' : ''} selected •{' '}
                                                <Text style={styles.selectedInfoBold}>
                                                    {generatedTasks
                                                        .filter((_, i) => selectedIndices.has(i))
                                                        .reduce((sum, t) => sum + t.estimatedMinutes, 0)}{' '}
                                                    min
                                                </Text>{' '}
                                                total
                                            </>
                                        )}
                                    </Text>
                                </View>

                                <View style={styles.buttonRow}>
                                    <Button
                                        title="Back"
                                        variant="ghost"
                                        onPress={() => {
                                            setGeneratedTasks([]);
                                            setSelectedIndices(new Set());
                                        }}
                                        disabled={isCreating}
                                        style={styles.actionButton}
                                    />
                                    <Button
                                        title={isCreating
                                            ? 'Creating...'
                                            : `Create ${selectedIndices.size} Task${selectedIndices.size !== 1 ? 's' : ''
                                            } →`}
                                        variant="primary"
                                        onPress={handleCreateAll}
                                        isLoading={isCreating}
                                        disabled={selectedIndices.size === 0}
                                        style={styles.actionButton}
                                    />
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.background.card,
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        maxHeight: '90%',
        paddingBottom: SPACING.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flex: 1,
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    proBadge: {
        backgroundColor: `${COLORS.primary.accent}20`,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    proText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.primary.accent,
    },
    closeButton: {
        padding: SPACING.sm,
    },
    content: {
        paddingHorizontal: SPACING.xl,
    },
    inputPhase: {
        paddingVertical: SPACING.lg,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.text.secondary,
        marginBottom: SPACING.sm,
    },
    textarea: {
        backgroundColor: COLORS.background.card,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.muted,
        marginTop: SPACING.xs,
        textAlign: 'right',
    },
    proWarning: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    proWarningText: {
        fontSize: FONT_SIZES.sm,
        color: '#92400E',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    actionButton: {
        flex: 1,
    },
    cancelButtonText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
    generatingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    spinner: {
        marginRight: SPACING.xs,
    },
    generatingText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.text.primary,
        textAlign: 'center',
    },
    generateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    generateButtonText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        fontWeight: '600',
    },
    createButtonText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        fontWeight: '600',
    },
    generateButton: {
        flex: 1,
        backgroundColor: COLORS.primary.accent,
        borderRadius: BORDER_RADIUS.sm,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    generateButtonDisabled: {
        opacity: 0.5,
    },
    generatingTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    previewPhase: {
        paddingVertical: SPACING.lg,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        marginBottom: SPACING.md,
    },
    previewHeaderTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    selectAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    selectAllText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary.accent,
        fontWeight: '500',
    },
    taskList: {
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    taskCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
    },
    taskCardSelected: {
        borderColor: COLORS.primary.accent,
        backgroundColor: `${COLORS.primary.accent}08`,
    },
    taskCheckbox: {
        marginRight: SPACING.md,
        marginTop: 2,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    taskDescription: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
        marginBottom: SPACING.sm,
    },
    taskMeta: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    metaBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    metaText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.muted,
    },
    selectedInfo: {
        backgroundColor: '#DBEAFE',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    selectedInfoText: {
        fontSize: FONT_SIZES.sm,
        color: '#1E40AF',
    },
    selectedInfoBold: {
        fontWeight: '700',
    },
});
