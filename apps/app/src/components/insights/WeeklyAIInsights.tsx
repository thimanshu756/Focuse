/**
 * Weekly AI Insights Component - Premium Redesign
 * Mobile-first, production-ready component for AI-generated weekly insights
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { useWeeklyInsights } from '@/hooks/useWeeklyInsights';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// TYPES
// ============================================================================

interface WeeklyAIInsightsProps {
    isPro: boolean;
    onUpgrade?: () => void;
}

type TabType = 'overview' | 'action-plan' | 'next-week';

interface TabItem {
    id: TabType;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: 'analytics-outline' },
    { id: 'action-plan', label: 'Action Plan', icon: 'bulb-outline' },
    { id: 'next-week', label: 'Next Week', icon: 'calendar-outline' },
];

const INSIGHT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    completion_rate: 'checkmark-circle',
    best_time_of_day: 'sunny',
    session_length: 'timer',
    streak_status: 'flame',
    productivity_trend: 'trending-up',
    failure_pattern: 'warning',
    task_completion: 'checkmark-done',
    consistency: 'pulse',
};

const PRIORITY_CONFIG = {
    high: {
        color: '#DC2626',
        bgColor: 'rgba(220, 38, 38, 0.08)',
        label: 'High Priority',
    },
    medium: {
        color: '#D97706',
        bgColor: 'rgba(217, 119, 6, 0.08)',
        label: 'Medium',
    },
    low: {
        color: '#2563EB',
        bgColor: 'rgba(37, 99, 235, 0.08)',
        label: 'Low',
    },
};

const SEVERITY_CONFIG = {
    critical: {
        color: '#DC2626',
        bgColor: 'rgba(220, 38, 38, 0.06)',
        borderColor: 'rgba(220, 38, 38, 0.15)',
    },
    warning: {
        color: '#D97706',
        bgColor: 'rgba(217, 119, 6, 0.06)',
        borderColor: 'rgba(217, 119, 6, 0.15)',
    },
    info: {
        color: '#2563EB',
        bgColor: 'rgba(37, 99, 235, 0.06)',
        borderColor: 'rgba(37, 99, 235, 0.15)',
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateRange = (start: string, end: string): string => {
    return `${formatDate(start)} - ${formatDate(end)}`;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Loading State
const LoadingState = () => (
    <View style={styles.stateContainer}>
        <View style={styles.loadingContent}>
            <View style={styles.shimmerIcon}>
                <ActivityIndicator size="small" color={COLORS.primary.accent} />
            </View>
            <Text style={styles.stateTitle}>Loading Insights...</Text>
            <Text style={styles.stateSubtitle}>Fetching your weekly analysis</Text>
        </View>
    </View>
);

// Empty State - CTA to generate insights
const EmptyState = ({
    isPro,
    isGenerating,
    onGenerate,
}: {
    isPro: boolean;
    isGenerating: boolean;
    onGenerate: () => void;
}) => (
    <View style={styles.stateContainer}>
        <View style={styles.emptyContent}>
            {/* Premium Badge */}
            <View style={styles.premiumBadge}>
                <Ionicons name="sparkles" size={14} color={COLORS.text.primary} />
                <Text style={styles.premiumBadgeText}>AI-Powered</Text>
            </View>

            {/* Icon */}
            <View style={styles.emptyIconContainer}>
                <LinearGradient
                    colors={[COLORS.primary.accent, COLORS.primary.soft]}
                    style={styles.emptyIconGradient}
                >
                    <Ionicons name="analytics" size={32} color={COLORS.text.primary} />
                </LinearGradient>
            </View>

            {/* Content */}
            <Text style={styles.emptyTitle}>Unlock Your Potential</Text>
            <Text style={styles.emptyDescription}>
                Let CHITRA analyze your focus patterns and provide personalized insights to boost your productivity.
            </Text>

            {/* Benefits */}
            <View style={styles.benefitsList}>
                {[
                    'Personalized recommendations',
                    'Pattern analysis & trends',
                    'Weekly goal planning',
                ].map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                ))}
            </View>

            {/* CTA Button */}
            <Pressable
                onPress={onGenerate}
                disabled={isGenerating}
                style={({ pressed }) => [
                    styles.generateButton,
                    pressed && styles.generateButtonPressed,
                    isGenerating && styles.generateButtonDisabled,
                ]}
            >
                <Ionicons name="sparkles" size={18} color={COLORS.text.primary} />
                <Text style={styles.generateButtonText}>
                    {isGenerating ? 'Generating...' : 'Generate Weekly Insights'}
                </Text>
            </Pressable>

            {/* Limit Info */}
            {!isPro && (
                <Text style={styles.limitInfo}>
                    Free: 1 insight/week • <Text style={styles.limitInfoHighlight}>Pro: Unlimited</Text>
                </Text>
            )}
        </View>
    </View>
);

