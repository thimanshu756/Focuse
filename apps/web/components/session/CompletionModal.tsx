'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TreePine, Coffee, RefreshCw } from 'lucide-react';

interface CompletionModalProps {
  duration: number; // Duration in minutes
  treeTier: 'basic' | 'premium' | 'elite';
  sessionNumber?: number;
  streak?: number;
  notesCount?: number;
  onClose: () => void;
}

export function CompletionModal({
  duration,
  treeTier,
  sessionNumber,
  streak,
  notesCount = 0,
  onClose,
}: CompletionModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus within modal
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    firstElement?.focus();
    modal.addEventListener('keydown', handleTab);

    return () => {
      modal.removeEventListener('keydown', handleTab);
    };
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getTreeTierLabel = () => {
    switch (treeTier) {
      case 'basic':
        return '🌱 Basic Tree';
      case 'premium':
        return '🌳 Premium Tree';
      case 'elite':
        return '🏆 Elite Tree';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="text-6xl"
          >
            🎉
          </motion.div>

          <div className="space-y-2">
            <h2
              id="completion-title"
              className="text-2xl font-semibold text-text-primary"
            >
              Amazing Work!
            </h2>
            <p className="text-base text-text-secondary">
              You focused for {duration} minutes
            </p>
            <p className="text-sm text-text-secondary font-medium">
              {getTreeTierLabel()}
            </p>
            {(sessionNumber || streak) && (
              <p className="text-xs text-text-secondary/80 mt-2">
                {sessionNumber && `Session #${sessionNumber}`}
                {sessionNumber && streak && ' • '}
                {streak && `🔥 ${streak} day streak`}
              </p>
            )}
          </div>

          {/* Stats Block */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Notes captured</span>
              <span className="text-text-primary font-semibold">
                {notesCount}
              </span>
            </div>
            {notesCount > 0 && (
              <p className="text-xs text-text-secondary/80">
                Your thoughts are saved
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <Button
              variant="ghost"
              size="md"
              onClick={() => router.push('/forest')}
              className="flex flex-col items-center gap-2 h-auto py-4"
              aria-label="View Forest"
            >
              <TreePine size={24} />
              <span className="text-sm">View Forest</span>
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                onClose();
                router.push('/dashboard');
              }}
              className="flex flex-col items-center gap-2 h-auto py-4"
              aria-label="Take Break"
            >
              <Coffee size={24} />
              <span className="text-sm">Take Break</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/dashboard')}
              className="flex flex-col items-center gap-2 h-auto py-4"
              aria-label="Start New Session"
            >
              <RefreshCw size={24} />
              <span className="text-sm">New Session</span>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
