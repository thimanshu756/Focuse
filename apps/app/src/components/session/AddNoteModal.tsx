/**
 * AddNoteModal
 * Modal for adding/editing session notes
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { X, Lightbulb, CheckSquare, Sparkles, MessageCircle } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { NoteType, NotesDraft } from '@/types/notes.types';
import { NOTE_MAX_LENGTH } from '@/types/notes.types';

interface AddNoteModalProps {
    visible: boolean;
    initialDraft?: NotesDraft | null;
    onSave: (content: string, type: NoteType) => Promise<boolean>;
    onCancel: () => void;
    onDraftChange?: (draft: NotesDraft) => void;
}

// Note type options
const NOTE_TYPES: { type: NoteType; icon: typeof Lightbulb; label: string; color: string }[] = [
    { type: 'idea', icon: Lightbulb, label: 'Idea', color: '#FBBF24' },
    { type: 'task', icon: CheckSquare, label: 'Task', color: '#3B82F6' },
    { type: 'insight', icon: Sparkles, label: 'Insight', color: '#A855F7' },
    { type: 'general', icon: MessageCircle, label: 'General', color: '#6B7280' },
];

export function AddNoteModal({
    visible,
    initialDraft,
    onSave,
    onCancel,
    onDraftChange,
}: AddNoteModalProps) {
    const [content, setContent] = useState('');
    const [selectedType, setSelectedType] = useState<NoteType>('general');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<TextInput>(null);

    // Load initial draft
    useEffect(() => {
        if (visible) {
            if (initialDraft) {
                setContent(initialDraft.content);
                setSelectedType(initialDraft.type);
            } else {
                setContent('');
                setSelectedType('general');
            }
            setError(null);

            // Focus input after modal open
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [visible, initialDraft]);

    // Update draft on content/type change
    useEffect(() => {
        if (visible && content) {
            onDraftChange?.({ content, type: selectedType });
        }
    }, [content, selectedType, visible, onDraftChange]);

    const handleSave = async () => {
        const trimmedContent = content.trim();

        if (!trimmedContent) {
            setError('Please enter a note');
            return;
        }

        if (trimmedContent.length > NOTE_MAX_LENGTH) {
            setError(`Note too long (max ${NOTE_MAX_LENGTH} characters)`);
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const success = await onSave(trimmedContent, selectedType);
            if (success) {
                setContent('');
                setSelectedType('general');
            } else {
                setError('Failed to save note. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setContent('');
        setSelectedType('general');
        setError(null);
        onCancel();
    };

    const characterCount = content.length;
    const isOverLimit = characterCount > NOTE_MAX_LENGTH;

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Note</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCancel}
                            activeOpacity={0.7}
                        >
                            <X size={24} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Note Type Selector */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.typeSelector}
                        contentContainerStyle={styles.typeSelectorContent}
                    >
                        {NOTE_TYPES.map(({ type, icon: Icon, label, color }) => {
                            const isSelected = selectedType === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeButton,
                                        isSelected && { backgroundColor: `${color}20`, borderColor: color },
                                    ]}
                                    onPress={() => setSelectedType(type)}
                                    activeOpacity={0.7}
                                >
                                    <Icon
                                        size={18}
                                        color={isSelected ? color : 'rgba(255, 255, 255, 0.5)'}
                                    />
                                    <Text
                                        style={[
                                            styles.typeLabel,
                                            isSelected && { color },
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Text Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.textInput, isOverLimit && styles.textInputError]}
                            placeholder="What's on your mind?"
                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            maxLength={NOTE_MAX_LENGTH + 100} // Allow slight overage for UX
                            textAlignVertical="top"
                        />
                        <Text
                            style={[
                                styles.characterCount,
                                isOverLimit && styles.characterCountError,
                            ]}
                        >
                            {characterCount}/{NOTE_MAX_LENGTH}
                        </Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                (isSaving || isOverLimit || !content.trim()) && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            activeOpacity={0.8}
                            disabled={isSaving || isOverLimit || !content.trim()}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSaving ? 'Saving...' : 'Save Note'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        paddingBottom: SPACING.xxxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.text.white,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    typeSelector: {
        flexGrow: 0,
        marginBottom: SPACING.lg,
    },
    typeSelectorContent: {
        gap: SPACING.sm,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.pill,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    typeLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    inputContainer: {
        marginBottom: SPACING.lg,
    },
    textInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        fontSize: FONT_SIZES.md,
        color: COLORS.text.white,
        minHeight: 120,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    textInputError: {
        borderColor: COLORS.error,
    },
    characterCount: {
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'right',
        marginTop: SPACING.xs,
    },
    characterCountError: {
        color: COLORS.error,
    },
    errorText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
        marginBottom: SPACING.lg,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    cancelButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.pill,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    cancelButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    saveButton: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.pill,
        backgroundColor: COLORS.primary.accent,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
});
