import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api.service';
import * as SecureStore from 'expo-secure-store';
import { InteractionManager } from 'react-native';
import { Session } from '@/types/session.types';

export type InsightPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

interface DailyBreakdown {
    date: string;
    focusTime: number;
    completed: number;
}

interface TaskBreakdown {
    taskId: string;
    taskTitle: string;
    sessions: number;
    focusTime: number; // in seconds
}

interface InsightsStats {
    totalFocusTime: number;
    totalSessions: number;
    dailyBreakdown: DailyBreakdown[];
    taskBreakdown: TaskBreakdown[];
    completedSessions: number;
    currentStreak: number;
}

interface UserProfile {
    id: string;
    subscriptionTier: 'FREE' | 'PRO';
    createdAt: string;
    // Add other fields as needed
}

interface UseInsightsDataReturn {
    stats: InsightsStats | null;
    userProfile: UserProfile | null;
    sessions: Session[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    silentRefetch: () => Promise<void>;
}

export function useInsightsData(period: InsightPeriod): UseInsightsDataReturn {
    const [stats, setStats] = useState<InsightsStats | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setIsLoading(true);
            }
            setError(null);

            // Fetch stats, user profile, and sessions in parallel
            const [statsResponse, userResponse, sessionsResponse] = await Promise.all([
                api.get('/sessions/stats', { params: { period } }),
                api.get('/auth/me'),
                api.get('/sessions/forest', { params: { limit: 100 } }),
            ]);

            if (statsResponse.data.success && statsResponse.data.data) {
                setStats(statsResponse.data.data);
            }

            if (userResponse.data.success && userResponse.data.data) {
                // Handle potentially nested user object
                const userData = userResponse.data.data.user || userResponse.data.data;
                setUserProfile(userData);
            }

            if (sessionsResponse.data.success && sessionsResponse.data.data) {
                setSessions(sessionsResponse.data.data.sessions || sessionsResponse.data.data || []);
            }

        } catch (err: any) {
            console.error('[useInsightsData] Error:', err);
            if (!silent) {
                setError(err.response?.data?.message || 'Failed to load insights');
            }
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    }, [period]);

    useEffect(() => {
        // Wrap in InteractionManager to avoid stutter during navigation transitions
        const interactionPromise = InteractionManager.runAfterInteractions(() => {
            fetchData();
        });

        return () => interactionPromise.cancel();
    }, [fetchData]);

    return {
        stats,
        userProfile,
        sessions,
        isLoading,
        error,
        refetch: () => fetchData(false),
        silentRefetch: () => fetchData(true),
    };
}
