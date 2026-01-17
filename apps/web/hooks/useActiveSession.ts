'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface ActiveSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  duration: number;
  timeElapsed: number;
  status: 'RUNNING' | 'PAUSED';
}

export function useActiveSession() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        // Only show loading state on initial load, not during polls
        if (isInitialLoad.current) {
          setIsLoading(true);
        }
        setError(null);

        const response = await api.get('/sessions/active');

        if (response.data.success && response.data.data?.session) {
          const sessionData = response.data.data.session;
          setSession({
            id: sessionData.id,
            taskId: sessionData.taskId,
            taskTitle: sessionData.task?.title,
            duration: sessionData.duration,
            timeElapsed: sessionData.timeElapsed || 0,
            status: sessionData.status,
          });
        } else {
          setSession(null);
        }
      } catch (error: any) {
        // 404 is expected when no active session
        if (error.response?.status !== 404) {
          setError(
            error.response?.data?.message || 'Failed to check active session'
          );
        }
        setSession(null);
      } finally {
        if (isInitialLoad.current) {
          setIsLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    fetchActiveSession();

    // Poll every 30 seconds for cross-device sync
    const interval = setInterval(fetchActiveSession, 30000);

    return () => clearInterval(interval);
  }, []);

  return { session, isLoading, error };
}
