'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface GiveUpModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  elapsedMinutes: number;
  progressPercent: number;
  notesCount: number;
  willBreakStreak?: boolean;
}

export function GiveUpModal({
  onConfirm,
  onCancel,
  isLoading = false,
  elapsedMinutes,
  progressPercent,
  notesCount,
  willBreakStreak = false,
}: GiveUpModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus safe option (Cancel) on mount
  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel, isLoading]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="giveup-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center space-y-6 border-red-500/20">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="flex justify-center"
          >
            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h2
              id="giveup-title"
              className="text-2xl font-semibold text-text-primary"
            >
              Give Up Session?
            </h2>
            <p className="text-base text-text-secondary">
              Your tree will wither and this session will not count toward your
              streak.
            </p>
          </div>

          {/* Loss Summary */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-red-400">Progress lost:</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Time focused</span>
                <span className="text-text-primary font-semibold">
                  {elapsedMinutes} min
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Completion</span>
                <span className="text-text-primary font-semibold">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              {notesCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Notes captured</span>
                  <span className="text-text-primary font-semibold">
                    {notesCount}
                  </span>
                </div>
              )}
              {willBreakStreak && (
                <div className="pt-2 border-t border-red-500/20">
                  <p className="text-xs text-red-400 font-medium">
                    ⚠️ This will break your streak
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              ref={cancelButtonRef}
              variant="ghost"
              size="lg"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2"
              aria-label="No, keep going"
            >
              <ArrowLeft size={18} />
              <span>No, keep going</span>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onConfirm}
              disabled={isLoading}
              isLoading={isLoading}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              aria-label="Yes, give up"
            >
              Yes, give up
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
