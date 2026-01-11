'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { TreeAnimation } from '@/components/TreeAnimation';
import { DeadTreeAnimation } from './DeadTreeAnimation';
import { Button } from '@/components/ui/Button';
import { Session } from '@/types/forest.types';
import {
  formatDuration,
  getTreeEmoji,
  getTreeLabel,
  getTreeDescription,
} from '@/utils/tree-helpers';

interface SessionDetailModalProps {
  session: Session | null;
  onClose: () => void;
}

export function SessionDetailModal({
  session,
  onClose,
}: SessionDetailModalProps) {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null
  );

  // Store the element that triggered the modal for focus restoration
  useEffect(() => {
    if (session) {
      setFocusedElement(document.activeElement as HTMLElement);
    }
  }, [session]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (session) {
      window.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      // Restore focus when modal closes
      if (focusedElement) {
        focusedElement.focus();
      }
    };
  }, [session, onClose, focusedElement]);

  if (!session) return null;

  const treeType = session.treeType || 'basic';
  const isDead = treeType === 'dead' || session.status === 'FAILED';
  const task = session.task;
  const formattedDate = format(new Date(session.startTime), 'MMMM d, yyyy');
  const formattedTime = format(new Date(session.startTime), 'h:mm a');
  const formattedDuration = formatDuration(session.duration);
  const durationMinutes = Math.floor(session.duration / 60);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.25 }}
          className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close modal"
            autoFocus
          >
            <X size={24} className="text-text-secondary" />
          </button>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Large Tree Visual */}
            <div className="flex items-center justify-center">
              <div style={{ width: '180px', height: '200px' }}>
                {isDead ? (
                  <DeadTreeAnimation />
                ) : (
                  <TreeAnimation
                    progress={100}
                    treeType={treeType as 'basic' | 'premium' | 'elite'}
                  />
                )}
              </div>
            </div>

            {/* Tree Type Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.3 }}
              className="flex justify-center"
            >
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  isDead
                    ? 'bg-gray-100 text-gray-700'
                    : treeType === 'basic'
                      ? 'bg-green-100 text-green-700'
                      : treeType === 'premium'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                <span className="text-lg">{getTreeEmoji(treeType)}</span>
                <span id="modal-title">
                  {getTreeLabel(treeType)} ({getTreeDescription(treeType)})
                </span>
              </div>
            </motion.div>

            {/* Session Details */}
            <div className="space-y-4">
              {/* Task Name */}
              {task ? (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">
                    {task.priority === 'URGENT'
                      ? '🔴'
                      : task.priority === 'HIGH'
                        ? '🟠'
                        : task.priority === 'MEDIUM'
                          ? '🟡'
                          : '🟢'}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-text-primary">
                      {task.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Task •{' '}
                      {task.priority.charAt(0) +
                        task.priority.slice(1).toLowerCase()}{' '}
                      Priority
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🎯</span>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">
                      General Focus Session
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      No task linked
                    </p>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-text-secondary" />
                <p className="text-sm text-text-secondary">
                  {formattedDate} at {formattedTime}
                </p>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-text-secondary" />
                <p className="text-sm font-medium text-text-primary">
                  {formattedDuration} focused
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                {isDead ? (
                  <>
                    <span className="text-xl">❌</span>
                    <p className="text-sm font-medium text-red-600">
                      Session incomplete
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="text-sm font-medium text-green-600">
                      Session completed
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {!isDead && (
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    Progress: 100%
                  </span>
                  <span className="text-sm text-text-secondary">
                    {durationMinutes}/{durationMinutes} min
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Incomplete Message */}
            {isDead && (
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">
                    This session was not completed.
                  </span>
                  <br />
                  Keep going! Consistency is key to growing a beautiful forest.
                </p>
              </div>
            )}

            {/* Share Button (Disabled) */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                disabled
              >
                <Share2 size={18} />
                <span>Share Achievement</span>
              </Button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                  Coming soon
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
