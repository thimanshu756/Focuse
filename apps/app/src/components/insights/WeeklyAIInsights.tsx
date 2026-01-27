import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { useWeeklyInsights } from '@/hooks/useWeeklyInsights';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

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
    const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (insight && !insight.isRead) {
            markAsRead();
        }
    }, [insight, markAsRead]);

    const toggleRecommendation = (index: number) => {
        const newExpanded = new Set(expandedRecommendations);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRecommendations(newExpanded);
    };

    if (isLoading && !insight) {
        return (
            <Card style={styles.card}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary.accent} />
                    <Text style={styles.loadingText}>Loading Insights...</Text>
                </View>
                <View style={{ gap: 10, marginTop: 20 }}>
                    <Skeleton width="100%" height={100} />
                    <Skeleton width="100%" height={80} />
                </View>
            </Card>
        );
    }

    if (isGenerating && !insight) {
        return (
            <Card style={styles.card}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary.accent} />
                    <Text style={styles.loadingText}>Generating Your Insights...</Text>
                    <Text style={styles.loadingSubtext}>AI is analyzing your focus patterns...</Text>
                </View>
            </Card>
        );
    }

    if (!insight && !error) {
        return (
            <Card style={[styles.card, styles.emptyCard]}>
                <View style={styles.iconCircle}>
                    <Ionicons name="sparkles" size={32} color={COLORS.text.primary} />
                </View>
                <Text style={styles.emptyTitle}>Get Your AI-Powered Insights</Text>
                <Text style={styles.emptyDesc}>
                    Let AI analyze your focus patterns and provide personalized recommendations.
                </Text>
                <Button
                    title="Generate Weekly Insights"
                    onPress={() => generateInsights()}
                />
                {!isPro && (
                    <Text style={styles.emptyFooter}>
                        Free users: 1 insight per week • Pro users: Unlimited
                    </Text>
                )}
            </Card>
        );
    }

    if (error && !insight) {
        return (
            <Card style={styles.card}>
                <View style={styles.loadingContainer}>
                    <Ionicons name="alert-circle" size={48} color={COLORS.error} />
                    <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                    <Text style={styles.loadingSubtext}>{error}</Text>
                    <Button
                        title="Try Again"
                        onPress={() => generateInsights()}
                        style={{ marginTop: 16 }}
                    />
                </View>
            </Card>
        );
    }

    if (!insight) return null;

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: 'bar-chart' },
        { id: 'action-plan' as TabType, label: 'Action Plan', icon: 'list' },
        { id: 'next-week' as TabType, label: 'Next Week', icon: 'calendar' },
    ] as const;

    return (
        <View style={styles.container}>
            {/* Hero Section */}
            <Card style={styles.heroCard}>
                <View style={styles.heroHeader}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="trophy" size={20} color={COLORS.text.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.heroTitle}>Your #1 Priority</Text>
                        <Text style={styles.heroDate}>
                            Week of {format(new Date(insight.weekStart), 'MMM d')} - {format(new Date(insight.weekEnd), 'MMM d')}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {!isPro && (
                            <Button title="Upgrade" onPress={onUpgrade} size="sm" variant="ghost" />
                        )}
                        {new Date(insight.weekEnd).getTime() < Date.now() && (
                            <Pressable
                                onPress={() => generateInsights({ forceRegenerate: true })}
                                disabled={isGenerating}
                                style={styles.refreshButton}
                            >
                                <Ionicons name="refresh" size={18} color={COLORS.text.primary} />
                            </Pressable>
                        )}
                    </View>
                </View>
                <View style={styles.leverContainer}>
                    <Text style={styles.leverText}>{insight.oneLeverToPull}</Text>
                </View>
            </Card>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {tabs.map(tab => (
                    <Pressable
                        key={tab.id}
                        style={[
                            styles.tabItem,
                            activeTab === tab.id && styles.activeTabItem,
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={16}
                            color={activeTab === tab.id ? COLORS.text.primary : COLORS.text.secondary}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.id && styles.activeTabText,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {activeTab === 'overview' && (
                    <View>
                        <Card style={styles.sectionCard}>
                            <View style={[styles.cardHeader, { backgroundColor: '#F3E8FF' }]}>
                                <Ionicons name="sparkles" size={16} color="#9333EA" />
                                <Text style={styles.cardTitle}>CHITRA Analysis</Text>
                            </View>
                            <Text style={styles.bodyText}>{insight.narrative}</Text>
                        </Card>

                        <View style={styles.grid}>
                            {insight.insights
                                .filter(i => !['streak_status', 'task_completion', 'best_time_of_day'].includes(i.type))
                                .map((item, index) => (
                                    <Card key={index} style={styles.insightItem}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                            <Ionicons name="analytics" size={24} color={COLORS.text.secondary} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.insightMessage}>{item.message}</Text>
                                                {item.metric && (
                                                    <Text style={styles.insightMetric}>
                                                        {item.metric.current}
                                                        {item.metric.change && (
                                                            <Text style={{
                                                                color: item.metric.trend === 'up' ? COLORS.success : COLORS.error,
                                                                fontSize: 14,
                                                                fontWeight: 'normal'
                                                            }}>
                                                                {' '}{item.metric.trend === 'up' ? '↑' : '↓'} {Math.abs(item.metric.change)}%
                                                            </Text>
                                                        )}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </Card>
                                ))}
                        </View>
                    </View>
                )}

                {activeTab === 'action-plan' && (
                    <View>
                        <Card style={[styles.sectionCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE', borderWidth: 1 }]}>
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                <Ionicons name="bulb" size={20} color="#4F46E5" />
                                <Text style={[styles.cardTitle, { color: COLORS.text.primary }]}>Recommendations</Text>
                            </View>
                            <Text style={styles.smallText}>{insight.recommendations.length} recommendations available</Text>
                        </Card>

                        <View style={{ gap: 12, marginTop: 12 }}>
                            {insight.recommendations.map((rec, index) => {
                                const isExpanded = expandedRecommendations.has(index);
                                return (
                                    <Pressable key={index} onPress={() => toggleRecommendation(index)}>
                                        <Card style={styles.recCard}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Text style={styles.recAction}>{rec.action}</Text>
                                                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.text.muted} />
                                            </View>
                                            <View style={[styles.badge, { alignSelf: 'flex-start', marginTop: 8 }]}>
                                                <Text style={styles.badgeText}>{rec.priority}</Text>
                                            </View>

                                            {isExpanded && (
                                                <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 }}>
                                                    <Text style={styles.recReason}>{rec.reason}</Text>
                                                    <View style={styles.impactBox}>
                                                        <Text style={styles.impactLabel}>Impact:</Text>
                                                        <Text style={styles.impactText}>{rec.expectedImpact}</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </Card>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                )}

                {activeTab === 'next-week' && (
                    <View>
                        <Card style={[styles.sectionCard, { backgroundColor: '#ECFDF5', borderColor: '#34D399', borderWidth: 1 }]}>
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                <Ionicons name="flag" size={20} color="#059669" />
                                <Text style={[styles.cardTitle, { color: '#047857' }]}>Goal for Next Week</Text>
                            </View>
                            <Text style={[styles.heroTitle, { fontSize: 18 }]}>{insight.nextWeekPlan.goal}</Text>

                            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
                                <View>
                                    <Text style={styles.smallText}>Sessions</Text>
                                    <Text style={styles.metricValue}>{insight.nextWeekPlan.suggestedSessions}</Text>
                                </View>
                                <View>
                                    <Text style={styles.smallText}>Duration</Text>
                                    <Text style={styles.metricValue}>{insight.nextWeekPlan.suggestedDuration}m</Text>
                                </View>
                            </View>
                        </Card>

                        {insight.nextWeekPlan.bestTimeSlots.length > 0 && (
                            <Card style={styles.sectionCard}>
                                <Text style={styles.cardTitle}>Best Time Slots</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                                    {insight.nextWeekPlan.bestTimeSlots.map((slot, i) => (
                                        <View key={i} style={styles.timeSlotBadge}>
                                            <Text style={styles.timeSlotText}>{slot}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Card>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.xxl,
    },
    card: {
        padding: SPACING.xl,
        marginBottom: SPACING.md,
    },
    emptyCard: {
        alignItems: 'center',
        backgroundColor: '#F0F9FF', // Light blue tint
    },
    loadingContainer: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    loadingSubtext: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginTop: 4,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary.accent, // Using accent color as background
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        opacity: 0.2, // Make it subtle
    },
    emptyTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    emptyDesc: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    emptyFooter: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.muted,
        marginTop: SPACING.md,
    },
    errorTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
    },
    heroCard: {
        backgroundColor: COLORS.primary.accent,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    heroIcon: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 8,
        borderRadius: 12,
    },
    heroTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    heroDate: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
    },
    refreshButton: {
        padding: 8,
    },
    leverContainer: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    leverText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        lineHeight: 24,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        padding: 4,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
        gap: 6,
    },
    activeTabItem: {
        backgroundColor: COLORS.primary.accent,
    },
    tabText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.secondary,
    },
    activeTabText: {
        color: COLORS.text.primary,
    },
    contentContainer: {
        gap: SPACING.md,
    },
    sectionCard: {
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 6,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    bodyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        lineHeight: 24,
    },
    grid: {
        gap: SPACING.md,
    },
    insightItem: {
        padding: SPACING.md,
    },
    insightMessage: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    insightMetric: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    recCard: {
        padding: SPACING.md,
    },
    recAction: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#3730A3',
        textTransform: 'uppercase',
    },
    recReason: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        marginBottom: 8,
        lineHeight: 20,
    },
    impactBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F0FDF4',
        padding: 8,
        borderRadius: 8,
    },
    impactLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#166534',
    },
    impactText: {
        fontSize: 12,
        color: '#15803D',
    },
    smallText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
    },
    metricValue: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    timeSlotBadge: {
        backgroundColor: '#EFF6FF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    timeSlotText: {
        fontSize: FONT_SIZES.sm,
        color: '#1D4ED8',
        fontWeight: '500',
    },
});
