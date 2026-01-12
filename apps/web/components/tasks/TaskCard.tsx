'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  FileText,
  CheckCircle2,
  Play,
  MoreVertical,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow, isPast, isThisWeek } from 'date-fns';
import { TaskResponse } from '@/types/task.types';

interface TaskCardProps {
  task: TaskResponse;
  onStartSession?: (taskId: string) => void;
  onEdit?: (task: TaskResponse) => void;
  onDelete?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  onClick?: (task: TaskResponse) => void;
}

export function TaskCard({
  task,
  onStartSession,
  onEdit,
  onDelete,
  onComplete,
  onClick,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityIcon = () => {
    if (task.status === 'COMPLETED') {
      return <CheckCircle2 size={18} className="text-green-500" />;
    }
    switch (task.priority) {
      case 'URGENT':
      case 'HIGH':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'MEDIUM':
        return <FileText size={18} className="text-yellow-500" />;
      case 'LOW':
        return <FileText size={18} className="text-blue-500" />;
      default:
        return <FileText size={18} className="text-gray-500" />;
    }
  };

  const getPriorityBadge = () => {
    const colors = {
      URGENT: 'bg-red-100 text-red-700',
      HIGH: 'bg-red-100 text-red-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      LOW: 'bg-blue-100 text-blue-700',
    } as const;
    const priority = task.priority as keyof typeof colors;
    return colors[priority] || colors.MEDIUM;
  };

  const getDueDateText = () => {
    if (!task.dueDate) return null;
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && task.status !== 'COMPLETED') {
      return <span className="text-red-600 font-medium">Overdue</span>;
    }
    return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
  };

  const getProgress = () => {
    if (!task.estimatedMinutes || !task.actualMinutes) return 0;
    return Math.min(
      100,
      Math.round((task.actualMinutes / task.estimatedMinutes) * 100)
    );
  };

  const progress = getProgress();
  const segments = 5;
  const filledSegments = Math.round((progress / 100) * segments);

  const canStartSession =
    task.status === 'TODO' || task.status === 'IN_PROGRESS';

  return (
    <motion.div
      className="bg-white rounded-2xl p-4 shadow-card hover:shadow-lg transition-all cursor-pointer relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(task)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          {getPriorityIcon()}
          <h3 className="text-base font-semibold text-text-primary truncate flex-1">
            {task.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canStartSession && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-accent hover:bg-accent/10"
              onClick={(e) => {
                e.stopPropagation();
                onStartSession?.(task.id);
              }}
            >
              <Play size={16} className="mr-1" />
              Focus
            </Button>
          )}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-text-secondary hover:text-text-primary"
            >
              <MoreVertical size={16} />
            </Button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 min-w-[160px]"
                >
                  {task.status !== 'COMPLETED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onComplete?.(task.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Check size={16} />
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(task);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(task.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
        {task.description ? (
          task.description
        ) : (
          <span className="text-text-muted italic">
            No description provided
          </span>
        )}
      </p>

      {/* Metadata Row */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-3 flex-wrap">
        {getDueDateText() && (
          <>
            <span>{getDueDateText()}</span>
            <span>•</span>
          </>
        )}
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge()}`}
        >
          {task.priority}
        </span>
        {task.estimatedMinutes && (
          <>
            <span>•</span>
            <span>{task.estimatedMinutes}min estimated</span>
          </>
        )}
      </div>

      {/* Progress Bar */}
      {task.estimatedMinutes && (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1">
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < filledSegments ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-text-muted">{progress}% complete</span>
        </div>
      )}
    </motion.div>
  );
}
