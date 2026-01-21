'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Lightbulb, CheckSquare, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    content: string,
    type: 'idea' | 'task' | 'insight' | 'general'
  ) => Promise<void>;
  canSaveMore: boolean;
  isPro: boolean;
  noteCount: number;
  maxNotes: number;
}

/**
 * Modal for adding a new session note
 */
export function AddNoteModal({
  isOpen,
  onClose,
  onSave,
  canSaveMore,
  isPro,
  noteCount,
  maxNotes,
}: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAtLimit = !isPro && noteCount >= maxNotes;

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Insert template
  const insertTemplate = useCallback(
    (type: 'idea' | 'task' | 'insight') => {
      const templates = {
        idea: '💡 Idea: ',
        task: '📋 TODO: ',
        insight: '🔖 Insight: ',
      };

      const template = templates[type];
      const currentText = content;
      const cursorPos =
        textareaRef.current?.selectionStart || currentText.length;
      const newText =
        currentText.slice(0, cursorPos) +
        template +
        currentText.slice(cursorPos);
      setContent(newText);

      // Focus and position cursor after template
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = cursorPos + template.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    },
    [content]
  );

  // Save note handler
  const handleSave = async () => {
    if (!canSaveMore) {
      toast.error('Note limit reached. Upgrade to PRO for unlimited notes.');
      return;
    }

    if (!content.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    setIsSaving(true);

    try {
      // Detect type from content
      let type: 'idea' | 'task' | 'insight' | 'general' = 'general';
      if (content.includes('💡 Idea:')) type = 'idea';
      else if (content.includes('📋 TODO:')) type = 'task';
      else if (content.includes('🔖 Insight:')) type = 'insight';

      await onSave(content, type);
      toast.success('Note saved');
      setContent('');
      onClose();
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Ctrl/Cmd + Enter to save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSaveMore && content.trim()) {
        handleSave();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal Container - Centers the modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">Add Note</h3>
                  {!isPro && (
                    <span className="text-sm text-white/70 px-3 py-1 bg-white/10 rounded-full">
                      {noteCount}/{maxNotes}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-sm text-white/70 mb-4">
                  Capture your thoughts without breaking focus
                </p>

                {/* Textarea */}
                <div className="relative mb-4">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your note here..."
                    disabled={isAtLimit}
                    maxLength={2000}
                    className="w-full h-40 px-4 py-3 bg-slate-900/50 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Note content"
                  />
                  {content.length > 0 && (
                    <div className="absolute bottom-3 right-3 text-xs text-white/40">
                      {content.length}/2000
                    </div>
                  )}
                </div>

                {/* Quick Templates */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm text-white/60">Quick add:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertTemplate('idea')}
                    disabled={isAtLimit}
                    className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <Lightbulb size={14} />
                    <span>Idea</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertTemplate('task')}
                    disabled={isAtLimit}
                    className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 border border-blue-500/20"
                  >
                    <CheckSquare size={14} />
                    <span>Task</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertTemplate('insight')}
                    disabled={isAtLimit}
                    className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 border border-purple-500/20"
                  >
                    <BookOpen size={14} />
                    <span>Insight</span>
                  </Button>
                </div>

                {/* FREE Limit Warning */}
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

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!canSaveMore || !content.trim() || isSaving}
                    className="flex-1 flex items-center justify-center gap-2"
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

                {/* Keyboard Shortcut Hint */}
                <p className="text-xs text-white/40 text-center mt-4">
                  Press{' '}
                  <kbd className="px-2 py-0.5 bg-white/10 rounded">Cmd</kbd> +{' '}
                  <kbd className="px-2 py-0.5 bg-white/10 rounded">Enter</kbd>{' '}
                  to save
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
