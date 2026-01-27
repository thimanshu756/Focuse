import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api.service';
import { WeeklyInsightResponse, GenerateInsightsRequest } from '@/types/weekly-insights.types';
import { Alert } from 'react-native';

interface UseWeeklyInsightsReturn {
    insight: WeeklyInsightResponse | null;
    isLoading: boolean;
    isGenerating: boolean;
    error: string | null;
    generateInsights: (options?: GenerateInsightsRequest) => Promise<void>;
    markAsRead: () => Promise<void>;
    refetchInsights: () => Promise<void>;
}

export function useWeeklyInsights(): UseWeeklyInsightsReturn {
    const [insight, setInsight] = useState<WeeklyInsightResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get('/insights', {
                params: {
                    page: 1,
                    limit: 1,
                },
            });

            const { data } = response;

            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                setInsight(data.data[0]);
            } else {
                setInsight(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch insights:', err);
            // Don't show error for 404 or empty results
            if (err.response?.status !== 404 && err.response?.status !== 400) {
                setError('Failed to load insights.');
            } else {
                setInsight(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    const generateInsights = useCallback(
        async (options?: GenerateInsightsRequest) => {
            setIsGenerating(true);
            setError(null);

            try {
                const response = await api.post('/insights/generate', options || {});
                const { data } = response;

                if (data.success && data.data) {
                    setInsight(data.data);
                    Alert.alert('Success', options?.forceRegenerate
                        ? 'Insights regenerated!'
                        : 'Your weekly insights are ready!'
                    );
                } else {
                    await fetchInsights();
                }
            } catch (err: any) {
                console.error('Failed to generate insights:', err);

                if (err.response?.status === 429) {
                    Alert.alert('Rate Limit', 'Free users can generate insights once per week. Upgrade to Pro for unlimited access.');
                    setError('Rate limited');
                } else if (err.response?.status === 400) {
                    Alert.alert('Not ready', 'Not enough data to generate insights. Complete at least one session this week.');
                    setError('Not enough data');
                } else {
                    Alert.alert('Error', 'Failed to generate insights. Please try again.');
                    setError('Failed to generate');
                }
            } finally {
                setIsGenerating(false);
            }
        },
        [fetchInsights]
    );

    const markAsRead = useCallback(async () => {
        if (!insight || insight.isRead) return;

        try {
            await api.patch(`/insights/${insight.id}/read`);
            setInsight((prev) =>
                prev
                    ? { ...prev, isRead: true, readAt: new Date().toISOString() }
                    : null
            );
        } catch (err) {
            console.error('Failed to mark insight as read:', err);
        }
    }, [insight]);

    return {
        insight,
        isLoading,
        isGenerating,
        error,
        generateInsights,
        markAsRead,
        refetchInsights: fetchInsights,
    };
}
