/**
 * Insights Types
 * Types for AI-generated weekly insights and analytics
 */

// ============================================================================
// WEEKLY ANALYTICS TYPES
// ============================================================================

/**
 * Aggregated stats for a week
 */
export interface WeeklyStats {
  // Time range
  weekStart: Date;
  weekEnd: Date;
  
  // Session metrics
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  completionRate: number; // 0-100
  
  // Time metrics (all in seconds)
  totalFocusTime: number;
  averageSessionDuration: number;
  longestSession: number;
  shortestSession: number;
  
  // Task metrics
  tasksCompleted: number;
  tasksCreated: number;
  
  // Time-of-day breakdown (in seconds)
  morningFocusTime: number;    // 6-11 AM
  afternoonFocusTime: number;  // 12-5 PM
  eveningFocusTime: number;    // 6-11 PM
  nightFocusTime: number;      // 12-5 AM
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'none';
  
  // Daily breakdown
  bestDay: string | null; // "Monday", "Tuesday", etc.
  worstDay: string | null;
  dailyDistribution: DailyDistribution[];
  
  // Failure analysis
  failureReasons: FailureReasonStats[];
  averageFailureTime: number; // Average time before giving up (seconds)
  
  // Patterns
  sessionDurationDistribution: SessionDurationBucket[];
  streakData: StreakData;
}

export interface DailyDistribution {
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  date: Date;
  totalSessions: number;
  completedSessions: number;
  focusTime: number; // seconds
  completionRate: number; // 0-100
}

export interface FailureReasonStats {
  reason: string; // From SessionFailReason enum
  count: number;
  percentage: number; // 0-100
}

export interface SessionDurationBucket {
  range: string; // "15-30 min", "30-45 min", etc.
  count: number;
  completionRate: number; // 0-100
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakChange: number; // +/- compared to previous week
}

// ============================================================================
// AI INSIGHT TYPES
// ============================================================================

/**
 * AI-generated insight
 */
export interface Insight {
  type: InsightType;
  message: string;
  confidence: number; // 0-1
  metric?: {
    current: number | string;
    change?: number; // +/- percentage
    trend?: 'up' | 'down' | 'stable';
  };
  severity?: 'info' | 'warning' | 'critical'; // For actionable insights
}

export type InsightType =
  | 'completion_rate'
  | 'best_time_of_day'
  | 'session_length'
  | 'failure_pattern'
  | 'productivity_trend'
  | 'streak_status'
  | 'task_completion'
  | 'consistency';

/**
 * AI-generated recommendation
 */
export interface Recommendation {
  action: string; // What to do
  reason: string; // Why to do it
  expectedImpact: string; // What will improve
  priority: 'high' | 'medium' | 'low';
  category: RecommendationCategory;
  confidence: number; // 0-1
}

export type RecommendationCategory =
  | 'session_timing'
  | 'session_duration'
  | 'break_management'
  | 'task_planning'
  | 'consistency';

/**
 * Next week planning item
 */
export interface NextWeekPlan {
  goal: string;
  suggestedSessions: number;
  suggestedDuration: number; // minutes
  bestTimeSlots: string[]; // ["Monday 9-11 AM", "Wednesday 7-9 PM"]
  focusAreas: string[]; // Task tags or categories
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request to generate weekly insights
 */
export interface GenerateInsightsRequest {
  weekStart?: string; // ISO date string, defaults to last Monday
  forceRegenerate?: boolean; // Regenerate even if cached
}

/**
 * Response with weekly insights
 */
export interface WeeklyInsightResponse {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  
  // AI-generated content
  narrative: string;
  insights: Insight[];
  recommendations: Recommendation[];
  nextWeekPlan: NextWeekPlan;
  oneLeverToPull: string;
  
  // Metadata
  generatedAt: Date;
  generationLatencyMs: number;
  model: string;
  provider: string;
  
  // Stats that were used
  weeklyStats: WeeklyStats;
  
  // Status
  isRead: boolean;
  readAt: Date | null;
}

/**
 * List insights response with pagination
 */
export interface InsightsListResponse {
  insights: WeeklyInsightResponse[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

/**
 * Input for AI insights generation
 */
export interface AIInsightsInput {
  userId: string;
  weeklyStats: WeeklyStats;
  userProfile: {
    name: string;
    timezone: string;
    currentStreak: number;
    longestStreak: number;
    totalFocusTime: number; // Total lifetime focus time in seconds
    totalSessions: number;
    userType?: string | null; // "student", "professional", "freelancer"
    preferredFocusTime?: string | null; // "morning", "afternoon", "evening", "night"
  };
  previousInsight?: {
    oneLeverToPull: string;
    recommendations: Recommendation[];
  } | null;
}

/**
 * Output from AI insights generation
 */
export interface AIInsightsOutput {
  narrative: string;
  insights: Insight[];
  recommendations: Recommendation[];
  nextWeekPlan: NextWeekPlan;
  oneLeverToPull: string;
}

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

/**
 * Rate limit check result
 */
export interface InsightsRateLimitResult {
  allowed: boolean;
  reason?: string;
  nextAvailableAt?: Date;
  remainingGenerations?: number; // For premium users
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface InsightsError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}
