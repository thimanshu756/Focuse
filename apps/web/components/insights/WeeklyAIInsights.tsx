/**
 * Weekly AI Insights Component - Redesigned
 * Modern, interactive component with tab-based navigation and better UX
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Zap,
  RefreshCw,
  Crown,
  TrendingDown,
  Clock,
  BarChart3,
  ChevronDown,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWeeklyInsights } from '@/hooks/useWeeklyInsights';
import type {
  WeeklyInsight,
  WeeklyRecommendation,
} from '@/types/weekly-insights.types';

interface WeeklyAIInsightsProps {
  isPro: boolean;
  onUpgrade?: () => void;
}

type TabType = 'overview' | 'action-plan' | 'next-week';

export function WeeklyAIInsights({ isPro, onUpgrade }: WeeklyAIInsightsProps) {
  const {
    insight,
    isLoading,
    isGenerating,
    error,
    generateInsights,
    markAsRead,
  } = useWeeklyInsights();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedRecommendations, setExpandedRecommendations] = useState<
    Set<number>
  >(new Set());

  useEffect(() => {
    if (insight && !insight.isRead) {
      markAsRead();
    }
  }, [insight, markAsRead]);

  // Toggle recommendation expansion
  const toggleRecommendation = (index: number) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRecommendations(newExpanded);
  };

  // Get insight icon based on type
  const getInsightIcon = (type: WeeklyInsight['type']) => {
    const icons = {
      completion_rate: CheckCircle2,
      best_time_of_day: Clock,
      session_length: Target,
      streak_status: Zap,
      productivity_trend: TrendingUp,
      failure_pattern: AlertCircle,
      task_completion: CheckCircle2,
      consistency: BarChart3,
    };
    return icons[type] || Lightbulb;
  };

  // Get priority styling
  const getPriorityStyle = (priority: 'high' | 'medium' | 'low') => {
    const styles = {
      high: {
        bg: 'bg-white border-gray-200 hover:border-gray-300',
        badge: 'bg-red-100 text-red-700',
        icon: 'text-red-600',
      },
      medium: {
        bg: 'bg-white border-gray-200 hover:border-gray-300',
        badge: 'bg-yellow-100 text-yellow-700',
        icon: 'text-yellow-600',
      },
      low: {
        bg: 'bg-white border-gray-200 hover:border-gray-300',
        badge: 'bg-blue-100 text-blue-700',
        icon: 'text-blue-600',
      },
    };
    return styles[priority];
  };

  // Loading state
  if (isLoading && !insight) {
    return (
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D7F50A] mb-4">
            <Sparkles className="h-8 w-8 text-gray-800 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Loading Insights...
          </h3>
          <p className="text-sm text-text-secondary">
            Checking for your weekly insights
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </Card>
    );
  }

  // Empty state
  if (!insight && !isGenerating && !error && !isLoading) {
    return (
      <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#D7F50A] to-[#E9FF6A] mb-6">
            <Sparkles className="h-10 w-10 text-gray-800" />
          </div>
          <h3 className="text-2xl font-semibold text-text-primary mb-3">
            Get Your AI-Powered Insights
          </h3>
          <p className="text-base text-text-secondary mb-8 max-w-md mx-auto">
            Let AI analyze your focus patterns and provide personalized
            recommendations to boost your productivity.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => generateInsights()}
            className="flex items-center gap-2 mx-auto"
          >
            <Sparkles size={20} />
            Generate Weekly Insights
          </Button>
          {!isPro && (
            <p className="text-sm text-text-muted mt-4">
              Free users: 1 insight per week • Pro users: Unlimited
            </p>
          )}
        </motion.div>
      </Card>
    );
  }

  // Error state
  if (error && !insight) {
    return (
      <Card className="p-8 text-center bg-red-50">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {error}
        </h3>
        <Button
          variant="primary"
          onClick={() => generateInsights()}
          disabled={isGenerating}
          className="mt-4"
        >
          {isGenerating ? 'Generating...' : 'Try Again'}
        </Button>
      </Card>
    );
  }

  // Generating state
  if (isGenerating && !insight) {
    return (
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D7F50A] mb-4">
            <Sparkles className="h-8 w-8 text-gray-800 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Generating Your Insights...
          </h3>
          <p className="text-sm text-text-secondary">
            AI is analyzing your focus patterns. This may take 5-10 seconds.
          </p>

          {/* Progress indicators */}
          <div className="mt-6 space-y-3 max-w-md mx-auto">
            <motion.div
              className="flex items-center gap-3 text-sm text-text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0 }}
            >
              <div className="w-5 h-5 rounded-full bg-[#D7F50A] flex items-center justify-center">
                <Check size={12} className="text-gray-800" />
              </div>
              Analyzing your focus sessions
            </motion.div>
            <motion.div
              className="flex items-center gap-3 text-sm text-text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
              Identifying patterns and trends
            </motion.div>
            <motion.div
              className="flex items-center gap-3 text-sm text-text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <div className="w-5 h-5 rounded-full bg-gray-200" />
              Creating personalized recommendations
            </motion.div>
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
      </Card>
    );
  }

  if (!insight) return null;

  // Tabs configuration
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'action-plan' as TabType, label: 'Action Plan', icon: Target },
    { id: 'next-week' as TabType, label: 'Next Week', icon: Calendar },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Hero Section - One Lever to Pull */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#D7F50A] via-[#E9FF6A] to-[#D7F50A]">
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/90 rounded-2xl backdrop-blur-sm">
                <Target className="h-6 w-6 text-gray-800" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Your #1 Priority
                </h2>
                <p className="text-sm text-gray-700">
                  Week of{' '}
                  {new Date(insight.weekStart).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(insight.weekEnd).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isPro && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUpgrade}
                  className="flex items-center gap-1 text-gray-800 hover:bg-white/50"
                >
                  <Crown size={16} />
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateInsights({ forceRegenerate: true })}
                disabled={isGenerating}
                className="text-gray-800 hover:bg-white/50"
                aria-label="Regenerate insights"
              >
                <RefreshCw
                  size={16}
                  className={isGenerating ? 'animate-spin' : ''}
                />
              </Button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6">
            <p className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
              {insight.oneLeverToPull}
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-800/5 rounded-full blur-2xl" />
      </Card>

      {/* Tab Navigation */}
      <Card className="p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-[#D7F50A] text-gray-800'
                    : 'text-text-secondary hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* AI Narrative */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    AI Analysis
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Based on your activity this week
                  </p>
                </div>
              </div>
              <p className="text-base text-text-primary leading-relaxed">
                {insight.narrative}
              </p>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insight.insights.map((item, index) => {
                const Icon = getInsightIcon(item.type);
                const severityColors = {
                  critical: 'from-red-50 to-red-100 border-red-200',
                  warning: 'from-yellow-50 to-yellow-100 border-yellow-200',
                  info: 'from-blue-50 to-blue-100 border-blue-200',
                };
                const bgGradient = severityColors[item.severity || 'info'];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-5 bg-gradient-to-br ${bgGradient} border-2`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Icon size={24} className="text-gray-800" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary mb-3">
                            {item.message}
                          </p>
                          {item.metric && (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-gray-800">
                                {item.metric.current}
                              </span>
                              {item.metric.change !== undefined && (
                                <div className="flex items-center gap-1">
                                  {item.metric.trend === 'up' ? (
                                    <TrendingUp
                                      size={16}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <TrendingDown
                                      size={16}
                                      className="text-red-600"
                                    />
                                  )}
                                  <span
                                    className={`text-sm font-semibold ${
                                      item.metric.trend === 'up'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    {Math.abs(item.metric.change)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'action-plan' && (
          <motion.div
            key="action-plan"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Recommendations Header */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-text-primary">
                  Personalized Recommendations
                </h3>
              </div>
              <p className="text-sm text-text-secondary">
                {insight.recommendations.length} recommendations to boost your
                productivity
              </p>
            </Card>

            {/* Recommendations List */}
            <div className="space-y-3">
              {insight.recommendations
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((rec, index) => {
                  const style = getPriorityStyle(rec.priority);
                  const isExpanded = expandedRecommendations.has(index);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card
                        className={`p-5 border-2 transition-all cursor-pointer ${style.bg}`}
                        onClick={() => toggleRecommendation(index)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="text-base font-semibold text-text-primary">
                                {rec.action}
                              </h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className={style.badge}>
                                  {rec.priority}
                                </Badge>
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown
                                    size={18}
                                    className="text-gray-600"
                                  />
                                </motion.div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="space-y-3 overflow-hidden"
                                >
                                  <div className="pt-2 space-y-2">
                                    <div className="flex items-start gap-2">
                                      <Info
                                        size={16}
                                        className="text-gray-600 mt-0.5 flex-shrink-0"
                                      />
                                      <p className="text-sm text-text-secondary">
                                        {rec.reason}
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2 bg-white/70 rounded-xl p-3">
                                      <Zap
                                        size={16}
                                        className="text-green-600 mt-0.5 flex-shrink-0"
                                      />
                                      <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">
                                          Expected Impact
                                        </p>
                                        <p className="text-sm font-semibold text-green-700">
                                          {rec.expectedImpact}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {activeTab === 'next-week' && (
          <motion.div
            key="next-week"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Week Goal */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-700 mb-2">
                    Goal for Next Week
                  </h3>
                  <p className="text-lg font-semibold text-gray-800 mb-4">
                    {insight.nextWeekPlan.goal}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">Sessions</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {insight.nextWeekPlan.suggestedSessions}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">Duration</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {insight.nextWeekPlan.suggestedDuration}
                        <span className="text-sm font-normal text-gray-600">
                          {' '}
                          min
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Best Time Slots */}
            {insight.nextWeekPlan.bestTimeSlots.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Best Time Slots
                  </h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  Based on your most productive times
                </p>
                <div className="flex flex-wrap gap-2">
                  {insight.nextWeekPlan.bestTimeSlots.map((slot, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
                        {slot}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* Focus Areas */}
            {insight.nextWeekPlan.focusAreas.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Focus Areas
                  </h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  Key areas to concentrate on
                </p>
                <div className="space-y-2">
                  {insight.nextWeekPlan.focusAreas.map((area, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl"
                    >
                      <ArrowRight
                        size={16}
                        className="text-purple-600 flex-shrink-0"
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {area}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-text-muted">
          Generated by {insight.model} in{' '}
          {(insight.generationLatencyMs / 1000).toFixed(1)}s
        </p>
      </div>
    </motion.div>
  );
}
