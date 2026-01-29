/**
 * useSessionNotes Hook
 * Manages session notes with AsyncStorage persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Note, NoteType, NotesDraft } from '@/types/notes.types';
import { NOTE_MAX_LENGTH, FREE_NOTE_LIMIT } from '@/types/notes.types';

interface UseSessionNotesOptions {
    sessionId: string;
    isPro?: boolean;
    autoSaveInterval?: number; // in ms
}

interface UseSessionNotesReturn {
    notes: Note[];
    draft: NotesDraft | null;
    isLoading: boolean;
    canAddNote: boolean;
    noteCount: number;
    maxNotes: number;
    addNote: (content: string, type: NoteType) => Promise<boolean>;
    deleteNote: (noteId: string) => Promise<void>;
    clearNotes: () => Promise<void>;
    saveDraft: (draft: NotesDraft) => Promise<void>;
    clearDraft: () => Promise<void>;
}

// Storage key generators
const getNotesKey = (sessionId: string) => `session-notes:${sessionId}`;
const getDraftKey = (sessionId: string) => `session-notes-draft:${sessionId}`;

export function useSessionNotes(options: UseSessionNotesOptions): UseSessionNotesReturn {
    const { sessionId, isPro = false, autoSaveInterval = 5000 } = options;

    const [notes, setNotes] = useState<Note[]>([]);
    const [draft, setDraft] = useState<NotesDraft | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const draftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingDraftRef = useRef<NotesDraft | null>(null);

    const maxNotes = isPro ? Infinity : FREE_NOTE_LIMIT;

    // Load notes and draft on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [notesJson, draftJson] = await Promise.all([
                    AsyncStorage.getItem(getNotesKey(sessionId)),
                    AsyncStorage.getItem(getDraftKey(sessionId)),
                ]);

                if (notesJson) {
                    setNotes(JSON.parse(notesJson));
                }
                if (draftJson) {
                    setDraft(JSON.parse(draftJson));
                }
            } catch (error) {
                console.error('Failed to load session notes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (sessionId) {
            loadData();
        }

        return () => {
            // Cleanup auto-save timer on unmount
            if (draftTimeoutRef.current) {
                clearTimeout(draftTimeoutRef.current);
            }
        };
    }, [sessionId]);

    // Add a new note
    const addNote = useCallback(
        async (content: string, type: NoteType): Promise<boolean> => {
            if (!sessionId) return false;

            // Check limits
            if (!isPro && notes.length >= FREE_NOTE_LIMIT) {
                return false;
            }

            // Validate content
            const trimmedContent = content.trim();
            if (!trimmedContent || trimmedContent.length > NOTE_MAX_LENGTH) {
                return false;
            }

            const newNote: Note = {
                id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                sessionId,
                content: trimmedContent,
                type,
                createdAt: new Date().toISOString(),
            };

            try {
                const updatedNotes = [...notes, newNote];
                await AsyncStorage.setItem(getNotesKey(sessionId), JSON.stringify(updatedNotes));
                setNotes(updatedNotes);

                // Clear draft after successful save
                await AsyncStorage.removeItem(getDraftKey(sessionId));
                setDraft(null);

                return true;
            } catch (error) {
                console.error('Failed to save note:', error);
                return false;
            }
        },
        [sessionId, notes, isPro]
    );

    // Delete a note
    const deleteNote = useCallback(
        async (noteId: string): Promise<void> => {
            if (!sessionId) return;

            try {
                const updatedNotes = notes.filter((n) => n.id !== noteId);
                await AsyncStorage.setItem(getNotesKey(sessionId), JSON.stringify(updatedNotes));
                setNotes(updatedNotes);
            } catch (error) {
                console.error('Failed to delete note:', error);
            }
        },
        [sessionId, notes]
    );

    // Clear all notes for session
    const clearNotes = useCallback(async (): Promise<void> => {
        if (!sessionId) return;

        try {
            await Promise.all([
                AsyncStorage.removeItem(getNotesKey(sessionId)),
                AsyncStorage.removeItem(getDraftKey(sessionId)),
            ]);
            setNotes([]);
            setDraft(null);
        } catch (error) {
            console.error('Failed to clear notes:', error);
        }
    }, [sessionId]);

    // Save draft with debouncing
    const saveDraft = useCallback(
        async (newDraft: NotesDraft): Promise<void> => {
            if (!sessionId) return;

            pendingDraftRef.current = newDraft;
            setDraft(newDraft);

            // Debounce save to AsyncStorage
            if (draftTimeoutRef.current) {
                clearTimeout(draftTimeoutRef.current);
            }

            draftTimeoutRef.current = setTimeout(async () => {
                try {
                    if (pendingDraftRef.current) {
                        await AsyncStorage.setItem(
                            getDraftKey(sessionId),
                            JSON.stringify(pendingDraftRef.current)
                        );
                    }
                } catch (error) {
                    console.error('Failed to save draft:', error);
                }
            }, autoSaveInterval);
        },
        [sessionId, autoSaveInterval]
    );

    // Clear draft
    const clearDraft = useCallback(async (): Promise<void> => {
        if (!sessionId) return;

        if (draftTimeoutRef.current) {
            clearTimeout(draftTimeoutRef.current);
        }
        pendingDraftRef.current = null;

        try {
            await AsyncStorage.removeItem(getDraftKey(sessionId));
            setDraft(null);
        } catch (error) {
            console.error('Failed to clear draft:', error);
        }
    }, [sessionId]);

    return {
        notes,
        draft,
        isLoading,
        canAddNote: isPro || notes.length < FREE_NOTE_LIMIT,
        noteCount: notes.length,
        maxNotes,
        addNote,
        deleteNote,
        clearNotes,
        saveDraft,
        clearDraft,
    };
}
