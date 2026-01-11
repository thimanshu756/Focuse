'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import {
  Session,
  ForestStats,
  DateFilterOption,
  TreeTypeFilterOption,
  UserProfile,
} from '@/types/forest.types';
import {
  enrichSessionsWithTreeType,
  formatDuration,
  getTreeType,
} from '@/utils/tree-helpers';
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isAfter,
  subDays,
  startOfDay,
} from 'date-fns';

export function useForestData() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('week');
  const [treeTypeFilter, setTreeTypeFilter] =
    useState<TreeTypeFilterOption>('all');

  // Fetch sessions and user profile on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch forest sessions (completed and failed) and user profile in parallel
        // Using optimized forest endpoint that gets both types in a single DB query
        const [forestResponse, userResponse] = await Promise.all([
          api.get('/sessions/forest', {
            params: {
              limit: 100, // Get up to 100 trees for the forest
            },
          }),
          api.get('/auth/me'),
        ]);

        if (forestResponse.data.success && userResponse.data.success) {
          // Sessions already come enriched with task data
          const sessionsData = forestResponse.data.data || [];

          // Enrich sessions with tree type
          const enrichedSessions = enrichSessionsWithTreeType(sessionsData);

          // Sessions are already sorted by startTime descending from API
          setSessions(enrichedSessions);
          setUserProfile(userResponse.data.data);
        } else {
          setError('Failed to load forest data');
        }
      } catch (err: any) {
        console.error('Error fetching forest data:', err);
        setError(
          err.response?.data?.error?.message ||
            'Unable to load forest. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Apply filters to sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Apply date filtering
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter((s) => isToday(new Date(s.startTime)));
        break;
      case 'week':
        filtered = filtered.filter((s) => isThisWeek(new Date(s.startTime)));
        break;
      case 'month':
        filtered = filtered.filter((s) => isThisMonth(new Date(s.startTime)));
        break;
      case '30days':
        filtered = filtered.filter((s) =>
          isAfter(new Date(s.startTime), subDays(startOfDay(now), 30))
        );
        break;
      case '90days':
        filtered = filtered.filter((s) =>
          isAfter(new Date(s.startTime), subDays(startOfDay(now), 90))
        );
        break;
      case 'all':
        // No filtering
        break;
    }

    // Apply tree type filtering
    if (treeTypeFilter !== 'all') {
      filtered = filtered.filter((s) => {
        const sessionTreeType = s.treeType || getTreeType(s.duration, s.status);
        return sessionTreeType === treeTypeFilter;
      });
    }

    return filtered;
  }, [sessions, dateFilter, treeTypeFilter]);

  // Calculate forest statistics from filtered sessions
  const forestStats = useMemo((): ForestStats => {
    // Only count completed sessions for stats
    const completedSessions = filteredSessions.filter(
      (s) => s.status === 'COMPLETED'
    );
    const totalTrees = completedSessions.length;
    const totalTime = completedSessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );

    return {
      totalTrees,
      totalTime,
      formattedTime: formatDuration(totalTime),
      currentStreak: userProfile?.currentStreak || 0,
    };
  }, [filteredSessions, userProfile]);

  // Refetch data
  const refetch = () => {
    setIsLoading(true);
    setError(null);
    // Re-trigger the useEffect
    setSessions([]);
    setUserProfile(null);
  };

  // Clear filters
  const clearFilters = () => {
    setDateFilter('week');
    setTreeTypeFilter('all');
  };

  return {
    sessions: filteredSessions,
    allSessions: sessions,
    userProfile,
    forestStats,
    isLoading,
    error,
    dateFilter,
    treeTypeFilter,
    setDateFilter,
    setTreeTypeFilter,
    clearFilters,
    refetch,
  };
}
