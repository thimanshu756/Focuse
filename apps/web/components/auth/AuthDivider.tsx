'use client';

import { motion } from 'framer-motion';

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = 'OR' }: AuthDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative flex items-center gap-4 my-6"
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      <span className="text-sm font-medium text-text-muted px-2">{text}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </motion.div>
  );
}
