'use client';

import { motion } from 'framer-motion';

interface TaskBarProps {
  task: {
    rank: number;
    taskTitle: string;
    hours: string;
    focusTime: number;
  };
  maxTime: number;
  delay: number;
}

export function TaskBar({ task, maxTime, delay }: TaskBarProps) {
  const percentage = maxTime > 0 ? (task.focusTime / maxTime) * 100 : 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Rank number */}
      <div className="text-sm font-medium text-text-secondary w-6 flex-shrink-0">
        {task.rank}.
      </div>

      {/* Task name */}
      <div className="flex-1 min-w-0 sm:min-w-[150px]">
        <p className="text-sm font-medium text-text-primary truncate">
          {task.taskTitle || 'Untitled Task'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative min-w-[120px] sm:min-w-[150px]">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.8,
            delay,
            ease: 'easeOut',
          }}
        />
      </div>

      {/* Time label */}
      <div className="text-sm font-semibold text-text-primary w-16 text-right flex-shrink-0">
        {task.hours}h
      </div>
    </div>
  );
}