// Error State
const ErrorState = ({
    error,
    isGenerating,
    onRetry,
}: {
    error: string;
    isGenerating: boolean;
    onRetry: () => void;
}) => (
    <View style={styles.stateContainer}>
        <View style={styles.errorContent}>
            <View style={styles.errorIconContainer}>
                <Ionicons name="cloud-offline" size={40} color={COLORS.text.secondary} />
            </View>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorDescription}>{error}</Text>
            <Pressable
                onPress={onRetry}
                disabled={isGenerating}
                style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.retryButtonPressed,
                ]}
            >
                <Ionicons name="refresh" size={18} color={COLORS.text.primary} />
                <Text style={styles.retryButtonText}>
                    {isGenerating ? 'Retrying...' : 'Try Again'}
                </Text>
            </Pressable>
        </View>
    </View>
);

// Generating State with Progress
const GeneratingState = () => {
    const steps = [
        { label: 'Analyzing focus sessions', status: 'completed' },
        { label: 'Identifying patterns', status: 'active' },
        { label: 'Generating recommendations', status: 'pending' },
    ];

    return (
        <View style={styles.stateContainer}>
            <View style={styles.generatingContent}>
                {/* Animated Icon */}
                <View style={styles.generatingIconContainer}>
                    <LinearGradient
                        colors={[COLORS.primary.accent, COLORS.primary.soft]}
                        style={styles.generatingIconGradient}
                    >
                        <ActivityIndicator size="large" color={COLORS.text.primary} />
                    </LinearGradient>
                </View>

                <Text style={styles.generatingTitle}>Generating Insights...</Text>
                <Text style={styles.generatingSubtitle}>
                    CHITRA is analyzing your data. This takes about 10 seconds.
                </Text>

                {/* Progress Steps */}
                <View style={styles.progressSteps}>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.progressStep}>
                            <View
                                style={[
                                    styles.progressStepIcon,
                                    step.status === 'completed' && styles.progressStepCompleted,
                                    step.status === 'active' && styles.progressStepActive,
                                ]}
                            >
                                {step.status === 'completed' ? (
                                    <Ionicons name="checkmark" size={12} color={COLORS.text.primary} />
                                ) : step.status === 'active' ? (
                                    <ActivityIndicator size="small" color={COLORS.text.primary} />
                                ) : null}
                            </View>
                            <Text
                                style={[
                                    styles.progressStepText,
                                    step.status === 'completed' && styles.progressStepTextCompleted,
                                    step.status === 'active' && styles.progressStepTextActive,
                                ]}
                            >
                                {step.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

// Tab Navigation Component
const TabNavigation = ({
    activeTab,
    onTabChange,
}: {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}) => (
    <View style={styles.tabContainer}>
        {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
                <Pressable
                    key={tab.id}
                    onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        onTabChange(tab.id);
                    }}
                    style={[styles.tab, isActive && styles.tabActive]}
                >
                    <Ionicons
                        name={tab.icon}
                        size={16}
                        color={isActive ? COLORS.text.primary : COLORS.text.secondary}
                    />
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                        {tab.label}
                    </Text>
                </Pressable>
            );
        })}
    </View>
);

