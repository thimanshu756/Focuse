'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface WakeLockWarningModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function WakeLockWarningModal({
  isVisible,
  onClose,
}: WakeLockWarningModalProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#1e293b] p-6 shadow-xl border border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-yellow-500/10 p-3 text-yellow-500">
                <AlertTriangle size={32} />
              </div>

              <h3 className="mb-2 text-xl font-semibold text-white">
                "No Sleep" Unavailable
              </h3>

              <p className="mb-6 text-sm text-white/70">
                We couldn't keep your screen awake. Your device might go to
                sleep during the session. Please check your system settings or
                keep the device plugged in.
              </p>

              <Button
                variant="primary"
                onClick={onClose}
                className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
              >
                Understood
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
