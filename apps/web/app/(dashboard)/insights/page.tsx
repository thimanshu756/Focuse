'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock,
  BarChart3,
  CheckCircle2,
  Flame,
  Download,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useInsightsData } from '@/hooks/useInsightsData';
import { FocusTimeTrendChart } from '@/components/insights/FocusTimeTrendChart';
import { FocusTimesHeatmap } from '@/components/insights/FocusTimesHeatmap';
import { TopTasksChart } from '@/components/insights/TopTasksChart';
import { TreeDistributionChart } from '@/components/insights/TreeDistributionChart';
import { AIInsightsCard } from '@/components/insights/AIInsightsCard';
import { isAuthenticated } from '@/lib/auth';
import { Option } from '@/types/select.types';
import { Period } from '@/types/insights.types';
import {
  formatDuration,
  formatCompletionRate,
  getCompletionRateColor,
  exportToCSV,
} from '@/utils/insights-helpers';
import toast from 'react-hot-toast';

// Period filter options
const periodOptions: Option[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

export default function InsightsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<Period>(
    (searchParams.get('period') as Period) || 'month'
  );

  const { stats, userProfile, sessions, isLoading, error, refetch } =
    useInsightsData(period);

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

  // Update URL when period changes
  useEffect(() => {
    if (mounted) {
      const params = new URLSearchParams(window.location.search);
      params.set('period', period);
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?${params.toString()}`
      );
    }
  }, [period, mounted]);

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
  const isPro = userProfile?.subscriptionTier === 'PRO';
  const currentStreak = userProfile?.currentStreak || stats?.currentStreak || 0;

  // Handle CSV export
  const handleExport = () => {
    if (!stats) {
      toast.error('No data to export');
      return;
    }

    if (isPro) {
      exportToCSV(stats, period);
      toast.success('Report downloaded!');
    } else {
      toast.error('Upgrade to PRO to export insights');
      // Could navigate to upgrade page
      // router.push('/upgrade');
    }
  };

  // Calculate completion rate color
  const completionRate = stats
    ? Math.round(
        (stats.completedSessions / Math.max(stats.totalSessions, 1)) * 100
      )
    : 0;
  const completionColor = getCompletionRateColor(completionRate);

  return (
    <>
      <main className="max-w-7xl mx-auto px-5 md:px-10 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">
                Insights 📊
              </h1>
              <p className="text-sm text-text-secondary mt-2">
                Track your focus patterns and productivity
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Export Button */}
              <Button
                variant={isPro ? 'primary' : 'ghost'}
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
                disabled={isLoading || !stats}
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
                {!isPro && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </Button>

              {/* Period Selector */}
              <div className="w-full sm:w-48">
                <Select
                  options={periodOptions}
                  value={
                    periodOptions.find((opt) => opt.value === period) || null
                  }
                  onChange={(option) => {
                    if (option) {
                      setPeriod(option.value as Period);
                    }
                  }}
                  placeholder="Select period"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats Cards */}
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
        ) : stats?.totalSessions === 0 ? (
          // Empty State
          <Card className="p-12 text-center">
            <div className="text-7xl mb-6">📊</div>
            <h3 className="text-2xl font-semibold text-text-primary mb-3">
              No data yet
            </h3>
            <p className="text-base text-text-secondary mb-8 max-w-md mx-auto">
              Complete sessions to see insights and track your progress
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/dashboard')}
            >
              Start Your First Session →
            </Button>
          </Card>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <StatCard
                icon={Clock}
                label="Focused"
                value={
                  stats
                    ? formatDuration(stats.totalFocusTime)
                    : isLoading
                      ? '...'
                      : '0m'
                }
                color="blue"
                isLoading={isLoading}
              />
              <StatCard
                icon={BarChart3}
                label="Sessions"
                value={stats?.totalSessions || 0}
                color="green"
                isLoading={isLoading}
              />
              <StatCard
                icon={CheckCircle2}
                label="Complete"
                value={
                  stats
                    ? formatCompletionRate(completionRate)
                    : isLoading
                      ? '...'
                      : '0%'
                }
                color={completionColor}
                isLoading={isLoading}
              />
              <StatCard
                icon={Flame}
                label="Day Streak"
                value={currentStreak}
                color="red"
                isLoading={isLoading}
              />
            </motion.div>

            {/* Charts Section - Part 2 & 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
            >
              {/* Focus Time Trend Chart */}
              <FocusTimeTrendChart
                dailyBreakdown={stats?.dailyBreakdown || []}
                period={period}
                isLoading={isLoading}
              />

              {/* Best Focus Times Heatmap */}
              <FocusTimesHeatmap sessions={sessions} isLoading={isLoading} />

              {/* Top Tasks Chart */}
              <TopTasksChart
                taskBreakdown={stats?.taskBreakdown || []}
                isLoading={isLoading}
              />

              {/* Tree Distribution Chart */}
              <TreeDistributionChart
                sessions={sessions.filter((s) => s.status === 'COMPLETED')}
                isLoading={isLoading}
              />
            </motion.div>

            {/* AI Insights Section */}
            {stats && (
              <div className="mt-8">
                <AIInsightsCard stats={stats} isPro={isPro} />
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
