'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TaskFilters {
  status: TaskStatus[];
  priority?: TaskPriority;
  search: string;
  quickFilter?: 'high-priority' | 'due-this-week';
}

export function useTaskFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<TaskFilters>({
    status: (searchParams.get('status')?.split(',') as TaskStatus[]) || [
      'TODO',
      'IN_PROGRESS',
    ],
    priority: (searchParams.get('priority') as TaskPriority) || undefined,
    search: searchParams.get('search') || '',
    quickFilter:
      (searchParams.get('quickFilter') as 'high-priority' | 'due-this-week') ||
      undefined,
  });

  const updateFilters = useCallback(
    (newFilters: Partial<TaskFilters>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };

        // Update URL params
        const params = new URLSearchParams();
        if (updated.status.length > 0) {
          params.set('status', updated.status.join(','));
        }
        if (updated.priority) {
          params.set('priority', updated.priority);
        }
        if (updated.search) {
          params.set('search', updated.search);
        }
        if (updated.quickFilter) {
          params.set('quickFilter', updated.quickFilter);
        }

        router.push(`/tasks?${params.toString()}`);

        return updated;
      });
    },
    [router]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      status: ['TODO', 'IN_PROGRESS'],
      priority: undefined,
      search: '',
      quickFilter: undefined,
    });
    router.push('/tasks');
  }, [router]);

  return {
    filters,
    updateFilters,
    clearFilters,
  };
}
