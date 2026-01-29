export interface WeeklyInsightResponse {
    id: string;
    userId: string;
    weekStart: string;
    weekEnd: string;
    narrative: string;
    model: string;
    oneLeverToPull: string;
    insights: {
        type: string;
        message: string;
        severity: 'critical' | 'warning' | 'info';
        metric?: {
            current: string | number;
            change?: number;
            trend?: 'up' | 'down';
        };
    }[];
    recommendations: {
        action: string;
        reason: string;
        expectedImpact: string;
        priority: 'high' | 'medium' | 'low';
    }[];
    nextWeekPlan: {
        goal: string;
        suggestedSessions: number;
        suggestedDuration: number;
        focusAreas: string[];
        bestTimeSlots: string[];
    };
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    generationLatencyMs: number;
}

export interface GenerateInsightsRequest {
    forceRegenerate?: boolean;
}
