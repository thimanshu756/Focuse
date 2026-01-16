/**
 * useWeeklyInsights Hook
 * Fetches and manages AI-generated weekly insights
 */

import { useState, useCallback, useEffect } from 'react';
import { aiApi } from '@/lib/api';
import type {
  WeeklyInsightResponse,
  GenerateInsightsRequest,
} from '@/types/weekly-insights.types';
import toast from 'react-hot-toast';

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

  /**
   * Fetch existing insights (latest one)
   */
  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await aiApi.get<{
        success: boolean;
        data: WeeklyInsightResponse[]; // Array directly, not nested
        meta?: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>('/insights', {
        params: {
          page: 1,
          limit: 1, // Get only the latest insight
        },
      });

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setInsight(data.data[0]); // Set the latest insight (first item in array)
      } else {
        setInsight(null); // No insights found
      }
    } catch (err: any) {
      console.error('Failed to fetch insights:', err);
      // Don't show error toast for 404 or empty results - it's normal if no insights exist
      if (err.response?.status !== 404 && err.response?.status !== 400) {
        setError('Failed to load insights. Please try again.');
      } else {
        setInsight(null); // No insights found
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch insights on mount
   */
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  /**
   * Generate or retrieve weekly insights
   */
  const generateInsights = useCallback(
    async (options?: GenerateInsightsRequest) => {
      setIsGenerating(true);
      setError(null);

      const loadingToast = toast.loading(
        options?.forceRegenerate
          ? 'Regenerating your insights...'
          : 'Generating your weekly insights...',
        {
          duration: Infinity,
        }
      );

      try {
        const { data } = await aiApi.post<{
          success: boolean;
          data: WeeklyInsightResponse;
          message?: string;
        }>('/insights/generate', options || {});

        if (data.success && data.data) {
          setInsight(data.data);
          toast.dismiss(loadingToast);

          // Show success message
          if (options?.forceRegenerate) {
            toast.success('Insights regenerated!', { duration: 3000 });
          } else {
            toast.success('Your weekly insights are ready!', {
              duration: 3000,
            });
          }
        } else {
          // If generation succeeded but no data, refetch to get the latest
          await fetchInsights();
        }
      } catch (err: any) {
        console.error('Failed to generate insights:', err);

        toast.dismiss(loadingToast);

        // Handle specific error codes
        if (err.response?.status === 429) {
          const errorData = err.response?.data?.error;
          if (errorData?.code === 'INSIGHTS_RATE_LIMITED') {
            const nextAvailable = errorData?.details?.nextAvailableAt;
            const message =
              errorData?.message ||
              'Free users can generate insights once per week. Upgrade to Pro for unlimited access.';

            setError(message);
            toast.error(message, { duration: 5000 });
          } else {
            setError('Too many requests. Please try again later.');
            toast.error('Too many requests. Please slow down.', {
              duration: 4000,
            });
          }
        } else if (err.response?.status === 400) {
          const message =
            err.response?.data?.error?.message ||
            'Not enough data to generate insights. Complete at least one session this week.';
          setError(message);
          toast.error(message, { duration: 5000 });
        } else if (err.response?.status === 504) {
          setError('Request timed out. Please try again.');
          toast.error('The request took too long. Please try again.', {
            duration: 4000,
          });
        } else {
          const message =
            err.response?.data?.error?.message ||
            'Failed to generate insights. Please try again.';
          setError(message);
          toast.error(message, { duration: 4000 });
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [fetchInsights]
  );

  /**
   * Mark insight as read
   */
  const markAsRead = useCallback(async () => {
    if (!insight || insight.isRead) return;

    try {
      await aiApi.patch(`/insights/${insight.id}/read`);
      setInsight((prev) =>
        prev
          ? { ...prev, isRead: true, readAt: new Date().toISOString() }
          : null
      );
    } catch (err) {
      console.error('Failed to mark insight as read:', err);
      // Silent fail - not critical
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
