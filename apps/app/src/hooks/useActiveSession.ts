import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api.service';

interface ActiveSessionData {
    id: string;
    taskTitle?: string;
    duration: number;
    timeElapsed: number;
}

interface ActiveSessionReturn {
    session: ActiveSessionData | null;
    isLoading: boolean;
    error: string | null;
}

export function useActiveSession(): ActiveSessionReturn {
    const [session, setSession] = useState<ActiveSessionData | null>(null);
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

                console.log(
                    "session ->", response.data
                );

                if (response.data.success && response.data.data?.session) {
                    const sessionData = response.data.data.session;

                    setSession({
                        id: sessionData.id,
                        taskTitle: sessionData.task?.title,
                        duration: sessionData.duration,
                        timeElapsed: sessionData.timeElapsed || 0,
                    });
                } else {
                    setSession(null);
                }
            } catch (error: any) {
                console.error('[useActiveSession] Error:', error);
                // If 404, no active session - this is not an error
                if (error.response?.status === 404) {
                    setSession(null);
                    setError(null);
                } else {
                    setError(
                        error.response?.data?.message || 'Failed to load active session'
                    );
                    setSession(null);
                }
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
