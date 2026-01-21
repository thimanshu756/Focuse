'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SessionNote {
  id: string;
  sessionId: string;
  content: string;
  type: 'idea' | 'task' | 'insight' | 'general';
  createdAt: Date;
}

interface UseSessionNotesProps {
  sessionId: string;
  isPro: boolean;
}

interface UseSessionNotesReturn {
  notes: SessionNote[];
  draft: string;
  noteCount: number;
  maxNotes: number;
  isSaving: boolean;
  setDraft: (text: string) => void;
  saveNote: (type?: 'idea' | 'task' | 'insight' | 'general') => Promise<void>;
  saveNoteWithContent: (
    content: string,
    type?: 'idea' | 'task' | 'insight' | 'general'
  ) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  canSaveMore: boolean;
  clearNotes: () => void; // Cleanup function to delete all notes for session
}

const STORAGE_PREFIX = 'session-notes';
const DRAFT_PREFIX = 'session-notes-draft';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds
const MAX_NOTE_LENGTH = 2000;

/**
 * Hook for managing session notes with auto-save and persistence
 */
export function useSessionNotes({
  sessionId,
  isPro,
}: UseSessionNotesProps): UseSessionNotesReturn {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [draft, setDraftState] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const maxNotes = isPro ? Infinity : 3;

  // Load notes from localStorage
  const loadNotes = useCallback((): SessionNote[] => {
    if (typeof window === 'undefined' || !sessionId) return [];

    try {
      const key = `${STORAGE_PREFIX}:${sessionId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }

    return [];
  }, [sessionId]);

  // Save notes to localStorage
  const saveNotesToStorage = useCallback(
    (notesToSave: SessionNote[]) => {
      if (typeof window === 'undefined' || !sessionId) return;

      try {
        const key = `${STORAGE_PREFIX}:${sessionId}`;
        localStorage.setItem(key, JSON.stringify(notesToSave));
      } catch (error) {
        console.error('Failed to save notes to localStorage:', error);
        // If storage is full, show warning (handled in component)
      }
    },
    [sessionId]
  );

  // Load draft from localStorage
  const loadDraft = useCallback((): string => {
    if (typeof window === 'undefined' || !sessionId) return '';

    try {
      const key = `${DRAFT_PREFIX}:${sessionId}`;
      return localStorage.getItem(key) || '';
    } catch (error) {
      console.error('Failed to load draft:', error);
      return '';
    }
  }, [sessionId]);

  // Save draft to localStorage
  const saveDraftToStorage = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !sessionId) return;

      try {
        const key = `${DRAFT_PREFIX}:${sessionId}`;
        localStorage.setItem(key, text);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    },
    [sessionId]
  );

  // Clear all notes and draft for this session
  const clearNotes = useCallback(() => {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
      const notesKey = `${STORAGE_PREFIX}:${sessionId}`;
      const draftKey = `${DRAFT_PREFIX}:${sessionId}`;

      localStorage.removeItem(notesKey);
      localStorage.removeItem(draftKey);

      setNotes([]);
      setDraftState('');
    } catch (error) {
      console.error('Failed to clear notes:', error);
    }
  }, [sessionId]);

  // Initialize: Load notes and draft
  useEffect(() => {
    if (!sessionId) return;

    const loadedNotes = loadNotes();
    setNotes(loadedNotes);

    const loadedDraft = loadDraft();
    setDraftState(loadedDraft);
  }, [sessionId, loadNotes, loadDraft]);

  // Auto-save draft
  useEffect(() => {
    if (!sessionId) return;

    // Clear existing interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // Set up auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      if (draft.trim()) {
        saveDraftToStorage(draft);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [draft, sessionId, saveDraftToStorage]);

  // Save notes to storage whenever notes change
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
      const key = `${STORAGE_PREFIX}:${sessionId}`;
      if (notes.length > 0) {
        localStorage.setItem(key, JSON.stringify(notes));
      } else {
        // Clear storage if no notes
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  }, [notes, sessionId]);

  // Set draft (with immediate storage save)
  const setDraft = useCallback(
    (text: string) => {
      if (text.length > MAX_NOTE_LENGTH) return;
      setDraftState(text);
      saveDraftToStorage(text);
    },
    [saveDraftToStorage]
  );

  // Save note
  const saveNote = useCallback(
    async (type: 'idea' | 'task' | 'insight' | 'general' = 'general') => {
      if (isSavingRef.current || !draft.trim() || !sessionId) return;

      // Check FREE limit
      if (!isPro && notes.length >= maxNotes) {
        return; // Should be blocked by UI, but double-check
      }

      isSavingRef.current = true;
      setIsSaving(true);

      try {
        const newNote: SessionNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId,
          content: draft.trim(),
          type,
          createdAt: new Date(),
        };

        // Add to local state
        setNotes((prev) => [...prev, newNote]);

        // Clear draft
        setDraftState('');
        saveDraftToStorage('');
      } catch (error) {
        console.error('Failed to save note:', error);
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [draft, sessionId, isPro, notes.length, maxNotes, saveDraftToStorage]
  );

  // Save note with explicit content (for modal)
  const saveNoteWithContent = useCallback(
    async (
      content: string,
      type: 'idea' | 'task' | 'insight' | 'general' = 'general'
    ) => {
      if (isSavingRef.current || !content.trim() || !sessionId) return;

      // Check FREE limit
      if (!isPro && notes.length >= maxNotes) {
        return; // Should be blocked by UI, but double-check
      }

      isSavingRef.current = true;
      setIsSaving(true);

      try {
        const newNote: SessionNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId,
          content: content.trim(),
          type,
          createdAt: new Date(),
        };

        // Add to local state
        setNotes((prev) => [...prev, newNote]);
      } catch (error) {
        console.error('Failed to save note:', error);
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [sessionId, isPro, notes.length, maxNotes]
  );

  // Delete note
  const deleteNote = useCallback(async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const canSaveMore = isPro || notes.length < maxNotes;
  const noteCount = notes.length;

  return {
    notes,
    draft,
    noteCount,
    maxNotes: isPro ? Infinity : maxNotes,
    isSaving,
    setDraft,
    saveNote,
    saveNoteWithContent,
    deleteNote,
    canSaveMore,
    clearNotes,
  };
}
