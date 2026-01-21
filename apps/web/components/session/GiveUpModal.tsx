'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

// Button Component
const Button = ({
  children,
  onClick,
  disabled,
  isLoading,
  variant = 'primary',
  className = '',
  ref,
  ...props
}: any) => {
  const baseStyles =
    'h-[52px] rounded-full font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variants = {
    primary:
      'bg-[#D7F50A] text-[#0F172A] hover:bg-[#E9FF6A] active:scale-[0.98]',
    secondary:
      'bg-white text-[#0F172A] hover:bg-gray-50 active:scale-[0.98] shadow-sm',
    ghost:
      'bg-transparent text-[#0F172A] hover:bg-gray-100 active:scale-[0.98]',
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

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
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="giveup-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 text-center space-y-6 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center">
              <AlertTriangle
                className="h-10 w-10 text-red-500"
                strokeWidth={2}
              />
            </div>
          </motion.div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h2
              id="giveup-title"
              className="text-[22px] font-semibold text-[#0F172A] leading-tight"
            >
              Give Up Session?
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed max-w-sm mx-auto">
              Your tree will wither and this session won't count toward your
              streak.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              ref={cancelButtonRef}
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
              aria-label="No, keep going"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
              <span>Keep going</span>
            </Button>
            <Button
              variant="secondary"
              onClick={onConfirm}
              disabled={isLoading}
              isLoading={isLoading}
              className="flex-1 !bg-red-500 !text-white hover:!bg-red-600 shadow-sm"
              aria-label="Yes, give up"
            >
              Give up
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Demo
export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] p-8 flex items-center justify-center">
      <GiveUpModal
        onConfirm={() => console.log('Confirmed')}
        onCancel={() => console.log('Cancelled')}
        isLoading={false}
        elapsedMinutes={23}
        progressPercent={67}
        notesCount={3}
        willBreakStreak={true}
      />
    </div>
  );
}
