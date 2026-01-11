'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Session } from '@/types/forest.types';
import { formatDuration, getTreeLabel } from '@/utils/tree-helpers';

interface TreeTooltipProps {
  session: Session;
  children: React.ReactNode;
}

export function TreeTooltip({ session, children }: TreeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return; // Don't show tooltip on mobile

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300); // 300ms delay
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const formattedDate = format(new Date(session.startTime), 'MMM d, yyyy');
  const formattedTime = format(new Date(session.startTime), 'h:mm a');
  const treeType = session.treeType || 'basic';

  return (
    <>
      <div
        className="relative w-full h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {/* Tooltip Portal - renders outside to avoid overflow issues */}
      <AnimatePresence>
        {isVisible && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed pointer-events-none"
            style={{
              zIndex: 9999,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xl px-4 py-3 min-w-[200px]">
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-text-primary">
                  {session.taskId ? 'Task Session' : 'Focus Session'}
                </p>
                <p className="text-text-secondary text-xs">
                  {formattedDate} - {formattedTime}
                </p>
                <p className="text-text-secondary text-xs">
                  {formatDuration(session.duration)} focused
                </p>
                <p className="text-xs font-medium text-green-600">
                  {getTreeLabel(treeType)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
