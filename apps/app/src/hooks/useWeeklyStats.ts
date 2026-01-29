import { useState, useEffect } from 'react';
import { api } from '@/services/api.service';

interface DailyData {
    day: string;
    hours: number;
    sessions: number;
}

interface WeeklyStatsReturn {
    data: DailyData[];
    isLoading: boolean;
    error: string | null;
}

export function useWeeklyStats(): WeeklyStatsReturn {
    const [data, setData] = useState<DailyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await api.get('/sessions/stats', {
                    params: { period: 'week' },
                });

                if (response.data.success && response.data.data) {
                    const stats = response.data.data;
                    const dailyBreakdown = stats.dailyBreakdown || [];

                    // Transform to chart format
                    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const chartData: DailyData[] = daysOfWeek.map((day, index) => {
                        const dayData = dailyBreakdown.find((d: any) => {
                            const date = new Date(d.date);
                            return date.getDay() === (index === 6 ? 0 : index + 1);
                        });

                        return {
                            day,
                            hours: dayData
                                ? Number((dayData.focusTime / 3600).toFixed(1))
                                : 0,
                            sessions: dayData?.completed || 0,
                        };
                    });

                    setData(chartData);
                } else {
                    setData([]);
                }
            } catch (error: any) {
                console.error('[useWeeklyStats] Error:', error);
                setError(
                    error.response?.data?.message || 'Failed to load weekly stats'
                );
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { data, isLoading, error };
}
