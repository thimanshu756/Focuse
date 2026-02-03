import { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { api } from '@/services/api.service';
import { Session } from '@/types/api.types';
import { getTreeType, TreeType } from '@/utils/tree.utils';
import { isToday, isThisWeek, isThisMonth, isAfter, subDays, startOfDay } from 'date-fns';
import { formatHours } from '@/utils/date.utils';
import { InteractionManager } from 'react-native';

export type DateFilterOption = 'today' | 'week' | 'month' | '30days' | 'all';
export type TreeTypeFilterOption = 'all' | TreeType;

export interface ForestStats {
    totalTrees: number;
    totalTime: number; // seconds
    formattedTime: string;
    currentStreak: number;
}

interface UseForestDataReturn {
    sessions: Session[];
    allSessions: Session[];
    stats: ForestStats;
    isLoading: boolean;
    isFiltering: boolean;
    error: string | null;
    dateFilter: DateFilterOption;
    treeTypeFilter: TreeTypeFilterOption;
    setDateFilter: (filter: DateFilterOption) => void;
    setTreeTypeFilter: (filter: TreeTypeFilterOption) => void;
    refetch: () => Promise<void>;
}

export function useForestData(): UseForestDataReturn {
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dateFilter, setDateFilter] = useState<DateFilterOption>('week');
    const [treeTypeFilter, setTreeTypeFilter] = useState<TreeTypeFilterOption>('all');

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [forestResponse, userResponse] = await Promise.all([
                api.get('/sessions/forest', { params: { limit: 1000 } }),
                api.get('/auth/me'),
            ]);

            if (forestResponse.data.success) {
                setAllSessions(forestResponse.data.data || []);
            }

            if (userResponse.data.success) {
                const userData = userResponse.data.data.user || userResponse.data.data;
                setUserProfile(userData);
            }

        } catch (err: any) {
            console.error('[useForestData] Error:', err);
            setError('Failed to load forest data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle filter changes with smooth transition - use InteractionManager for better responsiveness
    const handleFilterChange = useCallback((filter: DateFilterOption) => {
        setIsFiltering(true);
        // Use InteractionManager to defer the state update until animations are complete
        InteractionManager.runAfterInteractions(() => {
            setDateFilter(filter);
            // Give FlatList time to update before removing loading state
            setTimeout(() => {
                setIsFiltering(false);
            }, 100);
        });
    }, []);

    // Keep track of whether deferred sessions are stale
    const deferredDateFilter = useDeferredValue(dateFilter);
    const isPending = deferredDateFilter !== dateFilter;

    const filteredSessions = useMemo(() => {
        let filtered = allSessions;
        const now = new Date();

        // Date Filter - use deferred value for smooth UI
        switch (deferredDateFilter) {
            case 'today':
                filtered = filtered.filter(s => isToday(new Date(s.startTime)));
                break;
            case 'week':
                filtered = filtered.filter(s => isThisWeek(new Date(s.startTime)));
                break;
            case 'month':
                filtered = filtered.filter(s => isThisMonth(new Date(s.startTime)));
                break;
            case '30days':
                filtered = filtered.filter(s => isAfter(new Date(s.startTime), subDays(startOfDay(now), 30)));
                break;
        }

        // Tree Type Filter
        if (treeTypeFilter !== 'all') {
            filtered = filtered.filter(s => {
                const type = getTreeType(s.duration, s.status);
                return type === treeTypeFilter;
            });
        }

        return filtered;
    }, [allSessions, deferredDateFilter, treeTypeFilter]);

    const stats = useMemo((): ForestStats => {
        const completedSessions = filteredSessions.filter(s => s.status === 'COMPLETED');
        const totalTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);

        return {
            totalTrees: completedSessions.length,
            totalTime,
            formattedTime: formatHours(totalTime),
            currentStreak: userProfile?.currentStreak || 0,
        };
    }, [filteredSessions, userProfile]);

    return {
        sessions: filteredSessions,
        allSessions,
        stats,
        isLoading,
        isFiltering: isFiltering || isPending,
        error,
        dateFilter,
        treeTypeFilter,
        setDateFilter: handleFilterChange,
        setTreeTypeFilter,
        refetch: fetchData,
    };
}
