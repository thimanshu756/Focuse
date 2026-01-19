/**
 * Weekly Insights Types
 * Types for AI-generated weekly insights feature
 */

export interface WeeklyInsight {
  type:
    | 'completion_rate'
    | 'best_time_of_day'
    | 'session_length'
    | 'failure_pattern'
    | 'productivity_trend'
    | 'streak_status'
    | 'task_completion'
    | 'consistency';
  message: string;
  confidence: number; // 0-1
  metric?: {
    current: number | string;
    change?: number; // +/- percentage
    trend?: 'up' | 'down' | 'stable';
  };
  severity?: 'info' | 'warning' | 'critical';
}

export interface WeeklyRecommendation {
  action: string;
  reason: string;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
  category:
    | 'session_timing'
    | 'session_duration'
    | 'break_management'
    | 'task_planning'
    | 'consistency';
  confidence: number; // 0-1
}

export interface NextWeekPlan {
  goal: string;
  suggestedSessions: number;
  suggestedDuration: number; // minutes
  bestTimeSlots: string[];
  focusAreas: string[];
}

export interface WeeklyInsightResponse {
  id: string;
  weekStart: string;
  weekEnd: string;
  narrative: string;
  insights: WeeklyInsight[];
  recommendations: WeeklyRecommendation[];
  nextWeekPlan: NextWeekPlan;
  oneLeverToPull: string;
  generatedAt: string;
  generationLatencyMs: number;
  model: string;
  provider: string;
  weeklyStats: any; // Full stats object
  isRead: boolean;
  readAt: string | null;
}

export interface GenerateInsightsRequest {
  weekStart?: string;
  forceRegenerate?: boolean;
}

export interface InsightsListResponse {
  insights: WeeklyInsightResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
