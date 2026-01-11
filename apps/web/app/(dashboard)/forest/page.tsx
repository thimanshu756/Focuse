'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TreePine, Clock, Flame, AlertCircle } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TreeGrid } from '@/components/forest/TreeGrid';
import { SessionDetailModal } from '@/components/forest/SessionDetailModal';
import { CelebrationModal } from '@/components/forest/CelebrationModal';
import { useForestData } from '@/hooks/useForestData';
import { isAuthenticated } from '@/lib/auth';
import { Option } from '@/types/select.types';
import {
  getTreeEmoji,
  getTreeLabel,
  getTreeDescription,
} from '@/utils/tree-helpers';

// Date filter options
const dateFilterOptions: Option[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
];

// Tree type filter options
const treeTypeFilterOptions: Option[] = [
  { value: 'all', label: 'All Trees' },
  { value: 'basic', label: '🌱 Basic Trees (≤15min)' },
  { value: 'premium', label: '🌳 Premium Trees (16-45min)' },
  { value: 'elite', label: '🏆 Elite Trees (>45min)' },
  { value: 'dead', label: '🪦 Dead Trees (Incomplete)' },
];

export default function ForestPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const {
    sessions,
    allSessions,
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
  } = useForestData();

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication after mount
  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push('/login');
    }
  }, [mounted, router]);

  // Show loading state during SSR and initial mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check authentication after mount
  if (!isAuthenticated()) {
    return null;
  }

  const firstName = userProfile?.name?.split(' ')[0] || 'there';
  const hasCompletedSessions = allSessions.length > 0;
  const hasFilteredSessions = sessions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8]">
      <Header userTier={userProfile?.subscriptionTier} userName={firstName} />

      <main className="max-w-7xl mx-auto px-5 md:px-10 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary flex items-center gap-2">
            Your Forest 🌳
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            Every completed focus session grows a tree in your forest
          </p>
        </motion.div>

        {/* Summary Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          <StatCard
            icon={TreePine}
            label="Trees Grown"
            value={forestStats.totalTrees}
            color="green"
            isLoading={isLoading}
          />
          <StatCard
            icon={Clock}
            label="Total Time"
            value={forestStats.formattedTime}
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            icon={Flame}
            label="Day Streak"
            value={forestStats.currentStreak}
            color="red"
            isLoading={isLoading}
          />
        </motion.div>

        {/* Filter Bar */}
        {hasCompletedSessions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
                  {/* Date Range Filter */}
                  <div className="w-full sm:w-64">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Date Range
                    </label>
                    <Select
                      options={dateFilterOptions}
                      value={
                        dateFilterOptions.find(
                          (opt) => opt.value === dateFilter
                        ) || null
                      }
                      onChange={(option) => {
                        if (option) {
                          setDateFilter(
                            option.value as
                              | 'today'
                              | 'week'
                              | 'month'
                              | '30days'
                              | '90days'
                              | 'all'
                          );
                        }
                      }}
                      placeholder="Select date range"
                    />
                  </div>

                  {/* Tree Type Filter */}
                  <div className="w-full sm:w-64">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Tree Type
                    </label>
                    <Select
                      options={treeTypeFilterOptions}
                      value={
                        treeTypeFilterOptions.find(
                          (opt) => opt.value === treeTypeFilter
                        ) || null
                      }
                      onChange={(option) => {
                        if (option) {
                          setTreeTypeFilter(
                            option.value as
                              | 'all'
                              | 'basic'
                              | 'premium'
                              | 'elite'
                              | 'dead'
                          );
                        }
                      }}
                      placeholder="Select tree type"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(dateFilter !== 'week' || treeTypeFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-6 sm:mt-0"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tree Grid Container / Empty States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {error ? (
            // Error State
            <Card className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-sm text-text-secondary mb-6">{error}</p>
              <Button variant="primary" onClick={refetch}>
                Try Again
              </Button>
            </Card>
          ) : !hasCompletedSessions ? (
            // Empty State - No sessions at all
            <Card className="p-12 text-center">
              <div className="text-7xl mb-6">🌱</div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3">
                No trees yet
              </h3>
              <p className="text-base text-text-secondary mb-8 max-w-md mx-auto">
                Complete your first focus session to grow your forest!
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard')}
              >
                Start Your First Session →
              </Button>
            </Card>
          ) : !hasFilteredSessions ? (
            // Empty State - All filtered out
            <Card className="p-12 text-center">
              <div className="text-7xl mb-6">🔍</div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3">
                No trees found
              </h3>
              <p className="text-base text-text-secondary mb-8 max-w-md mx-auto">
                No trees found for the selected filters. Try adjusting your
                filters.
              </p>
              <Button variant="primary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            // Tree Grid - Forest Scene
            <div className="rounded-3xl overflow-visible bg-gradient-to-b from-sky-100 via-blue-50 to-green-50 shadow-card border border-green-100">
              <TreeGrid
                sessions={sessions}
                onTreeClick={setSelectedSessionId}
                isLoading={isLoading}
              />
            </div>
          )}
        </motion.div>

        {/* Tree Legend */}
        {hasCompletedSessions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Tree Types
              </h3>
              <div className="flex flex-col sm:flex-row gap-6">
                {(['basic', 'premium', 'elite', 'dead'] as const).map(
                  (type) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-3xl">{getTreeEmoji(type)}</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {getTreeLabel(type)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {getTreeDescription(type)}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={
          selectedSessionId
            ? sessions.find((s) => s.id === selectedSessionId) || null
            : null
        }
        onClose={() => setSelectedSessionId(null)}
      />

      {/* Celebration Modal for Milestones */}
      <CelebrationModal sessionCount={allSessions.length} />
    </div>
  );
}
