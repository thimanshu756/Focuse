/**
 * SessionNotesDrawer
 * Bottom sheet drawer for session notes using @gorhom/bottom-sheet
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { StickyNote, Plus, Crown, X } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { NoteItem } from './NoteItem';
import { AddNoteModal } from './AddNoteModal';
import type { Note, NoteType, NotesDraft } from '@/types/notes.types';
import { FREE_NOTE_LIMIT } from '@/types/notes.types';

interface SessionNotesDrawerProps {
    notes: Note[];
    draft: NotesDraft | null;
    canAddNote: boolean;
    noteCount: number;
    maxNotes: number;
    isPro?: boolean;
    onAddNote: (content: string, type: NoteType) => Promise<boolean>;
    onDeleteNote: (noteId: string) => void;
    onDraftChange?: (draft: NotesDraft) => void;
}

export function SessionNotesDrawer({
    notes,
    draft,
    canAddNote,
    noteCount,
    maxNotes,
    isPro = false,
    onAddNote,
    onDeleteNote,
    onDraftChange,
}: SessionNotesDrawerProps) {
    // Bottom sheet ref
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Modal state
    const [isAddModalVisible, setIsAddModalVisible] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    // Snap points - collapsed (just FAB visible) and expanded
    const snapPoints = useMemo(() => ['40%', '70%'], []);

    // Handle sheet changes
    const handleSheetChanges = useCallback((index: number) => {
        setIsOpen(index >= 0);
    }, []);

    // Render backdrop
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    // Open drawer
    const handleOpenDrawer = () => {
        bottomSheetRef.current?.snapToIndex(0);
    };

    // Close drawer
    const handleCloseDrawer = () => {
        bottomSheetRef.current?.close();
    };

    // Handle add note
    const handleAddNote = async (content: string, type: NoteType) => {
        const success = await onAddNote(content, type);
        if (success) {
            setIsAddModalVisible(false);
        }
        return success;
    };

    // Handle open add modal
    const handleOpenAddModal = () => {
        if (canAddNote) {
            setIsAddModalVisible(true);
        }
    };

    // Render note item
    const renderNoteItem = useCallback(
        ({ item }: { item: Note }) => (
            <NoteItem note={item} onDelete={onDeleteNote} />
        ),
        [onDeleteNote]
    );

    // Empty state
    const EmptyState = () => (
        <View style={styles.emptyState}>
            <StickyNote size={48} color="rgba(255, 255, 255, 0.2)" />
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptySubtitle}>
                Capture ideas, tasks, or insights during your focus session
            </Text>
        </View>
    );

    // Limit warning for free users
    const LimitWarning = () => (
        <View style={styles.limitWarning}>
            <Crown size={16} color={COLORS.warning} />
            <Text style={styles.limitText}>
                {noteCount}/{FREE_NOTE_LIMIT} notes used.{' '}
                <Text style={styles.upgradeLink}>Upgrade to Pro</Text> for unlimited notes
            </Text>
        </View>
    );

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleOpenDrawer}
                    activeOpacity={0.8}
                >
                    <StickyNote size={24} color={COLORS.text.primary} />
                    {noteCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{noteCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}

            {/* Bottom Sheet */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
            >
                <BottomSheetView style={styles.sheetContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <StickyNote size={20} color={COLORS.primary.accent} />
                            <Text style={styles.headerTitle}>Session Notes</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    !canAddNote && styles.addButtonDisabled,
                                ]}
                                onPress={handleOpenAddModal}
                                disabled={!canAddNote}
                                activeOpacity={0.7}
                            >
                                <Plus size={18} color={canAddNote ? COLORS.text.primary : 'rgba(255, 255, 255, 0.3)'} />
                                <Text style={[styles.addButtonText, !canAddNote && styles.addButtonTextDisabled]}>
                                    Add
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleCloseDrawer}
                                activeOpacity={0.7}
                            >
                                <X size={20} color="rgba(255, 255, 255, 0.6)" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Limit warning for free users */}
                    {!isPro && noteCount > 0 && (
                        <LimitWarning />
                    )}

                    {/* Notes List */}
                    <FlatList
                        data={notes}
                        keyExtractor={(item) => item.id}
                        renderItem={renderNoteItem}
                        contentContainerStyle={styles.notesList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={EmptyState}
                    />
                </BottomSheetView>
            </BottomSheet>

            {/* Add Note Modal */}
            <AddNoteModal
                visible={isAddModalVisible}
                initialDraft={draft}
                onSave={handleAddNote}
                onCancel={() => setIsAddModalVisible(false)}
                onDraftChange={onDraftChange}
            />
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: SPACING.xxl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary.accent,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.floating,
        zIndex: 100,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.error,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.text.white,
    },
    sheetBackground: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
    },
    handleIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 40,
    },
    sheetContent: {
        flex: 1,
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingBottom: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.white,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primary.accent,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.pill,
    },
    addButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    addButtonText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    addButtonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.3)',
    },
    closeButton: {
        padding: SPACING.xs,
    },
    limitWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    limitText: {
        flex: 1,
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    upgradeLink: {
        color: COLORS.warning,
        fontWeight: '600',
    },
    notesList: {
        flexGrow: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl,
    },
    emptyTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.white,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        fontSize: FONT_SIZES.sm,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        maxWidth: 250,
        lineHeight: 20,
    },
});
