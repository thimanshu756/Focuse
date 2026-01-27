import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api.service';
import * as SecureStore from 'expo-secure-store';
import { InteractionManager } from 'react-native';

export type InsightPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

interface DailyBreakdown {
    date: string;
    focusTime: number;
    completed: number;
}

interface InsightsStats {
    totalFocusTime: number;
    totalSessions: number;
    dailyBreakdown: DailyBreakdown[];
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
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useInsightsData(period: InsightPeriod): UseInsightsDataReturn {
    const [stats, setStats] = useState<InsightsStats | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch generic stats and user profile in parallel
            const [statsResponse, userResponse] = await Promise.all([
                api.get('/sessions/stats', { params: { period } }),
                api.get('/auth/me'),
            ]);

            if (statsResponse.data.success && statsResponse.data.data) {
                setStats(statsResponse.data.data);
            }

            if (userResponse.data.success && userResponse.data.data) {
                // Handle potentially nested user object
                const userData = userResponse.data.data.user || userResponse.data.data;
                setUserProfile(userData);
            }

        } catch (err: any) {
            console.error('[useInsightsData] Error:', err);
            setError(err.response?.data?.message || 'Failed to load insights');
        } finally {
            setIsLoading(false);
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
        isLoading,
        error,
        refetch: fetchData,
    };
}
