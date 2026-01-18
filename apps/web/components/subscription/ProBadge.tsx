'use client';

import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function ProBadge({ size = 'md', animated = true }: ProBadgeProps) {
  const sizes = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 12,
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 14,
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 16,
    },
  };

  const Badge = (
    <div
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D7F50A] to-[#E9FF6A] 
        text-[#0F172A] font-semibold rounded-full ${sizes[size].container}`}
    >
      <Crown size={sizes[size].icon} />
      <span>PRO</span>
    </div>
  );

  if (!animated) return Badge;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Badge}
    </motion.div>
  );
}
