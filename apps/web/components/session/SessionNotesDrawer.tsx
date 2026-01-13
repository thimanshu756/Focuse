'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface SessionNote {
  id: string;
  content: string;
  timestamp: Date;
  type: 'idea' | 'task' | 'insight' | 'general';
}

interface SessionNotesDrawerProps {
  sessionId: string;
  isPro: boolean;
}

const MAX_FREE_NOTES = 3;

const noteTypeConfig = {
  idea: { icon: '💡', label: 'Idea', prefix: '💡 Idea: ' },
  task: { icon: '📋', label: 'Task', prefix: '📋 TODO: ' },
  insight: { icon: '🔖', label: 'Insight', prefix: '🔖 Insight: ' },
  general: { icon: '📝', label: 'Note', prefix: '' },
};

export function SessionNotesDrawer({
  sessionId,
  isPro,
}: SessionNotesDrawerProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const remainingNotes = isPro ? Infinity : MAX_FREE_NOTES - notes.length;
  const canAddNote = isPro || notes.length < MAX_FREE_NOTES;

  // Load existing notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`session-notes-${sessionId}`);
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        // Convert timestamp strings back to Date objects
        const notesWithDates = parsed.map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }));
        setNotes(notesWithDates);
      } catch (error) {
        console.error('Failed to parse saved notes:', error);
      }
    }
  }, [sessionId]);

  // Auto-save to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(`session-notes-${sessionId}`, JSON.stringify(notes));
    }
  }, [notes, sessionId]);

  // Keyboard shortcut: Cmd/Ctrl + N to toggle drawer
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const addNote = (type: SessionNote['type'] = 'general') => {
    if (!canAddNote) {
      toast.error('Upgrade to PRO for unlimited notes');
      return;
    }

    if (!currentNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    const newNote: SessionNote = {
      id: Date.now().toString(),
      content: currentNote.trim(),
      timestamp: new Date(),
      type,
    };

    setNotes([...notes, newNote]);
    setCurrentNote('');

    toast.success('Note saved!', {
      icon: noteTypeConfig[type].icon,
      duration: 2000,
    });
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem(
      `session-notes-${sessionId}`,
      JSON.stringify(updatedNotes)
    );
    toast.success('Note deleted');
  };

  const addTemplate = (prefix: string) => {
    if (!canAddNote) {
      toast.error('Upgrade to PRO for unlimited notes');
      return;
    }
    setCurrentNote((prev) => (prev ? prev + '\n' + prefix : prefix));
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 z-30"
      initial={false}
      animate={{ height: isExpanded ? '60vh' : '60px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📝</span>
          <span className="text-white font-semibold">Session Notes</span>
          {!isPro && (
            <span className="text-sm text-white/60 px-2 py-0.5 bg-white/10 rounded-full">
              {notes.length}/{MAX_FREE_NOTES}
            </span>
          )}
          {notes.length > 0 && (
            <span className="text-xs text-white/40">
              ({notes.length} saved)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isSaving && <span className="text-sm text-white/60">Saving...</span>}
          {isExpanded ? (
            <ChevronDown size={20} className="text-white/60" />
          ) : (
            <ChevronUp size={20} className="text-white/60" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-6 overflow-y-auto"
            style={{ maxHeight: 'calc(60vh - 60px)' }}
          >
            {/* Input Area */}
            <div className="mb-6">
              <p className="text-sm text-white/70 mb-3">
                Capture your thoughts without breaking focus:
              </p>

              <div className="relative">
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      addNote();
                    }
                  }}
                  placeholder={
                    canAddNote
                      ? 'Type here... (Ctrl/Cmd + Enter to save)'
                      : 'Upgrade to add more notes'
                  }
                  disabled={!canAddNote}
                  className={`w-full h-32 px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 resize-none transition-all ${
                    !canAddNote ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />

                {/* Upgrade overlay for FREE limit reached */}
                {!canAddNote && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="text-center p-6">
                      <p className="text-white mb-3 font-semibold">
                        ⭐ Note Limit Reached
                      </p>
                      <Button
                        onClick={() => {
                          setIsExpanded(false);
                          router.push('/upgrade');
                        }}
                        variant="primary"
                        size="sm"
                      >
                        Upgrade to PRO
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  onClick={() => addTemplate(noteTypeConfig.idea.prefix)}
                  variant="ghost"
                  size="sm"
                  disabled={!canAddNote}
                  className="text-white/80 hover:bg-white/10"
                >
                  💡 Idea
                </Button>
                <Button
                  onClick={() => addTemplate(noteTypeConfig.task.prefix)}
                  variant="ghost"
                  size="sm"
                  disabled={!canAddNote}
                  className="text-white/80 hover:bg-white/10"
                >
                  📋 Task
                </Button>
                <Button
                  onClick={() => addTemplate(noteTypeConfig.insight.prefix)}
                  variant="ghost"
                  size="sm"
                  disabled={!canAddNote}
                  className="text-white/80 hover:bg-white/10"
                >
                  🔖 Insight
                </Button>
                <Button
                  onClick={() => addNote()}
                  variant="primary"
                  size="sm"
                  disabled={!canAddNote || !currentNote.trim()}
                >
                  Save Note
                </Button>
              </div>

              {/* Character count hint */}
              {currentNote.length > 0 && (
                <p className="text-xs text-white/40 mt-2">
                  {currentNote.length} characters
                </p>
              )}
            </div>

            {/* Saved Notes List */}
            {notes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px bg-white/20 flex-1" />
                  <span className="text-sm text-white/60">Saved Notes</span>
                  <div className="h-px bg-white/20 flex-1" />
                </div>

                <div className="space-y-2">
                  {notes
                    .slice()
                    .reverse()
                    .map((note) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-white/5 rounded-xl p-4 group hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {note.content}
                            </p>
                            <span className="text-xs text-white/40 mt-2 block">
                              {formatDistanceToNow(note.timestamp, {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1 hover:bg-red-400/10 rounded"
                            aria-label="Delete note"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {notes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-6xl mb-4">📝</p>
                <p className="text-white/60 text-sm">
                  No notes yet. Start capturing your thoughts!
                </p>
              </div>
            )}

            {/* FREE user upgrade prompt */}
            {!isPro && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl text-center border border-yellow-400/30">
                <p className="text-sm text-yellow-200 mb-2">
                  {remainingNotes > 0
                    ? `⭐ ${remainingNotes} note${remainingNotes === 1 ? '' : 's'} remaining`
                    : '⭐ Note limit reached'}
                </p>
                <Button
                  onClick={() => {
                    setIsExpanded(false);
                    router.push('/upgrade');
                  }}
                  variant="primary"
                  size="sm"
                >
                  Upgrade for Unlimited Notes
                </Button>
              </div>
            )}

            {/* Keyboard shortcut hint */}
            <div className="mt-4 text-center text-xs text-white/40">
              Press{' '}
              <kbd className="px-2 py-0.5 bg-white/10 rounded mx-1">
                Cmd/Ctrl + N
              </kbd>{' '}
              to toggle notes
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
