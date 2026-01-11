'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { TaskResponse } from '@/apps/server/src/types/task.types';

interface TaskFilters {
  status?: ('TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED')[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  search?: string;
  page?: number;
  limit?: number;
}

interface UseTasksResult {
  tasks: TaskResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTask: (data: any) => Promise<TaskResponse | null>;
  updateTask: (id: string, data: any) => Promise<TaskResponse | null>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<TaskResponse | null>;
}

export function useTasks(filters: TaskFilters = {}): UseTasksResult {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {
        page: filters.page || 1,
        limit: filters.limit || 20,
      };

      if (filters.status && filters.status.length > 0) {
        params.status = filters.status;
      }

      if (filters.priority) {
        params.priority = filters.priority;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      const response = await api.get('/tasks', { params });

      if (response.data.success) {
        setTasks(response.data.data || []);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to load tasks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.status,
    filters.priority,
    filters.search,
    filters.page,
    filters.limit,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (data: any): Promise<TaskResponse | null> => {
      try {
        const response = await api.post('/tasks', data);
        if (response.data.success) {
          await fetchTasks(); // Refresh list
          return response.data.data;
        }
        return null;
      } catch (err: any) {
        throw err;
      }
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (id: string, data: any): Promise<TaskResponse | null> => {
      try {
        const response = await api.put(`/tasks/${id}`, data);
        if (response.data.success) {
          await fetchTasks(); // Refresh list
          return response.data.data;
        }
        return null;
      } catch (err: any) {
        throw err;
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      try {
        await api.delete(`/tasks/${id}`);
        await fetchTasks(); // Refresh list
      } catch (err: any) {
        throw err;
      }
    },
    [fetchTasks]
  );

  const completeTask = useCallback(
    async (id: string): Promise<TaskResponse | null> => {
      try {
        const response = await api.patch(`/tasks/${id}/complete`);
        if (response.data.success) {
          await fetchTasks(); // Refresh list
          return response.data.data;
        }
        return null;
      } catch (err: any) {
        throw err;
      }
    },
    [fetchTasks]
  );

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  };
}
