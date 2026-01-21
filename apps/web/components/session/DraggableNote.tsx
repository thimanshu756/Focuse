'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';
import { SessionNote } from '@/hooks/useSessionNotes';
import { formatDistanceToNow } from 'date-fns';

interface DraggableNoteProps {
  note: SessionNote;
  onDelete: (noteId: string) => void;
  onPositionChange?: (noteId: string, x: number, y: number) => void;
  initialPosition?: { x: number; y: number };
}

/**
 * Draggable note component that can be positioned anywhere on screen
 * with improved visibility and color coding
 */
export function DraggableNote({
  note,
  onDelete,
  onPositionChange,
  initialPosition,
}: DraggableNoteProps) {
  const [position, setPosition] = useState(
    initialPosition || {
      x: Math.random() * (window.innerWidth - 300),
      y: Math.random() * (window.innerHeight - 200),
    }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);

  // Get color scheme based on note type
  const getColorScheme = () => {
    switch (note.type) {
      case 'idea':
        return {
          bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
          border: 'border-yellow-300',
          text: 'text-gray-900',
          icon: '💡',
          label: 'Idea',
          shadow: 'shadow-yellow-500/50',
        };
      case 'task':
        return {
          bg: 'bg-gradient-to-br from-blue-400 to-blue-500',
          border: 'border-blue-300',
          text: 'text-white',
          icon: '📋',
          label: 'Task',
          shadow: 'shadow-blue-500/50',
        };
      case 'insight':
        return {
          bg: 'bg-gradient-to-br from-purple-400 to-purple-500',
          border: 'border-purple-300',
          text: 'text-white',
          icon: '🔖',
          label: 'Insight',
          shadow: 'shadow-purple-500/50',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-green-400 to-green-500',
          border: 'border-green-300',
          text: 'text-gray-900',
          icon: '📝',
          label: 'Note',
          shadow: 'shadow-green-500/50',
        };
    }
  };

  const colorScheme = getColorScheme();

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartPos.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newX = clientX - dragStartPos.current.x;
      const newY = clientY - dragStartPos.current.y;

      // Constrain to viewport
      const maxX = window.innerWidth - (noteRef.current?.offsetWidth || 300);
      const maxY = window.innerHeight - (noteRef.current?.offsetHeight || 200);

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      if (onPositionChange) {
        onPositionChange(note.id, position.x, position.y);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, note.id, onPositionChange, position]);

  const timeAgo = formatDistanceToNow(note.createdAt, { addSuffix: true });

  return (
    <motion.div
      ref={noteRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 60 : 50,
      }}
      className={`${colorScheme.bg} ${colorScheme.border} border-2 rounded-2xl shadow-2xl ${colorScheme.shadow} ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      }`}
    >
      <div className="w-[280px] md:w-[320px]">
        {/* Header with drag handle */}
        <div
          className={`flex items-center justify-between p-3 border-b ${colorScheme.border} cursor-grab active:cursor-grabbing`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripVertical size={16} className={colorScheme.text} />
            <span className="text-2xl">{colorScheme.icon}</span>
            <div className="flex flex-col">
              <span className={`text-sm font-semibold ${colorScheme.text}`}>
                {colorScheme.label}
              </span>
              <span className={`text-xs ${colorScheme.text} opacity-70`}>
                {timeAgo}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 ${colorScheme.text} hover:bg-black/10 rounded-lg transition-colors`}
              aria-label={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className={`p-1.5 ${colorScheme.text} hover:bg-red-500 hover:text-white rounded-lg transition-colors`}
              aria-label="Delete note"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <p
                className={`text-sm ${colorScheme.text} whitespace-pre-wrap break-words leading-relaxed`}
              >
                {note.content}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
