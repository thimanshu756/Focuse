/**
 * Weekly AI Insights Component - Mobile
 * React Native component with tab-based navigation for AI-generated weekly insights
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { useWeeklyInsights } from '@/hooks/useWeeklyInsights';
import type {
    WeeklyInsightResponse,
} from '@/types/weekly-insights.types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
    const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(
        new Set()
    );

    useEffect(() => {
        if (insight && !insight.isRead) {
            markAsRead();
        }
    }, [insight, markAsRead]);

    // Toggle recommendation expansion with animation
    const toggleRecommendation = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newExpanded = new Set(expandedRecommendations);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRecommendations(newExpanded);
    };

    // Get insight icon based on type
    const getInsightIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            completion_rate: 'checkmark-circle',
            best_time_of_day: 'time',
            session_length: 'resize',
            streak_status: 'flash',
            productivity_trend: 'trending-up',
            failure_pattern: 'alert-circle',
            task_completion: 'checkmark-done',
            consistency: 'bar-chart',
        };
        return icons[type] || 'bulb';
    };

    // Get priority styling
    const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
        const colors = {
            high: { badge: COLORS.error, icon: COLORS.error },
            medium: { badge: COLORS.warning, icon: COLORS.warning },
            low: { badge: COLORS.info, icon: COLORS.info },
        };
        return colors[priority];
    };

    // Loading state
    if (isLoading && !insight) {
        return (
            <View style={styles.card}>
                <View style={styles.loadingContainer}>
                    <View style={styles.sparkleIcon}>
                        <Ionicons name="sparkles" size={32} color={COLORS.text.primary} />
                    </View>
                    <Text style={styles.loadingTitle}>Loading Insights...</Text>
                    <Text style={styles.loadingSubtitle}>Checking for your weekly insights</Text>
                    <ActivityIndicator
                        size="large"
                        color={COLORS.primary.accent}
                        style={styles.spinner}
                    />
                </View>
            </View>
        );
    }

    // Empty state
    if (!insight && !isGenerating && !error && !isLoading) {
        return (
            <View style={styles.card}>
                <View style={styles.emptyContainer}>
                    <View style={styles.sparkleIconLarge}>
                        <Ionicons name="sparkles" size={48} color={COLORS.text.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Get Your AI-Powered Insights</Text>
                    <Text style={styles.emptySubtitle}>
                        Let CHITRA analyze your focus patterns and provide personalized recommendations to
                        boost your productivity.
                    </Text>
                    <Pressable
                        onPress={() => generateInsights()}
                        style={styles.generateButton}
                        disabled={isGenerating}
                    >
                        <Ionicons name="sparkles" size={20} color={COLORS.text.primary} />
                        <Text style={styles.generateButtonText}>Generate Weekly Insights</Text>
                    </Pressable>
                    {!isPro && (
                        <Text style={styles.limitText}>
                            Free users: 1 insight per week • Pro users: Unlimited
                        </Text>
                    )}
                </View>
            </View>
        );
    }

    // Error state
    if (error && !insight) {
        return (
            <View style={styles.card}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color={COLORS.error} />
                    <Text style={styles.errorTitle}>{error}</Text>
                    <Pressable
                        onPress={() => generateInsights()}
                        style={styles.retryButton}
                        disabled={isGenerating}
                    >
                        <Text style={styles.retryButtonText}>
                            {isGenerating ? 'Generating...' : 'Try Again'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // Generating state
    if (isGenerating && !insight) {
        return (
            <View style={styles.card}>
                <View style={styles.generatingContainer}>
                    <View style={styles.sparkleIcon}>
                        <Ionicons name="sparkles" size={32} color={COLORS.text.primary} />
                    </View>
                    <Text style={styles.generatingTitle}>Generating Your Insights...</Text>
                    <Text style={styles.generatingSubtitle}>
                        CHITRA is analyzing your focus patterns. This may take 5-10 seconds.
                    </Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressItem}>
                            <View style={styles.progressIconCompleted}>
                                <Ionicons name="checkmark" size={12} color={COLORS.text.primary} />
                            </View>
                            <Text style={styles.progressText}>Analyzing your focus sessions</Text>
                        </View>
                        <View style={styles.progressItem}>
                            <ActivityIndicator size="small" color={COLORS.primary.accent} />
                            <Text style={styles.progressText}>Identifying patterns and trends</Text>
                        </View>
                        <View style={styles.progressItem}>
                            <View style={styles.progressIconPending} />
                            <Text style={styles.progressText}>Creating personalized recommendations</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    if (!insight) return null;

    // Main insight view with tabs
    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: 'bar-chart' as const },
        { id: 'action-plan' as TabType, label: 'Action Plan', icon: 'ellipse-outline' as const },
        { id: 'next-week' as TabType, label: 'Next Week', icon: 'calendar' as const },
    ];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Section - One Lever to Pull */}
            <View style={styles.heroCard}>
                <View style={styles.heroHeader}>
                    <View style={styles.heroIconContainer}>
                        <Ionicons name="ellipse-outline" size={24} color={COLORS.text.primary} />
                    </View>
                    <View style={styles.heroTitleContainer}>
                        <Text style={styles.heroTitle}>Your #1 Priority</Text>
                        <Text style={styles.heroSubtitle}>
                            Week of {formatDate(insight.weekStart)} - {formatDate(insight.weekEnd)}
                        </Text>
                    </View>
                </View>
                <View style={styles.leverContainer}>
                    <Text style={styles.leverText}>{insight.oneLeverToPull}</Text>
                </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <Pressable
                            key={tab.id}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setActiveTab(tab.id);
                            }}
                            style={[styles.tab, isActive && styles.tabActive]}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={isActive ? COLORS.text.primary : COLORS.text.secondary}
                            />
                            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <View style={styles.tabContent}>
                    {/* AI Narrative */}
                    <View style={styles.narrativeCard}>
                        <View style={styles.narrativeHeader}>
                            <Ionicons name="sparkles" size={20} color={COLORS.primary.accent} />
                            <Text style={styles.narrativeTitle}>CHITRA Analysis</Text>
                        </View>
                        <Text style={styles.narrativeText}>{insight.narrative}</Text>
                    </View>

                    {/* Key Metrics */}
                    {insight.insights
                        .filter(
                            (item) =>
                                item.type !== 'streak_status' &&
                                item.type !== 'task_completion' &&
                                item.type !== 'best_time_of_day'
                        )
                        .map((item, index) => {
                            const Icon = getInsightIcon(item.type);
                            const severityColors = {
                                critical: { bg: '#FEE2E2', border: '#FCA5A5' },
                                warning: { bg: '#FEF3C7', border: '#FCD34D' },
                                info: { bg: '#DBEAFE', border: '#93C5FD' },
                            };
                            const colors = severityColors[item.severity || 'info'];

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.insightCard,
                                        { backgroundColor: colors.bg, borderColor: colors.border },
                                    ]}
                                >
                                    <View style={styles.insightIconContainer}>
                                        <Ionicons name={Icon} size={24} color={COLORS.text.primary} />
                                    </View>
                                    <View style={styles.insightContent}>
                                        <Text style={styles.insightMessage}>{item.message}</Text>
                                        {item.metric && (
                                            <View style={styles.metricContainer}>
                                                <Text style={styles.metricValue}>{item.metric.current}</Text>
                                                {item.metric.change !== undefined && (
                                                    <View style={styles.metricChange}>
                                                        <Ionicons
                                                            name={item.metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                                                            size={16}
                                                            color={item.metric.trend === 'up' ? COLORS.success : COLORS.error}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.metricChangeText,
                                                                {
                                                                    color:
                                                                        item.metric.trend === 'up' ? COLORS.success : COLORS.error,
                                                                },
                                                            ]}
                                                        >
                                                            {Math.abs(item.metric.change)}%
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                </View>
            )}

            {activeTab === 'action-plan' && (
                <View style={styles.tabContent}>
                    {/* Recommendations Header */}
                    <View style={styles.recommendationsHeader}>
                        <Ionicons name="bulb" size={24} color={COLORS.primary.accent} />
                        <View style={styles.recommendationsTextContainer}>
                            <Text style={styles.recommendationsTitle}>Personalized Recommendations</Text>
                            <Text style={styles.recommendationsSubtitle}>
                                {insight.recommendations.length} recommendations to boost your productivity
                            </Text>
                        </View>
                    </View>

                    {/* Recommendations List */}
                    {insight.recommendations
                        .sort((a, b) => {
                            const priorityOrder = { high: 0, medium: 1, low: 2 };
                            return priorityOrder[a.priority] - priorityOrder[b.priority];
                        })
                        .map((rec, index) => {
                            const isExpanded = expandedRecommendations.has(index);
                            const priorityColors = getPriorityColor(rec.priority);

                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => toggleRecommendation(index)}
                                    style={styles.recommendationCard}
                                >
                                    <View style={styles.recommendationHeader}>
                                        <Text style={styles.recommendationAction}>{rec.action}</Text>
                                        <View style={styles.recommendationBadgeContainer}>
                                            <View
                                                style={[
                                                    styles.priorityBadge,
                                                    { backgroundColor: priorityColors.badge + '20' },
                                                ]}
                                            >
                                                <Text
                                                    style={[styles.priorityBadgeText, { color: priorityColors.badge }]}
                                                >
                                                    {rec.priority}
                                                </Text>
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
                                            <View style={styles.recommendationReason}>
                                                <Ionicons
                                                    name="information-circle"
                                                    size={16}
                                                    color={COLORS.text.secondary}
                                                />
                                                <Text style={styles.recommendationReasonText}>{rec.reason}</Text>
                                            </View>
                                            <View style={styles.impactContainer}>
                                                <Ionicons name="flash" size={16} color={COLORS.success} />
                                                <View>
                                                    <Text style={styles.impactLabel}>Expected Impact</Text>
                                                    <Text style={styles.impactText}>{rec.expectedImpact}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                </View>
            )}

            {activeTab === 'next-week' && (
                <View style={styles.tabContent}>
                    {/* Week Goal */}
                    <View style={styles.goalCard}>
                        <View style={styles.goalIconContainer}>
                            <Ionicons name="radio-button-on" size={24} color={COLORS.success} />
                        </View>
                        <View style={styles.goalContent}>
                            <Text style={styles.goalLabel}>Goal for Next Week</Text>
                            <Text style={styles.goalText}>{insight.nextWeekPlan.goal}</Text>

                            {/* Stats */}
                            <View style={styles.goalStats}>
                                <View style={styles.goalStat}>
                                    <Text style={styles.goalStatLabel}>Sessions</Text>
                                    <Text style={styles.goalStatValue}>
                                        {insight.nextWeekPlan.suggestedSessions}
                                    </Text>
                                </View>
                                <View style={styles.goalStat}>
                                    <Text style={styles.goalStatLabel}>Duration</Text>
                                    <Text style={styles.goalStatValue}>
                                        {insight.nextWeekPlan.suggestedDuration}
                                        <Text style={styles.goalStatUnit}> min</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Best Time Slots */}
                    {insight.nextWeekPlan.bestTimeSlots.length > 0 && (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="time" size={20} color={COLORS.info} />
                                <Text style={styles.sectionTitle}>Best Time Slots</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>Based on your most productive times</Text>
                            <View style={styles.timeSlots}>
                                {insight.nextWeekPlan.bestTimeSlots.map((slot, i) => (
                                    <View key={i} style={styles.timeSlot}>
                                        <Text style={styles.timeSlotText}>{slot}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Focus Areas */}
                    {insight.nextWeekPlan.focusAreas.length > 0 && (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="radio-button-on" size={20} color={COLORS.primary.accent} />
                                <Text style={styles.sectionTitle}>Focus Areas</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>Key areas to concentrate on</Text>
                            <View style={styles.focusAreas}>
                                {insight.nextWeekPlan.focusAreas.map((area, i) => (
                                    <View key={i} style={styles.focusArea}>
                                        <Ionicons name="arrow-forward" size={16} color={COLORS.primary.accent} />
                                        <Text style={styles.focusAreaText}>{area}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Analyzed by CHITRA in {(insight.generationLatencyMs / 1000).toFixed(1)}s
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        marginBottom: SPACING.lg,
    },

    // Loading states
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    sparkleIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    sparkleIconLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    loadingTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    loadingSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg,
    },
    spinner: {
        marginTop: SPACING.md,
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 22,
        paddingHorizontal: SPACING.md,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary.accent,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        gap: SPACING.sm,
    },
    generateButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    limitText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.muted,
        marginTop: SPACING.md,
        textAlign: 'center',
    },

    // Error state
    errorContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    errorTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginVertical: SPACING.md,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary.accent,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        marginTop: SPACING.md,
    },
    retryButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },

    // Generating state
    generatingContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
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
    progressContainer: {
        width: '100%',
        gap: SPACING.md,
    },
    progressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    progressIconCompleted: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressIconPending: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.background.cardBlue,
    },
    progressText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },

    // Hero section
    heroCard: {
        backgroundColor: COLORS.primary.accent,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },
    heroIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.background.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitleContainer: {
        flex: 1,
    },
    heroTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },
    leverContainer: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
    },
    leverText: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.text.primary,
        lineHeight: 24,
    },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.xs,
        marginBottom: SPACING.lg,
        gap: SPACING.xs,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
    },
    tabActive: {
        backgroundColor: COLORS.primary.accent,
    },
    tabLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.secondary,
    },
    tabLabelActive: {
        color: COLORS.text.primary,
    },

    // Tab content
    tabContent: {
        gap: SPACING.md,
    },

    // Narrative card
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
    narrativeTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    narrativeText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        lineHeight: 22,
    },

    // Insight cards
    insightCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 2,
        gap: SPACING.md,
    },
    insightIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.background.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightContent: {
        flex: 1,
    },
    insightMessage: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
    },
    metricContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    metricValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    metricChange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    metricChangeText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },

    // Recommendations
    recommendationsHeader: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        gap: SPACING.md,
    },
    recommendationsTextContainer: {
        flex: 1,
    },
    recommendationsTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
    },
    recommendationsSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },
    recommendationCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 2,
        borderColor: COLORS.background.cardBlue,
    },
    recommendationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: SPACING.md,
    },
    recommendationAction: {
        flex: 1,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    recommendationBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    priorityBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
    },
    priorityBadgeText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    recommendationDetails: {
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },
    recommendationReason: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.xs,
    },
    recommendationReasonText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },
    impactContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.background.cardBlue,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
        gap: SPACING.xs,
    },
    impactLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '500',
        color: COLORS.text.secondary,
        marginBottom: 2,
    },
    impactText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.success,
    },

    // Goal card
    goalCard: {
        flexDirection: 'row',
        backgroundColor: '#D1FAE5',
        borderColor: '#6EE7B7',
        borderWidth: 2,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    goalIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.background.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalContent: {
        flex: 1,
    },
    goalLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.success,
        marginBottom: SPACING.xs,
    },
    goalText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: SPACING.md,
    },
    goalStats: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    goalStat: {
        flex: 1,
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
    },
    goalStatLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
    },
    goalStatValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    goalStatUnit: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '400',
        color: COLORS.text.secondary,
    },

    // Section cards
    sectionCard: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    sectionSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.md,
    },
    timeSlots: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    timeSlot: {
        backgroundColor: COLORS.info + '20',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
    },
    timeSlotText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.info,
    },
    focusAreas: {
        gap: SPACING.xs,
    },
    focusArea: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary.accent + '20',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        gap: SPACING.sm,
    },
    focusAreaText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.text.primary,
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    footerText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.muted,
    },
});