// Hero Card - "Your #1 Priority"
const HeroCard = ({
    oneLeverToPull,
    weekStart,
    weekEnd,
    isGenerating,
    canRegenerate,
    onRegenerate,
}: {
    oneLeverToPull: string;
    weekStart: string;
    weekEnd: string;
    isGenerating: boolean;
    canRegenerate: boolean;
    onRegenerate: () => void;
}) => (
    <View style={styles.heroCard}>
        <LinearGradient
            colors={[COLORS.primary.accent, COLORS.primary.soft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
        >
            {/* Header */}
            <View style={styles.heroHeader}>
                <View style={styles.heroTitleRow}>
                    <View style={styles.heroIconBadge}>
                        <Ionicons name="diamond" size={16} color={COLORS.text.primary} />
                    </View>
                    <View style={styles.heroTitleContent}>
                        <Text style={styles.heroLabel}>Your #1 Priority</Text>
                        <Text style={styles.heroDateRange}>{formatDateRange(weekStart, weekEnd)}</Text>
                    </View>
                </View>
                {canRegenerate && (
                    <Pressable
                        onPress={onRegenerate}
                        disabled={isGenerating}
                        style={[styles.regenerateBtn, isGenerating && styles.regenerateBtnDisabled]}
                    >
                        <Ionicons name="refresh" size={18} color={COLORS.text.primary} />
                    </Pressable>
                )}
            </View>

            {/* Lever Content */}
            <View style={styles.leverCard}>
                <Text style={styles.leverText}>{oneLeverToPull}</Text>
            </View>
        </LinearGradient>
    </View>
);

// Narrative Card
const NarrativeCard = ({ narrative }: { narrative: string }) => (
    <View style={styles.narrativeCard}>
        <View style={styles.narrativeHeader}>
            <View style={styles.narrativeIconBadge}>
                <Ionicons name="sparkles" size={16} color={COLORS.primary.accent} />
            </View>
            <Text style={styles.narrativeTitle}>CHITRA Analysis</Text>
        </View>
        <Text style={styles.narrativeText}>{narrative}</Text>
    </View>
);

// Insight Metric Card
const InsightMetricCard = ({
    type,
    message,
    metric,
    severity = 'info',
}: {
    type: string;
    message: string;
    metric?: { current: string | number; change?: number; trend?: 'up' | 'down' };
    severity?: 'critical' | 'warning' | 'info';
}) => {
    const config = SEVERITY_CONFIG[severity];
    const icon = INSIGHT_ICONS[type] || 'bulb';

    return (
        <View style={[styles.metricCard, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
            <View style={[styles.metricIconContainer, { backgroundColor: config.bgColor }]}>
                <Ionicons name={icon} size={20} color={config.color} />
            </View>
            <View style={styles.metricContent}>
                <Text style={styles.metricMessage}>{message}</Text>
                {metric && (
                    <View style={styles.metricValueRow}>
                        <Text style={styles.metricValue}>{metric.current}</Text>
                        {metric.change !== undefined && (
                            <View style={[styles.metricTrend, { backgroundColor: metric.trend === 'up' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                                <Ionicons
                                    name={metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                                    size={12}
                                    color={metric.trend === 'up' ? COLORS.success : COLORS.error}
                                />
                                <Text
                                    style={[
                                        styles.metricTrendText,
                                        { color: metric.trend === 'up' ? COLORS.success : COLORS.error },
                                    ]}
                                >
                                    {Math.abs(metric.change)}%
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

// Recommendation Card
const RecommendationCard = ({
    action,
    reason,
    expectedImpact,
    priority,
    isExpanded,
    onToggle,
}: {
    action: string;
    reason: string;
    expectedImpact: string;
    priority: 'high' | 'medium' | 'low';
    isExpanded: boolean;
    onToggle: () => void;
}) => {
    const config = PRIORITY_CONFIG[priority];

    return (
        <Pressable onPress={onToggle} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
                <View style={styles.recommendationMain}>
                    <Text style={styles.recommendationAction}>{action}</Text>
                </View>
                <View style={styles.recommendationMeta}>
                    <View style={[styles.priorityBadge, { backgroundColor: config.bgColor }]}>
                        <Text style={[styles.priorityText, { color: config.color }]}>{priority}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={COLORS.text.secondary}
                    />
                </View>
            </View>

            {isExpanded && (
                <View style={styles.recommendationDetails}>
                    <View style={styles.recommendationReasonRow}>
                        <Ionicons name="information-circle-outline" size={14} color={COLORS.text.secondary} />
                        <Text style={styles.recommendationReason}>{reason}</Text>
                    </View>
                    <View style={styles.impactBanner}>
                        <Ionicons name="flash" size={14} color={COLORS.success} />
                        <View style={styles.impactContent}>
                            <Text style={styles.impactLabel}>Expected Impact</Text>
                            <Text style={styles.impactValue}>{expectedImpact}</Text>
                        </View>
                    </View>
                </View>
            )}
        </Pressable>
    );
};

// Goal Card for Next Week
const NextWeekGoalCard = ({
    goal,
    suggestedSessions,
    suggestedDuration,
}: {
    goal: string;
    suggestedSessions: number;
    suggestedDuration: number;
}) => (
    <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
            <View style={styles.goalIconContainer}>
                <Ionicons name="flag" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.goalLabel}>Goal for Next Week</Text>
        </View>
        <Text style={styles.goalText}>{goal}</Text>
        <View style={styles.goalStats}>
            <View style={styles.goalStat}>
                <Text style={styles.goalStatValue}>{suggestedSessions}</Text>
                <Text style={styles.goalStatLabel}>Sessions</Text>
            </View>
            <View style={styles.goalStatDivider} />
            <View style={styles.goalStat}>
                <Text style={styles.goalStatValue}>{suggestedDuration}</Text>
                <Text style={styles.goalStatLabel}>min each</Text>
            </View>
        </View>
    </View>
);

// Time Slots Component
const TimeSlots = ({ slots }: { slots: string[] }) => (
    <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={18} color={COLORS.info} />
            <Text style={styles.sectionTitle}>Best Time Slots</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Based on your peak productivity times</Text>
        <View style={styles.timeSlotGrid}>
            {slots.map((slot, index) => (
                <View key={index} style={styles.timeSlot}>
                    <Text style={styles.timeSlotText}>{slot}</Text>
                </View>
            ))}
        </View>
    </View>
);

// Focus Areas Component
const FocusAreas = ({ areas }: { areas: string[] }) => (
    <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
            <Ionicons name="compass-outline" size={18} color={COLORS.primary.accent} />
            <Text style={styles.sectionTitle}>Focus Areas</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Key areas to concentrate on</Text>
        <View style={styles.focusAreasList}>
            {areas.map((area, index) => (
                <View key={index} style={styles.focusAreaItem}>
                    <View style={styles.focusAreaBullet} />
                    <Text style={styles.focusAreaText}>{area}</Text>
                </View>
            ))}
        </View>
    </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WeeklyAIInsights({ isPro, onUpgrade: _onUpgrade }: WeeklyAIInsightsProps) {
    const {
        insight,
        isLoading,
        isGenerating,
        error,
        generateInsights,
        markAsRead,
    } = useWeeklyInsights();

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(new Set());

    // Mark as read when insight loads
    useEffect(() => {
        if (insight && !insight.isRead) {
            markAsRead();
        }
    }, [insight, markAsRead]);

    // Toggle recommendation expansion
    const toggleRecommendation = useCallback((index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedRecommendations((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    // Check if regeneration is available
    const canRegenerate = useMemo(() => {
        if (!insight) return false;
        return new Date(insight.weekEnd).getTime() < Date.now();
    }, [insight]);

    // Filter insights for overview tab
    const filteredInsights = useMemo(() => {
        if (!insight) return [];
        return insight.insights.filter(
            (item) =>
                item.type !== 'streak_status' &&
                item.type !== 'task_completion' &&
                item.type !== 'best_time_of_day'
        );
    }, [insight]);

    // Sort recommendations by priority
    const sortedRecommendations = useMemo(() => {
        if (!insight) return [];
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return [...insight.recommendations].sort(
            (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
    }, [insight]);

    // Handle generate
    const handleGenerate = useCallback(() => {
        generateInsights();
    }, [generateInsights]);

    // Handle regenerate
    const handleRegenerate = useCallback(() => {
        generateInsights({ forceRegenerate: true });
    }, [generateInsights]);

    // ========== RENDER STATES ==========

    // Loading state
    if (isLoading && !insight) {
        return <LoadingState />;
    }

    // Empty state (no insight yet)
    if (!insight && !isGenerating && !error && !isLoading) {
        return <EmptyState isPro={isPro} isGenerating={isGenerating} onGenerate={handleGenerate} />;
    }

    // Error state
    if (error && !insight) {
        return <ErrorState error={error} isGenerating={isGenerating} onRetry={handleGenerate} />;
    }

    // Generating state
    if (isGenerating && !insight) {
        return <GeneratingState />;
    }

    // No insight available
    if (!insight) return null;

    // ========== MAIN RENDER ==========

    return (
        <View style={styles.container}>
            {/* Hero Section */}
            <HeroCard
                oneLeverToPull={insight.oneLeverToPull}
                weekStart={insight.weekStart}
                weekEnd={insight.weekEnd}
                isGenerating={isGenerating}
                canRegenerate={canRegenerate}
                onRegenerate={handleRegenerate}
            />

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <View style={styles.tabContent}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <View style={styles.tabPanel}>
                        <NarrativeCard narrative={insight.narrative} />
                        {filteredInsights.map((item, index) => (
                            <InsightMetricCard
                                key={index}
                                type={item.type}
                                message={item.message}
                                metric={item.metric}
                                severity={item.severity || 'info'}
                            />
                        ))}
                    </View>
                )}

                {/* Action Plan Tab */}
                {activeTab === 'action-plan' && (
                    <View style={styles.tabPanel}>
                        <View style={styles.recommendationsIntro}>
                            <Text style={styles.recommendationsTitle}>
                                {insight.recommendations.length} Personalized Recommendations
                            </Text>
                            <Text style={styles.recommendationsSubtitle}>
                                Actions tailored to your focus patterns
                            </Text>
                        </View>
                        {sortedRecommendations.map((rec, index) => (
                            <RecommendationCard
                                key={index}
                                action={rec.action}
                                reason={rec.reason}
                                expectedImpact={rec.expectedImpact}
                                priority={rec.priority}
                                isExpanded={expandedRecommendations.has(index)}
                                onToggle={() => toggleRecommendation(index)}
                            />
                        ))}
                    </View>
                )}

                {/* Next Week Tab */}
                {activeTab === 'next-week' && (
                    <View style={styles.tabPanel}>
                        <NextWeekGoalCard
                            goal={insight.nextWeekPlan.goal}
                            suggestedSessions={insight.nextWeekPlan.suggestedSessions}
                            suggestedDuration={insight.nextWeekPlan.suggestedDuration}
                        />
                        {insight.nextWeekPlan.bestTimeSlots.length > 0 && (
                            <TimeSlots slots={insight.nextWeekPlan.bestTimeSlots} />
                        )}
                        {insight.nextWeekPlan.focusAreas.length > 0 && (
                            <FocusAreas areas={insight.nextWeekPlan.focusAreas} />
                        )}
                    </View>
                )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Generated by CHITRA in {(insight.generationLatencyMs / 1000).toFixed(1)}s
                </Text>
            </View>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // ========== STATE CONTAINERS ==========
    stateContainer: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        marginBottom: SPACING.md,
    },

    // Loading State
    loadingContent: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    shimmerIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.background.cardBlue,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    stateTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    stateSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },

    // Empty State
    emptyContent: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary.accent,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.pill,
        gap: 4,
        marginBottom: SPACING.lg,
    },
    premiumBadgeText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    emptyIconContainer: {
        marginBottom: SPACING.lg,
    },
    emptyIconGradient: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.sm,
    },
    benefitsList: {
        width: '100%',
        marginBottom: SPACING.xl,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    benefitText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.primary,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary.accent,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.pill,
        gap: SPACING.sm,
        width: '100%',
    },
    generateButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    generateButtonDisabled: {
        opacity: 0.6,
    },
    generateButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    limitInfo: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.muted,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    limitInfoHighlight: {
        color: COLORS.primary.accent,
        fontWeight: '600',
    },

    // Error State
    errorContent: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    errorIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.background.cardBlue,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    errorTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    errorDescription: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary.accent,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.pill,
        gap: SPACING.sm,
    },
    retryButtonPressed: {
        opacity: 0.9,
    },
    retryButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },

    // Generating State
    generatingContent: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    generatingIconContainer: {
        marginBottom: SPACING.lg,
    },
    generatingIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generatingTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    generatingSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    progressSteps: {
        width: '100%',
        gap: SPACING.md,
    },
    progressStep: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    progressStepIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.background.cardBlue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressStepCompleted: {
        backgroundColor: COLORS.primary.accent,
    },
    progressStepActive: {
        backgroundColor: COLORS.primary.accent,
    },
    progressStepText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.muted,
    },
    progressStepTextCompleted: {
        color: COLORS.text.primary,
    },
    progressStepTextActive: {
        color: COLORS.text.primary,
        fontWeight: '500',
    },

    // ========== HERO CARD ==========
    heroCard: {
        marginBottom: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    heroGradient: {
        padding: SPACING.lg,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    heroTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flex: 1,
    },
    heroIconBadge: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitleContent: {
        flex: 1,
    },
    heroLabel: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    heroDateRange: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    regenerateBtn: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    regenerateBtnDisabled: {
        opacity: 0.5,
    },
    leverCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
    },
    leverText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: COLORS.text.primary,
        lineHeight: 24,
    },

    // ========== TAB NAVIGATION ==========
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: 4,
        marginBottom: SPACING.lg,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
    },
    tabActive: {
        backgroundColor: COLORS.primary.accent,
    },
    tabText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.text.secondary,
    },
    tabTextActive: {
        color: COLORS.text.primary,
    },

    // ========== TAB CONTENT ==========
    tabContent: {
        flex: 1,
    },
    tabPanel: {
        gap: SPACING.md,
    },

    // ========== NARRATIVE CARD ==========
    narrativeCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
    },
    narrativeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    narrativeIconBadge: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: 'rgba(215, 245, 10, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    narrativeTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    narrativeText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.primary,
        lineHeight: 22,
    },

    // ========== METRIC CARD ==========
    metricCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        gap: SPACING.md,
        alignItems: 'flex-start',
    },
    metricIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricContent: {
        flex: 1,
    },
    metricMessage: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    metricValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    metricValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    metricTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.pill,
        gap: 4,
    },
    metricTrendText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
    },

    // ========== RECOMMENDATIONS ==========
    recommendationsIntro: {
        marginBottom: SPACING.sm,
    },
    recommendationsTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    recommendationsSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },
    recommendationCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.background.cardBlue,
    },
    recommendationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    recommendationMain: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    recommendationAction: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.primary,
        lineHeight: 20,
    },
    recommendationMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    priorityBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.pill,
    },
    priorityText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    recommendationDetails: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.background.cardBlue,
    },
    recommendationReasonRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
    },
    recommendationReason: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        lineHeight: 20,
    },
    impactBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.sm,
        gap: SPACING.sm,
    },
    impactContent: {
        flex: 1,
    },
    impactLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
        marginBottom: 2,
    },
    impactValue: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.success,
    },

    // ========== GOAL CARD ==========
    goalCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    goalIconContainer: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.success,
    },
    goalText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
        lineHeight: 24,
        marginBottom: SPACING.lg,
    },
    goalStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
    },
    goalStat: {
        flex: 1,
        alignItems: 'center',
    },
    goalStatValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    goalStatLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    goalStatDivider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.background.cardBlue,
    },

    // ========== SECTION CARDS ==========
    sectionCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    sectionSubtitle: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
        marginBottom: SPACING.md,
    },
    timeSlotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    timeSlot: {
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.pill,
    },
    timeSlotText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.info,
    },
    focusAreasList: {
        gap: SPACING.sm,
    },
    focusAreaItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.sm,
    },
    focusAreaBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary.accent,
        marginTop: 7,
    },
    focusAreaText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.primary,
        lineHeight: 20,
    },

    // ========== FOOTER ==========
    footer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        marginTop: SPACING.sm,
    },
    footerText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.muted,
    },
});
