'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StretchTimerModal } from './StretchTimerModal';
import toast from 'react-hot-toast';

interface PauseOverlayProps {
  onResume: () => void;
  onEndSession: () => void;
  isLoading?: boolean;
}

export function PauseOverlay({
  onResume,
  onEndSession,
  isLoading = false,
}: PauseOverlayProps) {
  const [showStretchTimer, setShowStretchTimer] = useState(false);

  const handleWaterBreak = () => {
    toast('💧 Stay hydrated! Drink some water', {
      icon: '💧',
      duration: 3000,
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    });
  };

  const handleEyeRest = () => {
    toast('👀 Look 20 feet away for 20 seconds', {
      icon: '👀',
      duration: 20000,
      style: {
        background: '#8B5CF6',
        color: '#fff',
      },
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 px-5"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block text-6xl mb-4"
            >
              ⏸️
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Session Paused
            </h2>
            <p className="text-white/60">Take a quick moment to recharge</p>
          </div>

          {/* Quick Break Options */}
          <div className="space-y-3 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setShowStretchTimer(true)}
                className="w-full px-4 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl transition-all text-left text-white/90 hover:text-white flex items-center gap-3 group border border-white/10 hover:border-white/20"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  🚶
                </span>
                <div className="flex-1">
                  <p className="font-medium">Stretch Break</p>
                  <p className="text-xs text-white/50">30 seconds</p>
                </div>
                <span className="text-white/30 group-hover:text-white/60">
                  →
                </span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={handleWaterBreak}
                className="w-full px-4 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl transition-all text-left text-white/90 hover:text-white flex items-center gap-3 group border border-white/10 hover:border-white/20"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  💧
                </span>
                <div className="flex-1">
                  <p className="font-medium">Water Break</p>
                  <p className="text-xs text-white/50">Quick hydration</p>
                </div>
                <span className="text-white/30 group-hover:text-white/60">
                  →
                </span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleEyeRest}
                className="w-full px-4 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl transition-all text-left text-white/90 hover:text-white flex items-center gap-3 group border border-white/10 hover:border-white/20"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  👀
                </span>
                <div className="flex-1">
                  <p className="font-medium">Rest Eyes</p>
                  <p className="text-xs text-white/50">20-20-20 rule</p>
                </div>
                <span className="text-white/30 group-hover:text-white/60">
                  →
                </span>
              </button>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border-t border-white/20 pt-6 space-y-3"
          >
            <Button
              onClick={onResume}
              disabled={isLoading}
              variant="primary"
              size="lg"
              className="w-full py-4 text-lg font-semibold"
            >
              <Play size={20} className="mr-2" />
              Resume Session
            </Button>

            <Button
              onClick={onEndSession}
              disabled={isLoading}
              variant="ghost"
              size="lg"
              className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/10"
            >
              <StopCircle size={18} className="mr-2" />
              End Session Early
            </Button>
          </motion.div>

          {/* Keyboard Hint */}
          <div className="mt-4 text-center text-xs text-white/40">
            Press{' '}
            <kbd className="px-2 py-0.5 bg-white/10 rounded mx-1">Space</kbd> to
            resume
          </div>
        </motion.div>
      </motion.div>

      {/* Stretch Timer Modal */}
      {showStretchTimer && (
        <StretchTimerModal onClose={() => setShowStretchTimer(false)} />
      )}
    </>
  );
}
