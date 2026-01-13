'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { SessionNote } from '@/hooks/useSessionNotes';
import { formatDistanceToNow } from 'date-fns';

interface NoteItemProps {
  note: SessionNote;
  onDelete: (noteId: string) => void;
}

/**
 * Individual note item in the notes list
 */
export function NoteItem({ note, onDelete }: NoteItemProps) {
  const getTypeIcon = () => {
    switch (note.type) {
      case 'idea':
        return '💡';
      case 'task':
        return '📋';
      case 'insight':
        return '🔖';
      default:
        return '📝';
    }
  };

  const getTypeLabel = () => {
    switch (note.type) {
      case 'idea':
        return 'Idea';
      case 'task':
        return 'Task';
      case 'insight':
        return 'Insight';
      default:
        return 'Note';
    }
  };

  const timeAgo = formatDistanceToNow(note.createdAt, { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-xl">{getTypeIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-white/60 font-medium">
              {getTypeLabel()}
            </span>
            <span className="text-xs text-white/40">•</span>
            <span className="text-xs text-white/40">{timeAgo}</span>
          </div>
          <p className="text-sm text-white/90 whitespace-pre-wrap break-words">
            {note.content}
          </p>
        </div>
        <button
          onClick={() => onDelete(note.id)}
          className="flex-shrink-0 p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          aria-label="Delete note"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
