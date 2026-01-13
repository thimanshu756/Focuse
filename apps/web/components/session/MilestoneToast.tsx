'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface MilestoneToastProps {
  message: string;
  icon?: string;
}

/**
 * Custom toast component for milestones (optional enhancement)
 * Currently using react-hot-toast, but this could be used for more control
 */
export function MilestoneToast({ message, icon = '🎉' }: MilestoneToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{message}</span>
    </motion.div>
  );
}
