'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  currentStreak: number;
  totalFocusTime: number;
  completedSessions: number;
  subscriptionTier: 'FREE' | 'PRO';
}

interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  dueDate?: string | Date | null;
}

interface DashboardData {
  user: User | null;
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardData() {
  const [data, setData] = useState<Omit<DashboardData, 'refetch'>>({
    user: null,
    tasks: [],
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      // Parallel API calls
      const [userResponse, tasksResponse] = await Promise.all([
        api.get('/auth/me'),
        api.get('/tasks', {
          params: {
            status: ['TODO', 'IN_PROGRESS'],
            limit: 10,
          },
        }),
      ]);

      setData({
        user: userResponse.data.success
          ? {
              id: userResponse.data.data.user.id,
              name: userResponse.data.data.user.name,
              email: userResponse.data.data.user.email,
              currentStreak: userResponse.data.data.user.currentStreak || 0,
              totalFocusTime: userResponse.data.data.user.totalFocusTime || 0,
              completedSessions:
                userResponse.data.data.user.completedSessions || 0,
              subscriptionTier:
                userResponse.data.data.user.subscriptionTier || 'FREE',
            }
          : null,
        tasks: tasksResponse.data.success
          ? Array.isArray(tasksResponse.data.data)
            ? tasksResponse.data.data
            : tasksResponse.data.data?.tasks || []
          : [],
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setData({
        user: null,
        tasks: [],
        isLoading: false,
        error: error.response?.data?.message || 'Failed to load dashboard data',
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    refetch: fetchData,
  };
}
