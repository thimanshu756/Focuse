'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Sparkles,
} from 'lucide-react';
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
 * Aligned with .cursor/design/design.json (Modern soft productivity)
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
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              className="w-full max-w-lg bg-[#111111] rounded-[24px] border border-white/10 shadow-[0_12px_32px_rgba(15,23,42,0.12)] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-primary-accent">
                    <Sparkles size={16} className="text-[#D7F50A]" />
                  </div>
                  <h3 className="text-xl font-medium text-white tracking-wide">
                    Add Note
                  </h3>
                  {!isPro && (
                    <span className="text-xs font-medium text-white/50 px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
                      {noteCount}/{maxNotes}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Textarea */}
                <div className="relative mb-6 group">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your note here..."
                    disabled={isAtLimit}
                    maxLength={2000}
                    className="w-full h-48 px-5 py-5 bg-white/5 border border-white/5 rounded-[18px] text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#D7F50A]/50 focus:bg-white/10 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all font-light text-lg leading-relaxed"
                    aria-label="Note content"
                  />

                  {/* Character Count */}
                  <div className="absolute bottom-4 right-4 text-xs text-white/20 font-mono pointer-events-none transition-opacity group-focus-within:text-white/40">
                    {content.length}/2000
                  </div>
                </div>

                {/* Quick Templates - Styled as Pills */}
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => insertTemplate('idea')}
                      disabled={isAtLimit}
                      className="px-4 py-2 bg-[#D7F50A]/10 text-[#D7F50A] hover:bg-[#D7F50A]/20 rounded-full transition-colors text-sm font-medium border border-[#D7F50A]/20"
                    >
                      💡 Idea
                    </button>
                    <button
                      onClick={() => insertTemplate('task')}
                      disabled={isAtLimit}
                      className="px-4 py-2 bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 rounded-full transition-colors text-sm font-medium border border-blue-400/20"
                    >
                      📋 Task
                    </button>
                    <button
                      onClick={() => insertTemplate('insight')}
                      disabled={isAtLimit}
                      className="px-4 py-2 bg-purple-400/10 text-purple-400 hover:bg-purple-400/20 rounded-full transition-colors text-sm font-medium border border-purple-400/20"
                    >
                      🔖 Insight
                    </button>
                  </div>
                </div>

                {/* FREE Limit Warning */}
                {isAtLimit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/10"
                  >
                    <p className="text-xs text-yellow-200/90 mb-3 text-center">
                      Limit reached — Upgrade to PRO for unlimited notes
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        window.location.href = '/profile?upgrade=true';
                      }}
                      className="w-full bg-[#D7F50A] text-black border-none hover:bg-[#E9FF6A]"
                    >
                      Upgrade to PRO
                    </Button>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 py-6 rounded-full text-white/60 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!canSaveMore || !content.trim() || isSaving}
                    className="flex-[2] py-6 rounded-full bg-white text-black hover:bg-white/90 border-none shadow-lg shadow-white/5 flex items-center justify-center gap-2 font-semibold"
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save Note</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
