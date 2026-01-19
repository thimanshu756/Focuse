'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckSquare, BookOpen, Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSessionNotes, SessionNote } from '@/hooks/useSessionNotes';
import { NoteItem } from './NoteItem';
import toast from 'react-hot-toast';

interface SessionNotesPanelProps {
  sessionId: string;
  isPro: boolean;
}

/**
 * Session notes panel - always visible in the main screen
 */
export function SessionNotesPanel({
  sessionId,
  isPro,
}: SessionNotesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    notes,
    draft,
    noteCount,
    maxNotes,
    isSaving,
    setDraft,
    saveNote,
    deleteNote,
    canSaveMore,
  } = useSessionNotes({ sessionId, isPro });

  // Focus textarea when input opens
  useEffect(() => {
    if (showInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showInput]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter saves note when textarea focused
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'Enter' &&
        document.activeElement === textareaRef.current
      ) {
        e.preventDefault();
        if (canSaveMore && draft.trim()) {
          handleSaveNote();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSaveMore, draft]);

  // Insert template
  const insertTemplate = useCallback(
    (type: 'idea' | 'task' | 'insight') => {
      const templates = {
        idea: '💡 Idea: ',
        task: '📋 TODO: ',
        insight: '🔖 Insight: ',
      };

      const template = templates[type];
      const currentText = draft;
      const cursorPos =
        textareaRef.current?.selectionStart || currentText.length;
      const newText =
        currentText.slice(0, cursorPos) +
        template +
        currentText.slice(cursorPos);
      setDraft(newText);

      // Focus and position cursor after template
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = cursorPos + template.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    },
    [draft, setDraft]
  );

  // Save note handler
  const handleSaveNote = useCallback(async () => {
    if (!canSaveMore) {
      toast.error('Note limit reached. Upgrade to PRO for unlimited notes.');
      return;
    }

    if (!draft.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    // Detect type from content
    let type: 'idea' | 'task' | 'insight' | 'general' = 'general';
    if (draft.includes('💡 Idea:')) type = 'idea';
    else if (draft.includes('📋 TODO:')) type = 'task';
    else if (draft.includes('🔖 Insight:')) type = 'insight';

    await saveNote(type);
    toast.success('Note saved');
    setDraft('');
    setShowInput(false);
  }, [canSaveMore, draft, saveNote, setDraft]);

  // Handle delete
  const handleDelete = useCallback(
    (noteId: string) => {
      deleteNote(noteId);
      toast.success('Note deleted');
    },
    [deleteNote]
  );

  const isAtLimit = !isPro && noteCount >= maxNotes;

  return (
    <div className="w-full mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Session Notes</h3>
          {!isPro && (
            <span className="text-sm text-white/60 px-2 py-0.5 bg-white/10 rounded-full">
              {noteCount}/{maxNotes}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!showInput && canSaveMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInput(true)}
              className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Note</span>
            </Button>
          )}
          {notes.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label={isExpanded ? 'Collapse notes' : 'Expand notes'}
            >
              {isExpanded ? (
                <X size={18} />
              ) : (
                <Plus size={18} className="rotate-45" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Input Section */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="relative mb-3">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Capture your thoughts..."
              disabled={isAtLimit}
              maxLength={2000}
              className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              aria-label="Note input"
            />
            {draft.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-white/40">
                {draft.length}/2000
              </div>
            )}
          </div>

          {/* Quick Templates */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertTemplate('idea')}
              disabled={isAtLimit}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
            >
              <Lightbulb size={14} />
              <span>Idea</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertTemplate('task')}
              disabled={isAtLimit}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
            >
              <CheckSquare size={14} />
              <span>Task</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertTemplate('insight')}
              disabled={isAtLimit}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
            >
              <BookOpen size={14} />
              <span>Insight</span>
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowInput(false);
                setDraft('');
              }}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveNote}
              disabled={!canSaveMore || !draft.trim() || isSaving}
              className="flex items-center gap-1.5 text-xs"
            >
              {isSaving ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save</span>
                </>
              )}
            </Button>
          </div>

          {/* FREE Limit Warning */}
          {isAtLimit && (
            <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-400/30">
              <p className="text-xs text-yellow-100 text-center mb-2">
                ⭐ Limit reached — Upgrade to PRO for unlimited notes
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.location.href = '/profile?upgrade=true';
                }}
                className="w-full text-xs"
              >
                Upgrade to PRO
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Notes List */}
      {notes.length > 0 && isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2 max-h-[250px] lg:max-h-[350px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-white/30"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
          }}
        >
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {notes.length === 0 && !showInput && (
        <div className="text-center py-8 text-white/40">
          <p className="text-sm mb-2">No notes yet</p>
          {canSaveMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInput(true)}
              className="text-white/60 hover:text-white flex items-center gap-2 justify-center"
            >
              <Plus size={16} />
              <span>Add your first note</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
