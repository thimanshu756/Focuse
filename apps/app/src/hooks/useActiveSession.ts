import { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await api.get('/sessions/active');

                console.log(
                "session ->",response.data
                );
                
                if (response.data.success && response.data.data) {
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
                setIsLoading(false);
            }
        };

        fetchActiveSession();
    }, []);

    return { session, isLoading, error };
}
