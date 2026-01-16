/**
 * AI Service Types
 * Modular types for reusable AI functionality
 */

export interface AITaskBreakdown {
  title: string;
  estimatedMinutes: number;
  description?: string;
}

export interface AITaskBreakdownResponse {
  tasks: AITaskBreakdown[];
}

export interface AIServiceConfig {
  maxRetries?: number;
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
}

export interface AIServiceRequest {
  prompt: string;
  requestType: 'TASK_BREAKDOWN' | 'SCHEDULE_SUGGEST' | 'POMODORO_OPTIMIZE' | 'INSIGHT_GENERATE' | 'TASK_ESTIMATE';
  config?: AIServiceConfig;
  context?: Record<string, any>; // Additional context for the AI
}

export interface AIServiceResponse<T = any> {
  data: T;
  tokensUsed?: number;
  latencyMs: number;
  model: string;
  provider: string;
}

export interface AIServiceError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}
