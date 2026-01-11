'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SessionStats, Period, UserProfile } from '@/types/insights.types';
import { Session } from '@/types/forest.types';

export function useInsightsData(period: Period) {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch stats, user profile, and sessions in parallel
      const [statsResponse, userResponse, sessionsResponse] = await Promise.all(
        [
          api.get(`/sessions/stats?period=${period}`),
          api.get('/auth/me'),
          api.get('/sessions/forest', { params: { limit: 100 } }),
        ]
      );

      if (
        statsResponse.data.success &&
        userResponse.data.success &&
        sessionsResponse.data.success
      ) {
        setStats(statsResponse.data.data);
        setUserProfile(userResponse.data.data);
        setSessions(sessionsResponse.data.data || []);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err: any) {
      console.error('Error fetching insights data:', err);
      setError(
        err.response?.data?.error?.message ||
          'Unable to load analytics. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  return {
    stats,
    userProfile,
    sessions,
    isLoading,
    error,
    refetch: fetchData,
  };
}
