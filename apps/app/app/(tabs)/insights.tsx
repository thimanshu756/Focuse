import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { useInsightsData, InsightPeriod } from '@/hooks/useInsightsData';
import { useAuthStore } from '@/stores/auth.store';
import { PeriodSelector } from '@/components/insights/PeriodSelector';
import { InsightCard } from '@/components/insights/InsightCard';
import { FocusTrendChart } from '@/components/insights/FocusTrendChart';
import { WeeklyAIInsights } from '@/components/insights/WeeklyAIInsights';
import { formatHours } from '@/utils/date.utils';

export default function Insights() {
  const [period, setPeriod] = useState<InsightPeriod>('week');
  const { stats, isLoading, refetch } = useInsightsData(period);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const isPro = user?.subscriptionTier === 'PRO';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const totalFocusFormatted = stats ? formatHours(stats.totalFocusTime) : '0';

  // Calculate completion rate
  const completionRate = stats && stats.totalSessions > 0
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Track your productivity</Text>
      </View>

      <PeriodSelector value={period} onChange={setPeriod} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.accent}
            colors={[COLORS.primary.accent]}
          />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.row}>
            <InsightCard
              label="Focus Hours"
              value={totalFocusFormatted}
              icon="time"
              color={COLORS.info}
              isLoading={isLoading}
            />
            <InsightCard
              label="Sessions"
              value={stats?.totalSessions || 0}
              icon="bar-chart"
              color={COLORS.success}
              isLoading={isLoading}
            />
          </View>
          <View style={styles.row}>
            <InsightCard
              label="Completion"
              value={`${completionRate}%`}
              icon="checkmark-circle"
              color={COLORS.warning} // Using warning color (orange/yellow) for visibility
              isLoading={isLoading}
            />
            <InsightCard
              label="Streak"
              value={stats?.currentStreak || 0}
              icon="flame"
              color={COLORS.error}
              isLoading={isLoading}
            />
          </View>
        </View>

        {/* Focus Trend Chart */}
        <View style={styles.section}>
          <FocusTrendChart
            data={stats?.dailyBreakdown || []}
            period={period}
            isLoading={isLoading}
          />
        </View>

        {/* AI Weekly Insights */}
        <WeeklyAIInsights isPro={isPro} />

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.gradient,
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  statsGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
});
