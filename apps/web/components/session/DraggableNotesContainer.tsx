'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DraggableNote } from './DraggableNote';
import { AddNoteModal } from './AddNoteModal';
import { FloatingAddNoteButton } from './FloatingAddNoteButton';
import { useSessionNotes } from '@/hooks/useSessionNotes';
import toast from 'react-hot-toast';

interface DraggableNotesContainerProps {
  sessionId: string;
  isPro: boolean;
  isMobile?: boolean;
}

interface NotePosition {
  x: number;
  y: number;
}

/**
 * Container that manages all draggable notes for a session
 */
export function DraggableNotesContainer({
  sessionId,
  isPro,
  isMobile = false,
}: DraggableNotesContainerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [notePositions, setNotePositions] = useState<
    Record<string, NotePosition>
  >({});

  const {
    notes,
    noteCount,
    maxNotes,
    isSaving,
    saveNoteWithContent,
    deleteNote,
    canSaveMore,
  } = useSessionNotes({ sessionId, isPro });

  // Load saved positions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
      const key = `note-positions:${sessionId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setNotePositions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load note positions:', error);
    }
  }, [sessionId]);

  // Save positions to localStorage when they change
  const handlePositionChange = useCallback(
    (noteId: string, x: number, y: number) => {
      const newPositions = { ...notePositions, [noteId]: { x, y } };
      setNotePositions(newPositions);

      try {
        const key = `note-positions:${sessionId}`;
        localStorage.setItem(key, JSON.stringify(newPositions));
      } catch (error) {
        console.error('Failed to save note positions:', error);
      }
    },
    [notePositions, sessionId]
  );

  // Handle save note from modal
  const handleSaveNote = useCallback(
    async (content: string, type: 'idea' | 'task' | 'insight' | 'general') => {
      // Save the note directly with the content
      await saveNoteWithContent(content, type);
    },
    [saveNoteWithContent]
  );

  // Handle delete note
  const handleDeleteNote = useCallback(
    (noteId: string) => {
      deleteNote(noteId);
      toast.success('Note deleted');

      // Remove position from state and storage
      const newPositions = { ...notePositions };
      delete newPositions[noteId];
      setNotePositions(newPositions);

      try {
        const key = `note-positions:${sessionId}`;
        localStorage.setItem(key, JSON.stringify(newPositions));
      } catch (error) {
        console.error('Failed to update note positions:', error);
      }
    },
    [deleteNote, notePositions, sessionId]
  );

  // Generate initial position for new notes (cascade effect)
  const getInitialPosition = (index: number): NotePosition => {
    const baseX = isMobile ? 20 : 100;
    const baseY = isMobile ? 100 : 150;
    const offset = index * 30;

    return {
      x: baseX + offset,
      y: baseY + offset,
    };
  };

  return (
    <>
      {/* Draggable Notes */}
      <AnimatePresence>
        {notes.map((note, index) => (
          <DraggableNote
            key={note.id}
            note={note}
            onDelete={handleDeleteNote}
            onPositionChange={handlePositionChange}
            initialPosition={
              notePositions[note.id] || getInitialPosition(index)
            }
          />
        ))}
      </AnimatePresence>

      {/* Floating Add Button */}
      <FloatingAddNoteButton
        onClick={() => setShowAddModal(true)}
        noteCount={noteCount}
        isMobile={isMobile}
      />

      {/* Add Note Modal */}
      {showAddModal && (
        <AddNoteModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveNote}
          canSaveMore={canSaveMore}
          isPro={isPro}
          noteCount={noteCount}
          maxNotes={maxNotes}
        />
      )}
    </>
  );
}
