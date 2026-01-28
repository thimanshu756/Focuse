/**
 * useSessionSync Hook
 * Polls session state from API to keep client in sync with server
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/services/api.service';
import type { Session, SessionResponse } from '@/types/session.types';

interface UseSessionSyncResult {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Sync session state with server
 * @param sessionId Session ID to sync
 * @param pollInterval Polling interval in milliseconds (default: 10000)
 * @returns Session data, loading state, error, and refetch function
 */
export function useSessionSync(
  sessionId: string,
  pollInterval: number = 10000
): UseSessionSyncResult {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  /**
   * Fetch session from API
   */
  const fetchSession = useCallback(async () => {
    // Prevent concurrent fetches
    if (!sessionId || isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      const response = await api.get<SessionResponse>(`/sessions/${sessionId}`);

      if (mountedRef.current) {
        if (response.data.success && response.data.data?.session) {
          setSession(response.data.data.session);
          setError(null);
        } else {
          setError(response.data.error?.message || 'Failed to load session');
        }
      }
    } catch (err: any) {
      if (mountedRef.current) {
        // Handle 404 gracefully (session not found)
        if (err.response?.status === 404) {
          setError('Session not found');
        } else {
          setError(
            err.response?.data?.error?.message ||
              err.message ||
              'Failed to sync session'
          );
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }
  }, [sessionId]);

  // Initial fetch
  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, fetchSession]);

  // Start polling
  useEffect(() => {
    if (!sessionId) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Poll every N seconds
    intervalRef.current = setInterval(fetchSession, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionId, pollInterval, fetchSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    session,
    isLoading,
    error,
    refetch: fetchSession,
  };
}
