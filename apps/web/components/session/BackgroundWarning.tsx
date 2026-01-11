'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface BackgroundWarningProps {
  isVisible: boolean;
}

export function BackgroundWarning({ isVisible }: BackgroundWarningProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-40 bg-yellow-500 text-white px-5 py-3 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">
              ⚠️ You left the app! Your tree is struggling... Stay focused to
              keep it alive.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
