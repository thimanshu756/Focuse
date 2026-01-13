'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSessionNotes, SessionNote } from '@/hooks/useSessionNotes';
import { NoteItem } from './NoteItem';
import toast from 'react-hot-toast';

interface SessionNotesDrawerProps {
  sessionId: string;
  isPro: boolean;
}

/**
 * Session notes drawer with auto-save and FREE/PRO limits
 */
export function SessionNotesDrawer({
  sessionId,
  isPro,
}: SessionNotesDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Focus textarea when drawer opens
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N toggles drawer
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }

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

      // Escape closes drawer
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, canSaveMore, draft]);

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
  }, [canSaveMore, draft, saveNote]);

  // Handle delete
  const handleDelete = useCallback(
    async (noteId: string) => {
      await deleteNote(noteId);
      toast.success('Note deleted');
    },
    [deleteNote]
  );

  const remainingNotes = isPro ? null : maxNotes - noteCount;
  const isAtLimit = !isPro && noteCount >= maxNotes;

  return (
    <>
      {/* Collapsed Header */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-xl border-t border-white/20 shadow-lg"
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : '64px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="h-full flex items-center justify-between px-4 md:px-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse notes' : 'Expand notes'}
            aria-expanded={isExpanded}
          >
            <span className="text-lg font-semibold">Session Notes</span>
            {!isPro && (
              <span className="text-sm text-white/60">
                ({noteCount}/{maxNotes})
              </span>
            )}
            {isExpanded ? (
              <ChevronDown size={20} className="text-white/60" />
            ) : (
              <ChevronUp size={20} className="text-white/60" />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="px-4 md:px-6 py-6 max-h-[50vh] md:max-h-[45vh] lg:max-h-[40vh] flex flex-col"
                style={{
                  maxHeight: isPro ? 'calc(50vh - 64px)' : 'calc(55vh - 64px)', // More space on mobile
                }}
              >
                {/* Helper Text */}
                <p className="text-sm text-white/60 mb-4">
                  Capture thoughts without breaking focus
                </p>

                {/* Text Input Area */}
                <div className="relative mb-4">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your note here..."
                    disabled={isAtLimit}
                    maxLength={2000}
                    className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Note input"
                  />
                  {draft.length > 0 && (
                    <div className="absolute bottom-2 right-2 text-xs text-white/40">
                      {draft.length}/2000
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertTemplate('idea')}
                    disabled={isAtLimit}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Lightbulb size={16} />
                    <span>Idea</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertTemplate('task')}
                    disabled={isAtLimit}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <CheckSquare size={16} />
                    <span>Task</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertTemplate('insight')}
                    disabled={isAtLimit}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <BookOpen size={16} />
                    <span>Insight</span>
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={!canSaveMore || !draft.trim() || isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Note</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* FREE Limit Overlay */}
                {isAtLimit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30"
                  >
                    <p className="text-sm text-yellow-100 mb-3 text-center">
                      ⭐ Limit reached — Upgrade to PRO for unlimited notes
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        window.location.href = '/profile?upgrade=true';
                      }}
                      className="w-full"
                    >
                      Upgrade to PRO
                    </Button>
                  </motion.div>
                )}

                {/* Saved Notes List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">
                      No notes yet. Start typing to capture your thoughts.
                    </div>
                  ) : (
                    notes.map((note) => (
                      <NoteItem
                        key={note.id}
                        note={note}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
