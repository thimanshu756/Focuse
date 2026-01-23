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
 * Draggable note component aligned with design.json
 * Uses soft colors, rounded shapes, and clean card aesthetic
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

  // Design System Colors from design.json (Implied/Approximate)
  // Using Soft Pastels to match "Modern soft productivity UI"
  const getColorScheme = () => {
    switch (note.type) {
      case 'idea':
        return {
          bg: 'bg-[#111111]', // Card Dark
          border: 'border-yellow-500/30',
          accent: 'text-yellow-400',
          icon: '💡',
          label: 'Idea',
        };
      case 'task':
        return {
          bg: 'bg-[#111111]',
          border: 'border-blue-500/30',
          accent: 'text-blue-400',
          icon: '📋',
          label: 'Task',
        };
      case 'insight':
        return {
          bg: 'bg-[#111111]',
          border: 'border-purple-500/30',
          accent: 'text-purple-400',
          icon: '🔖',
          label: 'Insight',
        };
      default:
        return {
          bg: 'bg-[#111111]',
          border: 'border-green-500/30',
          accent: 'text-green-400',
          icon: '📝',
          label: 'Note',
        };
    }
  };

  const scheme = getColorScheme();

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

      // Constrain to viewport (with some padding)
      const maxX =
        window.innerWidth - (noteRef.current?.offsetWidth || 300) - 20;
      const maxY =
        window.innerHeight - (noteRef.current?.offsetHeight || 200) - 20;

      const constrainedX = Math.max(20, Math.min(newX, maxX));
      const constrainedY = Math.max(80, Math.min(newY, maxY)); // Keep below header

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
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 60 : 50,
      }}
      className={`
        rounded-[24px] border shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-md
        ${scheme.bg} ${scheme.border}
        ${isDragging ? 'cursor-grabbing scale-[1.02]' : 'cursor-default'}
        transition-shadow duration-200
      `}
    >
      <div className="w-[280px] md:w-[320px] overflow-hidden rounded-[24px]">
        {/* Header with drag handle */}
        <div
          className={`flex items-center justify-between p-4 border-b ${scheme.border} cursor-grab active:cursor-grabbing bg-white/5`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="flex items-center gap-3">
            <GripVertical size={16} className="text-white/20" />
            <span className="text-xl">{scheme.icon}</span>
            <div className="flex flex-col">
              <span
                className={`text-sm font-semibold ${scheme.accent} tracking-wide`}
              >
                {scheme.label}
              </span>
              <span className="text-[10px] text-white/40 font-medium">
                {timeAgo}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Delete note"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5">
              <p className="text-sm text-white/80 whitespace-pre-wrap break-words leading-relaxed font-light">
                {note.content}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
