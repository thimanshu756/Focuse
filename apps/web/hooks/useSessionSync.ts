'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

interface Session {
  id: string;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  duration: number;
  startTime: Date;
  endTime: Date;
  progress: number;
  timeElapsed: number;
  taskId?: string;
  taskTitle?: string;
}

interface UseSessionSyncResult {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSessionSync(
  sessionId: string,
  pollingInterval = 10000
): UseSessionSyncResult {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchSession = useCallback(async () => {
    // Don't fetch if sessionId is empty
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      const response = await api.get(`/sessions/${sessionId}`);

      if (response.data.success && response.data.data?.session) {
        const sessionData = response.data.data.session;
        setSession({
          id: sessionData.id,
          status: sessionData.status,
          duration: sessionData.duration,
          startTime: new Date(sessionData.startTime),
          endTime: new Date(sessionData.endTime),
          progress: sessionData.progress || 0,
          timeElapsed: sessionData.timeElapsed || 0,
          taskId: sessionData.taskId,
          taskTitle: sessionData.task?.title,
        });
        setError(null);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to fetch session';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [sessionId]);

  // Initial fetch
  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, fetchSession]);

  // Polling - only poll if we have a session
  useEffect(() => {
    if (!sessionId || !session) return;

    const interval = setInterval(() => {
      fetchSession();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [sessionId, session, pollingInterval, fetchSession]);

  return {
    session,
    isLoading,
    error,
    refetch: fetchSession,
  };
}
