'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { AlertCircle, FileText, CheckCircle2, Play, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
// Format date helper (will use date-fns when installed)
const formatDistanceToNow = (
  date: Date | string,
  options?: { addSuffix?: boolean }
) => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays > 1 && diffDays < 7) return `in ${diffDays} days`;
  if (diffDays < 0) return `in ${Math.abs(diffDays)} days`;
  return `in ${diffDays} days`;
};

interface TaskCardProps {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  dueDate?: string | Date | null;
  onStartSession?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onClick?: (taskId: string) => void;
}

export function TaskCard({
  id,
  title,
  priority,
  status,
  dueDate,
  onStartSession,
  onEdit,
  onClick,
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  const priorityConfig = {
    URGENT: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    HIGH: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    MEDIUM: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    LOW: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' },
  };

  const statusConfig = {
    COMPLETED: { label: 'Completed', color: 'text-green-600' },
    IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600' },
    TODO: {
      label: dueDate
        ? `Due ${formatDistanceToNow(new Date(dueDate), { addSuffix: true })}`
        : 'Pending',
      color: 'text-text-secondary',
    },
  };

  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
  const statusInfo =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.TODO;
  const Icon = config.icon;

  return (
    <motion.div
      className="bg-bg-card p-4 rounded-2xl shadow-card border-2 border-transparent hover:border-accent/20 transition-all"
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl ${config.bg} flex-shrink-0`}>
            <Icon size={18} className={config.color} />
          </div>
          <div className="flex-1 min-w-0">
            <button onClick={() => onClick?.(id)} className="text-left w-full">
              <h3 className="text-base font-semibold text-text-primary truncate mb-1">
                {title}
              </h3>
            </button>
            <p className={`text-sm ${statusInfo.color}`}>{statusInfo.label}</p>
          </div>
        </div>

        {/* Hover Actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 flex-shrink-0"
          >
            {onStartSession && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartSession(id)}
                className="p-2"
                aria-label={`Start session for ${title}`}
              >
                <Play size={16} />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(id)}
                className="p-2"
                aria-label={`Edit ${title}`}
              >
                <Edit size={16} />
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
