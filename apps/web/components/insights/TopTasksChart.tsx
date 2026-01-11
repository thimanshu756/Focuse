'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { TaskBreakdown } from '@/types/insights.types';
import { TaskBar } from './TaskBar';

interface TopTasksChartProps {
  taskBreakdown: TaskBreakdown[];
  isLoading?: boolean;
}

export function TopTasksChart({
  taskBreakdown,
  isLoading = false,
}: TopTasksChartProps) {
  const { topTasks, maxTime } = useMemo(() => {
    if (!taskBreakdown || taskBreakdown.length === 0) {
      return { topTasks: [], maxTime: 0 };
    }

    // Sort by focus time descending, take top 5
    const sorted = [...taskBreakdown]
      .sort((a, b) => b.focusTime - a.focusTime)
      .slice(0, 5)
      .map((task, index) => ({
        ...task,
        rank: index + 1,
        hours: (task.focusTime / 3600).toFixed(1),
      }));

    const max = Math.max(...sorted.map((t) => t.focusTime), 0);

    return { topTasks: sorted, maxTime: max };
  }, [taskBreakdown]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-80 rounded-2xl" />
      </Card>
    );
  }

  if (topTasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎯</span>
          <h3 className="text-lg font-semibold text-text-primary">Top Tasks</h3>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-text-secondary">
          <p>No task data available</p>
          <p className="text-sm mt-2 text-center max-w-xs">
            Link sessions to tasks to see insights here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">🎯</span>
        <h3 className="text-lg font-semibold text-text-primary">Top Tasks</h3>
      </div>

      <div className="space-y-4">
        {topTasks.map((task, index) => (
          <TaskBar
            key={task.taskId}
            task={task}
            maxTime={maxTime}
            delay={index * 0.1}
          />
        ))}
      </div>
    </Card>
  );
}
