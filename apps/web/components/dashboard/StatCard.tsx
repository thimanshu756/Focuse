'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  isLoading?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = 'blue',
  isLoading = false,
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  if (isLoading) {
    return (
      <div className="bg-bg-card p-6 rounded-3xl shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="h-12 w-12 rounded-2xl bg-gray-200 animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <motion.div
      className="bg-bg-card p-6 rounded-3xl shadow-card"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-3xl font-semibold text-text-primary mb-1">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
    </motion.div>
  );
}
