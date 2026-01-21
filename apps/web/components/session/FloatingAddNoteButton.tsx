'use client';

import { motion } from 'framer-motion';
import { Plus, StickyNote } from 'lucide-react';

interface FloatingAddNoteButtonProps {
  onClick: () => void;
  noteCount?: number;
  isMobile?: boolean;
}

/**
 * Floating action button for adding notes
 * Positioned at bottom-right with note count badge
 */
export function FloatingAddNoteButton({
  onClick,
  noteCount = 0,
  isMobile = false,
}: FloatingAddNoteButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed ${
        isMobile ? 'bottom-6 right-6' : 'bottom-8 right-8'
      } z-40 group`}
      aria-label="Add note"
    >
      {/* Main Button */}
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-accent to-primary-soft rounded-full shadow-2xl flex items-center justify-center transition-all group-hover:shadow-primary-accent/50">
          <Plus size={28} className="text-gray-900" strokeWidth={2.5} />
        </div>

        {/* Note Count Badge */}
        {noteCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          >
            <span className="text-xs font-bold text-white">{noteCount}</span>
          </motion.div>
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg whitespace-nowrap flex items-center gap-2">
            <StickyNote size={14} />
            <span>Add Note</span>
          </div>
        </div>
      </div>

      {/* Ripple Effect on Hover */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary-accent opacity-0 group-hover:opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  );
}
