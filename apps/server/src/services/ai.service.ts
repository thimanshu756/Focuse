/**
 * AI Service - Modular and Reusable AI Integration
 * Uses LangChain with Google Gemini (Free Tier)
 * 
 * Security Features:
 * - Input sanitization and validation
 * - Prompt injection protection
 * - Output structure validation
 * - Rate limiting and abuse prevention
 * - Comprehensive error handling
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import type {
  AIServiceRequest,
  AIServiceResponse,
  AIServiceError,
  AITaskBreakdownResponse,
  AIServiceConfig,
} from '../types/ai.types.js';
import type {
  AIInsightsInput,
  AIInsightsOutput,
  Insight,
  Recommendation,
  NextWeekPlan,
} from '../types/insights.types.js';

// Output schema for task breakdown
const TaskBreakdownSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().min(1).max(200).describe('Task title (1-200 characters)'),
        estimatedMinutes: z
          .number()
          .int()
          .min(5)
          .max(480)
          .describe('Estimated time in minutes (5-480)'),
        description: z
          .string()
          .max(500)
          .optional()
          .describe('Optional task description (max 500 characters)'),
      })
    )
    .min(1)
    .max(10)
    .describe('Array of 1-10 subtasks'),
});

type TaskBreakdownOutput = z.infer<typeof TaskBreakdownSchema>;

// Output schema for weekly insights
const WeeklyInsightsSchema = z.object({
  narrative: z.string().min(100).max(2000).describe('AI-generated narrative summary (100-2000 characters)'),
  insights: z
    .array(
      z.object({
        type: z.enum([
          'completion_rate',
          'best_time_of_day',
          'session_length',
          'failure_pattern',
          'productivity_trend',
          'streak_status',
          'task_completion',
          'consistency',
        ]).describe('Type of insight'),
        message: z.string().min(10).max(500).describe('Insight message'),
        confidence: z.number().min(0).max(1).describe('Confidence level (0-1)'),
        metric: z
          .object({
            current: z.union([z.string(), z.number()]).describe('Current metric value'),
            change: z.number().optional().describe('Percentage change'),
            trend: z.enum(['up', 'down', 'stable']).optional().describe('Trend direction'),
          })
          .optional(),
        severity: z.enum(['info', 'warning', 'critical']).optional().describe('Severity level'),
      })
    )
    .min(3)
    .max(8)
    .describe('Array of 3-8 insights'),
  recommendations: z
    .array(
      z.object({
        action: z.string().min(10).max(300).describe('Recommended action'),
        reason: z.string().min(10).max(300).describe('Reason for recommendation'),
        expectedImpact: z.string().min(10).max(300).describe('Expected impact'),
        priority: z.enum(['high', 'medium', 'low']).describe('Priority level'),
        category: z.enum([
          'session_timing',
          'session_duration',
          'break_management',
          'task_planning',
          'consistency',
        ]).describe('Recommendation category'),
        confidence: z.number().min(0).max(1).describe('Confidence level (0-1)'),
      })
    )
    .min(3)
    .max(5)
    .describe('Array of 3-5 recommendations'),
  nextWeekPlan: z.object({
    goal: z.string().min(10).max(200).describe('Next week goal'),
    suggestedSessions: z.number().int().min(1).max(50).describe('Suggested number of sessions'),
    suggestedDuration: z.number().int().min(15).max(120).describe('Suggested duration per session (minutes)'),
    bestTimeSlots: z
      .array(z.string().max(100))
      .min(1)
      .max(10)
      .describe('Best time slots for sessions'),
    focusAreas: z.array(z.string().max(100)).min(1).max(5).describe('Focus areas/task tags'),
  }).describe('Next week planning'),
  oneLeverToPull: z.string().min(20).max(500).describe('Single highest-impact change'),
});

type WeeklyInsightsOutput = z.infer<typeof WeeklyInsightsSchema>;

/**
 * Security: Input sanitization
 * Removes potentially dangerous patterns and normalizes input
 */
class InputSanitizer {
  private static readonly MAX_PROMPT_LENGTH = 2000;
  private static readonly DANGEROUS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  private static readonly PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(previous|above|all)\s+instructions?/gi,
    /forget\s+(everything|all|previous)/gi,
    /you\s+are\s+now/gi,
    /system\s*:?\s*you\s+are/gi,
    /assistant\s*:?\s*you\s+are/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ];

  /**
   * Sanitize user input to prevent injection attacks
   */
  static sanitize(prompt: string): string {
    if (!prompt || typeof prompt !== 'string') {
      throw new AppError('Invalid prompt: must be a non-empty string', 400, 'INVALID_INPUT');
    }

    // Trim and normalize whitespace
    let sanitized = prompt.trim().replace(/\s+/g, ' ');

    // Check length
    if (sanitized.length === 0) {
      throw new AppError('Prompt cannot be empty', 400, 'INVALID_INPUT');
    }

    if (sanitized.length > this.MAX_PROMPT_LENGTH) {
      throw new AppError(
        `Prompt too long: maximum ${this.MAX_PROMPT_LENGTH} characters`,
        400,
        'INPUT_TOO_LONG'
      );
    }

    // Remove dangerous HTML/JS patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Detect prompt injection attempts
    for (const pattern of this.PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        logger.warn('Potential prompt injection detected', {
          prompt: sanitized.substring(0, 100),
          pattern: pattern.toString(),
        });
        throw new AppError(
          'Invalid input detected. Please rephrase your request.',
          400,
          'SECURITY_VIOLATION'
        );
      }
    }

    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
  }

  /**
   * Validate prompt content quality
   */
  static validateQuality(prompt: string): void {
    // Check for minimum meaningful content
    const words = prompt.split(/\s+/).filter((w) => w.length > 0);
    if (words.length < 3) {
      throw new AppError('Prompt too short: provide more details', 400, 'INVALID_INPUT');
    }

    // Check for excessive repetition (potential abuse)
    const wordCounts = new Map<string, number>();
    for (const word of words) {
      wordCounts.set(word.toLowerCase(), (wordCounts.get(word.toLowerCase()) || 0) + 1);
    }
    const maxRepetition = Math.max(...Array.from(wordCounts.values()));
    if (maxRepetition > words.length * 0.3) {
      throw new AppError('Prompt contains excessive repetition', 400, 'INVALID_INPUT');
    }
  }
}

/**
 * AI Service - Main service class
 */
export class AIService {
  private model: ChatGoogleGenerativeAI;
  private insightsModel: ChatGoogleGenerativeAI; // Separate model for insights with higher token limit
  private readonly defaultConfig: Required<AIServiceConfig> = {
    maxRetries: 2,
    timeoutMs: 120000, // 120 seconds - matching Express timeout middleware
    temperature: 0.7,
    maxTokens: 2000,
  };

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required but not set in environment variables');
    }

    // Default model for task breakdown
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash', // Free tier model - fast and efficient
      temperature: this.defaultConfig.temperature,
      maxOutputTokens: this.defaultConfig.maxTokens,
      apiKey: env.GEMINI_API_KEY,
    });

    // Insights model with higher token limit (insights responses are larger)
    this.insightsModel = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxOutputTokens: 8192, // 8K tokens for comprehensive insights (increased from 4K)
      apiKey: env.GEMINI_API_KEY,
    });
  }

  /**
   * Generate task breakdown from user prompt
   */
  async generateTaskBreakdown(
    prompt: string,
    deadline: Date,
    priority?: string,
    config?: AIServiceConfig,
    requestId?: string
  ): Promise<AIServiceResponse<AITaskBreakdownResponse>> {
    const startTime = Date.now();
    const logContext = { requestId: requestId || 'unknown' };

    logger.info('AI service: Starting task breakdown generation', {
      ...logContext,
      promptLength: prompt.length,
      deadline: deadline.toISOString(),
      priority: priority || 'MEDIUM',
    });

    try {
      // 1. Sanitize and validate input
      logger.debug('AI service: Sanitizing input', logContext);
      const sanitizedPrompt = InputSanitizer.sanitize(prompt);
      InputSanitizer.validateQuality(sanitizedPrompt);
      logger.debug('AI service: Input sanitization completed', {
        ...logContext,
        sanitizedLength: sanitizedPrompt.length,
      });

      // 2. Validate deadline
      if (deadline <= new Date()) {
        logger.warn('AI service: Invalid deadline', {
          ...logContext,
          deadline: deadline.toISOString(),
          currentTime: new Date().toISOString(),
        });
        throw new AppError('Deadline must be in the future', 400, 'INVALID_DEADLINE');
      }

      // 3. Build prompt with system instructions and JSON schema
      logger.debug('AI service: Building system prompt', logContext);
      const systemPrompt = this.buildTaskBreakdownPrompt(sanitizedPrompt, deadline, priority);
      logger.debug('AI service: System prompt built', {
        ...logContext,
        promptLength: systemPrompt.length,
      });
      
      // Create JSON schema description for the AI
      const jsonSchema = {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', minLength: 1, maxLength: 200 },
                estimatedMinutes: { type: 'number', minimum: 5, maximum: 480 },
                description: { type: 'string', maxLength: 500 },
              },
              required: ['title', 'estimatedMinutes'],
            },
            minItems: 1,
            maxItems: 10,
          },
        },
        required: ['tasks'],
      };

      const fullPrompt = `${systemPrompt}

CRITICAL: You must return a valid JSON object matching this exact schema:
${JSON.stringify(jsonSchema, null, 2)}

REMEMBER: Return ONLY the raw JSON object. No markdown, no code blocks, no explanations, no additional text. Just the JSON starting with { and ending with }.`;

      logger.debug('AI service: Full prompt prepared', {
        ...logContext,
        fullPromptLength: fullPrompt.length,
      });

      // 5. Execute API call with timeout (no retries)
      const mergedConfig = { ...this.defaultConfig, ...config };
      logger.info('AI service: Invoking Gemini model', {
        ...logContext,
        model: 'gemini-2.5-flash',
        timeoutMs: mergedConfig.timeoutMs,
      });

      const apiCallStartTime = Date.now();
      logger.info('AI service: Making API call to Gemini', {
        ...logContext,
        promptLength: fullPrompt.length,
        apiCallStartTime: apiCallStartTime,
        timeoutMs: mergedConfig.timeoutMs,
      });


      let rawResponse: string;
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            logger.warn('AI service: Request timeout triggered', {
              ...logContext,
              timeoutMs: mergedConfig.timeoutMs,
            });
            reject(new Error(`Request timeout after ${mergedConfig.timeoutMs}ms`));
          }, mergedConfig.timeoutMs);
        });

        // Execute API call with timeout
        const apiCallPromise = this.model.invoke(fullPrompt).then((response) => {
          const callDuration = Date.now() - apiCallStartTime;
          
          logger.debug('AI service: Gemini API call completed', {
            ...logContext,
            callDurationMs: callDuration,
            responseType: typeof response,
            hasContent: !!response.content,
          });
          
          // LangChain returns AIMessage with content property
          const content = typeof response.content === 'string' 
            ? response.content 
            : String(response.content);
          
          logger.debug('AI service: Received response from Gemini', {
            ...logContext,
            responseLength: content.length,
            responsePreview: content.substring(0, 200),
          });
          
          return content;
        });

       
        rawResponse = await Promise.race([apiCallPromise, timeoutPromise]);
       logger.info('rawResponse', rawResponse);
      } catch (apiError) {
        const callDuration = Date.now() - apiCallStartTime;
        logger.error('AI service: Gemini API call failed', {
          ...logContext,
          callDurationMs: callDuration,
          error: apiError instanceof Error ? apiError.message : String(apiError),
          errorType: apiError instanceof Error ? apiError.constructor.name : 'Unknown',
          stack: apiError instanceof Error ? apiError.stack : undefined,
        });
        throw apiError;
      }

      const apiCallDuration = Date.now() - apiCallStartTime;
      logger.info('AI service: API call completed', {
        ...logContext,
        apiCallDurationMs: apiCallDuration,
        responseLength: rawResponse.length,
      });

      // 6. Parse and validate the response with robust error handling
      logger.debug('AI service: Parsing and validating response', logContext);
      let result: TaskBreakdownOutput;
      
      try {
        result = this.parseAndValidateResponse(rawResponse, logContext);
        logger.debug('AI service: Validation successful', {
          ...logContext,
          tasksCount: result.tasks.length,
        });
      } catch (parseError) {
        logger.error('AI service: Failed to parse AI response after all attempts', {
          ...logContext,
          error: parseError instanceof Error ? parseError.message : String(parseError),
          errorType: parseError instanceof z.ZodError ? 'ZodError' : 'ParseError',
          responsePreview: rawResponse.substring(0, 1000),
          fullResponseLength: rawResponse.length,
        });
        
        // User-friendly error message
        throw new AppError(
          'AI is unable to break down this task at the moment. Please try again or break it down manually.',
          500,
          'AI_BREAKDOWN_FAILED',
          { 
            originalError: parseError instanceof Error ? parseError.message : String(parseError),
            responsePreview: rawResponse.substring(0, 200)
          }
        );
      }

      // 8. Validate and transform output
      logger.debug('AI service: Validating and transforming output', logContext);
      const validatedResult = this.validateTaskBreakdownOutput(result);

      const latencyMs = Date.now() - startTime;

      logger.info('AI service: Task breakdown generated successfully', {
        ...logContext,
        promptLength: sanitizedPrompt.length,
        tasksCount: validatedResult.tasks.length,
        latencyMs,
        totalDurationMs: latencyMs,
      });

      return {
        data: validatedResult,
        latencyMs,
        model: 'gemini-1.5-flash',
        provider: 'google',
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      logger.error('AI service: Task breakdown failed', {
        ...logContext,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof AppError ? error.code : 'UNKNOWN',
        latencyMs,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw this.handleAIError(error);
    }
  }

  /**
   * Generate weekly insights from user analytics
   */
  async generateWeeklyInsights(
    input: AIInsightsInput,
    config?: AIServiceConfig,
    requestId?: string
  ): Promise<AIServiceResponse<AIInsightsOutput>> {
    const startTime = Date.now();
    const logContext = { requestId: requestId || 'unknown', userId: input.userId };

    logger.info('AI service: Starting weekly insights generation', {
      ...logContext,
      weekStart: input.weeklyStats.weekStart.toISOString(),
      weekEnd: input.weeklyStats.weekEnd.toISOString(),
      totalSessions: input.weeklyStats.totalSessions,
    });

    try {
      // 1. Validate input data
      if (!input.weeklyStats || input.weeklyStats.totalSessions === 0) {
        logger.warn('AI service: Insufficient data for insights', logContext);
        throw new AppError(
          'Not enough data to generate insights. Complete at least one session this week.',
          400,
          'INSUFFICIENT_DATA'
        );
      }

      // 2. Build insights prompt
      logger.debug('AI service: Building insights prompt', logContext);
      const systemPrompt = this.buildInsightsPrompt(input);
      logger.debug('AI service: Insights prompt built', {
        ...logContext,
        promptLength: systemPrompt.length,
      });

      // 3. Create JSON schema description for the AI with EXPLICIT enum values
      const jsonSchema = {
        type: 'object',
        properties: {
          narrative: { 
            type: 'string', 
            minLength: 100, 
            maxLength: 2000,
            description: 'Conversational summary of the week'
          },
          insights: {
            type: 'array',
            minItems: 3,
            maxItems: 8,
            items: {
              type: 'object',
              properties: {
                type: { 
                  type: 'string',
                  enum: ['completion_rate', 'best_time_of_day', 'session_length', 'failure_pattern', 'productivity_trend', 'streak_status', 'task_completion', 'consistency'],
                  description: 'MUST be one of these EXACT values: completion_rate, best_time_of_day, session_length, failure_pattern, productivity_trend, streak_status, task_completion, consistency'
                },
                message: { type: 'string', minLength: 10, maxLength: 500 },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                metric: { 
                  type: 'object', 
                  optional: true,
                  properties: {
                    current: { description: 'REQUIRED if metric is provided - string or number' },
                    change: { type: 'number', optional: true },
                    trend: { type: 'string', enum: ['up', 'down', 'stable'], optional: true }
                  }
                },
                severity: { type: 'string', enum: ['info', 'warning', 'critical'], optional: true },
              },
              required: ['type', 'message', 'confidence'],
            },
          },
          recommendations: {
            type: 'array',
            minItems: 3,
            maxItems: 5,
            items: {
              type: 'object',
              properties: {
                action: { type: 'string', minLength: 10, maxLength: 300 },
                reason: { type: 'string', minLength: 10, maxLength: 300, description: 'MUST be max 300 characters' },
                expectedImpact: { type: 'string', minLength: 10, maxLength: 300 },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                category: { type: 'string', enum: ['session_timing', 'session_duration', 'break_management', 'task_planning', 'consistency'] },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
              },
              required: ['action', 'reason', 'expectedImpact', 'priority', 'category', 'confidence'],
            },
          },
          nextWeekPlan: {
            type: 'object',
            properties: {
              goal: { type: 'string', minLength: 10, maxLength: 200 },
              suggestedSessions: { type: 'number', minimum: 1, maximum: 50 },
              suggestedDuration: { type: 'number', minimum: 15, maximum: 120, description: 'Duration in minutes' },
              bestTimeSlots: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 },
              focusAreas: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
            },
            required: ['goal', 'suggestedSessions', 'suggestedDuration', 'bestTimeSlots', 'focusAreas'],
          },
          oneLeverToPull: { type: 'string', minLength: 20, maxLength: 500, description: 'MUST be max 500 characters - be concise!' },
        },
        required: ['narrative', 'insights', 'recommendations', 'nextWeekPlan', 'oneLeverToPull'],
      };

      const fullPrompt = `${systemPrompt}

CRITICAL OUTPUT REQUIREMENTS:
1. You MUST return a COMPLETE and VALID JSON object
2. The JSON MUST match this exact schema:
${JSON.stringify(jsonSchema, null, 2)}

3. IMPORTANT: You MUST complete the ENTIRE JSON structure
4. Do NOT stop mid-generation - ensure all fields are populated
5. The response MUST end with a closing brace }
6. Return ONLY the raw JSON object - no markdown, no code blocks, no explanations
7. Start with { and end with }
8. Ensure all strings are properly closed with quotes
9. Ensure all arrays are properly closed with brackets
10. Ensure all objects are properly closed with braces

REMEMBER: COMPLETE THE ENTIRE JSON STRUCTURE BEFORE STOPPING!`;

      logger.debug('AI service: Full insights prompt prepared', {
        ...logContext,
        fullPromptLength: fullPrompt.length,
      });

      // 4. Execute API call with timeout
      const mergedConfig = { ...this.defaultConfig, ...config };
      logger.info('AI service: Invoking Gemini for insights', {
        ...logContext,
        model: 'gemini-2.5-flash',
        timeoutMs: mergedConfig.timeoutMs,
      });

      const apiCallStartTime = Date.now();
      let rawResponse: string;

      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            logger.warn('AI service: Insights request timeout', {
              ...logContext,
              timeoutMs: mergedConfig.timeoutMs,
            });
            reject(new Error(`Request timeout after ${mergedConfig.timeoutMs}ms`));
          }, mergedConfig.timeoutMs);
        });

        // Execute API call with timeout - use insightsModel for higher token limit
        const apiCallPromise = this.insightsModel.invoke(fullPrompt).then((response) => {
          const callDuration = Date.now() - apiCallStartTime;
          
          const content =
            typeof response.content === 'string' ? response.content : String(response.content);
          
          // Log response metadata to understand why generation stopped
          logger.debug('AI service: Gemini insights call completed', {
            ...logContext,
            callDurationMs: callDuration,
            contentLength: content.length,
            contentPreview: content.substring(0, 200),
            contentEnding: content.substring(Math.max(0, content.length - 100)),
            responseMetadata: response.response_metadata,
            finishReason: (response as any).response_metadata?.finishReason || 'unknown',
          });
          
          return content;
        });

        rawResponse = await Promise.race([apiCallPromise, timeoutPromise]);
      } catch (apiError) {
        const callDuration = Date.now() - apiCallStartTime;
        logger.error('AI service: Gemini insights call failed', {
          ...logContext,
          callDurationMs: callDuration,
          error: apiError instanceof Error ? apiError.message : String(apiError),
        });
        throw apiError;
      }

      const apiCallDuration = Date.now() - apiCallStartTime;
      logger.info('AI service: Insights API call completed', {
        ...logContext,
        apiCallDurationMs: apiCallDuration,
        responseLength: rawResponse.length,
      });

      // Log the FULL raw response for debugging
      logger.debug('AI service: Full raw response', {
        ...logContext,
        fullResponse: rawResponse,
        lastChars: rawResponse.substring(Math.max(0, rawResponse.length - 200)),
      });

      // 5. Parse and validate response
      logger.debug('AI service: Parsing insights response', logContext);
      let result: WeeklyInsightsOutput;

      try {
        result = this.parseAndValidateInsightsResponse(rawResponse, logContext);
        logger.debug('AI service: Insights validation successful', {
          ...logContext,
          insightsCount: result.insights.length,
          recommendationsCount: result.recommendations.length,
        });
      } catch (parseError) {
        logger.error('AI service: Failed to parse insights response', {
          ...logContext,
          error: parseError instanceof Error ? parseError.message : String(parseError),
          responsePreview: rawResponse.substring(0, 500),
          responseEnding: rawResponse.substring(Math.max(0, rawResponse.length - 200)),
          isIncomplete: !rawResponse.trim().endsWith('}'),
        });

        throw new AppError(
          'Failed to generate insights. Please try again.',
          500,
          'AI_INSIGHTS_GENERATION_FAILED',
          {
            originalError: parseError instanceof Error ? parseError.message : String(parseError),
          }
        );
      }

      const latencyMs = Date.now() - startTime;

      logger.info('AI service: Weekly insights generated successfully', {
        ...logContext,
        insightsCount: result.insights.length,
        recommendationsCount: result.recommendations.length,
        latencyMs,
      });

      return {
        data: result,
        latencyMs,
        model: 'gemini-2.5-flash',
        provider: 'google',
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      logger.error('AI service: Weekly insights generation failed', {
        ...logContext,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof AppError ? error.code : 'UNKNOWN',
        latencyMs,
      });

      throw this.handleAIError(error);
    }
  }

  /**
   * Generic AI request handler (for future use)
   */
  async processRequest<T>(
    request: AIServiceRequest
  ): Promise<AIServiceResponse<T>> {
    const startTime = Date.now();

    try {
      // Sanitize input
      const sanitizedPrompt = InputSanitizer.sanitize(request.prompt);
      InputSanitizer.validateQuality(sanitizedPrompt);

      // Route to appropriate handler based on request type
      switch (request.requestType) {
        case 'TASK_BREAKDOWN':
          return (await this.generateTaskBreakdown(
            sanitizedPrompt,
            request.context?.deadline ? new Date(request.context.deadline) : new Date(),
            request.context?.priority,
            request.config
          )) as AIServiceResponse<T>;
        case 'INSIGHT_GENERATE':
          if (!request.context?.insightsInput) {
            throw new AppError('Insights input required', 400, 'MISSING_INSIGHTS_INPUT');
          }
          return (await this.generateWeeklyInsights(
            request.context.insightsInput as AIInsightsInput,
            request.config
          )) as AIServiceResponse<T>;
        // Add other request types here as needed
        default:
          throw new AppError(
            `Unsupported request type: ${request.requestType}`,
            400,
            'UNSUPPORTED_REQUEST_TYPE'
          );
      }
    } catch (error) {
      throw this.handleAIError(error);
    }
  }

  /**
   * Build weekly insights prompt
   */
  private buildInsightsPrompt(input: AIInsightsInput): string {
    const { weeklyStats, userProfile, previousInsight } = input;

    // Format time of day data
    const timeOfDayData = [
      { period: 'Morning (6-11 AM)', time: weeklyStats.morningFocusTime },
      { period: 'Afternoon (12-5 PM)', time: weeklyStats.afternoonFocusTime },
      { period: 'Evening (6-11 PM)', time: weeklyStats.eveningFocusTime },
      { period: 'Night (12-5 AM)', time: weeklyStats.nightFocusTime },
    ]
      .sort((a, b) => b.time - a.time)
      .map((d) => `  - ${d.period}: ${Math.round(d.time / 60)} minutes`)
      .join('\n');

    // Format daily distribution
    const dailyData = weeklyStats.dailyDistribution
      .map(
        (d) =>
          `  - ${d.dayOfWeek}: ${d.completedSessions}/${d.totalSessions} sessions (${d.completionRate.toFixed(0)}% completion, ${Math.round(d.focusTime / 60)}min focus)`
      )
      .join('\n');

    // Format failure reasons
    const failureData =
      weeklyStats.failureReasons.length > 0
        ? weeklyStats.failureReasons
            .map((f) => `  - ${f.reason}: ${f.count} times (${f.percentage.toFixed(0)}%)`)
            .join('\n')
        : '  - No failures recorded';

    // Format session duration distribution
    const durationData = weeklyStats.sessionDurationDistribution
      .map((d) => `  - ${d.range}: ${d.count} sessions (${d.completionRate.toFixed(0)}% completion)`)
      .join('\n');

    // Previous insight context
    const previousContext = previousInsight
      ? `
PREVIOUS WEEK'S INSIGHT:
Previous recommendation: "${previousInsight.oneLeverToPull}"
Check if the user has improved on this recommendation and acknowledge it if they have.
`
      : '';

    return `You are an AI focus coach analyzing a user's productivity data for the past week. Your job is to provide personalized, actionable insights and recommendations.

USER PROFILE:
- Name: ${userProfile.name}
- Type: ${userProfile.userType || 'Not specified'}
- Preferred Focus Time: ${userProfile.preferredFocusTime || 'Not specified'}
- Current Streak: ${userProfile.currentStreak} days
- Longest Streak: ${userProfile.longestStreak} days
- Lifetime Stats: ${Math.round(userProfile.totalFocusTime / 3600)} hours over ${userProfile.totalSessions} sessions

WEEKLY STATS (${weeklyStats.weekStart.toLocaleDateString()} - ${weeklyStats.weekEnd.toLocaleDateString()}):
Session Performance:
  - Total Sessions: ${weeklyStats.totalSessions}
  - Completed: ${weeklyStats.completedSessions} (${weeklyStats.completionRate.toFixed(1)}%)
  - Failed: ${weeklyStats.failedSessions}
  - Total Focus Time: ${Math.round(weeklyStats.totalFocusTime / 60)} minutes
  - Average Session: ${Math.round(weeklyStats.averageSessionDuration / 60)} minutes
  - Longest Session: ${Math.round(weeklyStats.longestSession / 60)} minutes

Time of Day Breakdown:
${timeOfDayData}
Best Time: ${weeklyStats.bestTimeOfDay}

Daily Breakdown:
${dailyData}
Best Day: ${weeklyStats.bestDay || 'N/A'}
Worst Day: ${weeklyStats.worstDay || 'N/A'}

Failure Analysis:
${failureData}
Average time before giving up: ${Math.round(weeklyStats.averageFailureTime / 60)} minutes

Session Duration Distribution:
${durationData}

Task Completion:
  - Tasks Completed: ${weeklyStats.tasksCompleted}

Streak Status:
  - Current Streak: ${weeklyStats.streakData.currentStreak} days
  - Change from last week: ${weeklyStats.streakData.streakChange >= 0 ? '+' : ''}${weeklyStats.streakData.streakChange} days
${previousContext}

YOUR TASK:
Generate a comprehensive weekly review with:

1. NARRATIVE (100-2000 chars): 
   - Write a friendly, conversational summary of the week
   - Highlight the most important wins and challenges
   - Be specific with numbers
   - Use the user's name

2. INSIGHTS (3-8 items):
   - CRITICAL: Each insight "type" field MUST be EXACTLY one of these values:
     * completion_rate
     * best_time_of_day
     * session_length
     * failure_pattern
     * productivity_trend
     * streak_status
     * task_completion
     * consistency
   - DO NOT use any other values like "positive" or "area_for_improvement"
   - Mix different insight types to cover various aspects
   - Message: 10-500 characters
   - If including "metric", MUST have "current" field (string or number)
   - Confidence: 0 to 1 (decimal)
   - Severity (optional): 'info', 'warning', or 'critical'

3. RECOMMENDATIONS (3-5 items):
   - Action: 10-300 characters (stay under 300!)
   - Reason: 10-300 characters (MUST be under 300!)
   - ExpectedImpact: 10-300 characters
   - Priority: EXACTLY 'high', 'medium', or 'low'
   - Category: EXACTLY one of: session_timing, session_duration, break_management, task_planning, consistency
   - Confidence: 0 to 1 (decimal)

4. NEXT WEEK PLAN:
   - Set a specific, achievable goal
   - Suggest number of sessions and duration based on past success rates
   - Recommend best time slots based on historical performance
   - Identify 1-3 focus areas

5. ONE LEVER TO PULL (20-500 characters - BE CONCISE!):
   - Identify THE SINGLE most impactful change
   - Must be specific and measurable
   - Should address the biggest bottleneck in their productivity
   - CRITICAL: Keep under 500 characters total!

TONE:
- Encouraging but honest
- Data-driven, not generic
- Personalized to the user's actual performance
- Actionable, not just observational

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY valid JSON
- No markdown formatting (no \`\`\`json or \`\`\`)
- No explanations or additional text
- Just the raw JSON object starting with { and ending with }`;
  }

  /**
   * Build task breakdown prompt with security considerations
   */
  private buildTaskBreakdownPrompt(prompt: string, deadline: Date, priority?: string): string {
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return `You are a task management assistant. Your job is to break down a task into actionable subtasks.

TASK TO BREAK DOWN: "${prompt}"
DEADLINE: ${deadline.toISOString().split('T')[0]} (${daysUntilDeadline} days from now)
PRIORITY: ${priority || 'MEDIUM'}

CRITICAL INSTRUCTIONS:

Break this task into 2-8 clear, actionable subtasks

Each subtask must be specific and achievable

Estimate realistic time for each subtask (between 5 and 480 minutes)

Ensure the total estimated time is reasonable for the ${daysUntilDeadline}-day deadline

Use clear, concise titles (maximum 200 characters each)

Optional descriptions should be helpful but brief (maximum 500 characters)

TIME CONSTRAINT HANDLING (CRITICAL EDGE CASE RULE):

If the user explicitly mentions a total time duration in the task (e.g., "in 2 hours", "within 90 minutes", "in one day"), you MUST:

Detect and interpret that duration correctly

Treat it as a hard upper limit for total estimated time

Ensure the sum of all estimatedMinutes across subtasks does NOT exceed the mentioned duration

In this case, IGNORE the default deadline-based time distribution and strictly follow the user-provided time constraint

Distribute time proportionally and realistically across subtasks within the given duration

If the mentioned duration is very short, reduce the number of subtasks accordingly while keeping them meaningful

OUTPUT FORMAT REQUIREMENTS:

You MUST return ONLY a valid JSON object

Do NOT include any markdown formatting (no json or )

Do NOT include any explanations, comments, or additional text

Do NOT wrap the JSON in code blocks

Return ONLY the raw JSON object starting with { and ending with }

REQUIRED JSON STRUCTURE:
{
"tasks": [
{
"title": "Task title here (1-200 characters)",
"estimatedMinutes": 60,
"description": "Optional description (max 500 characters)"
}
]
}

Remember: Return ONLY the JSON object, nothing else.`;

  }

  /**
   * Parse and validate AI response with multiple fallback strategies
   */
  private parseAndValidateResponse(
    rawResponse: string,
    logContext: { requestId: string }
  ): TaskBreakdownOutput {
    let jsonStr = rawResponse.trim();
    const originalLength = jsonStr.length;
    
    logger.debug('AI service: Starting response parsing', {
      ...logContext,
      originalLength,
      firstChars: jsonStr.substring(0, 50),
    });

    // Strategy 1: Try direct JSON parse (if response is already clean JSON)
    try {
      const directParse = JSON.parse(jsonStr);
      const validated = TaskBreakdownSchema.parse(directParse);
      logger.debug('AI service: Direct JSON parse succeeded', logContext);
      return this.validateTaskBreakdownOutput(validated);
    } catch (e) {
      logger.debug('AI service: Direct parse failed, trying other strategies', {
        ...logContext,
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // Strategy 2: Remove markdown code blocks
    let cleaned = jsonStr
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const markdownParse = JSON.parse(cleaned);
      const validated = TaskBreakdownSchema.parse(markdownParse);
      logger.debug('AI service: Markdown removal parse succeeded', logContext);
      return this.validateTaskBreakdownOutput(validated);
    } catch (e) {
      logger.debug('AI service: Markdown removal parse failed', {
        ...logContext,
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // Strategy 3: Extract JSON object from text (find first { to last })
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extractedParse = JSON.parse(jsonMatch[0]);
        const validated = TaskBreakdownSchema.parse(extractedParse);
        logger.debug('AI service: JSON extraction parse succeeded', logContext);
        return this.validateTaskBreakdownOutput(validated);
      } catch (e) {
        logger.debug('AI service: JSON extraction parse failed', {
          ...logContext,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    // Strategy 4: Try to find JSON array if object not found
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        const arrayData = JSON.parse(arrayMatch[0]);
        // Wrap array in tasks object
        const wrapped = { tasks: Array.isArray(arrayData) ? arrayData : [arrayData] };
        const validated = TaskBreakdownSchema.parse(wrapped);
        logger.debug('AI service: Array wrapping parse succeeded', logContext);
        return this.validateTaskBreakdownOutput(validated);
      } catch (e) {
        logger.debug('AI service: Array wrapping parse failed', {
          ...logContext,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    // Strategy 5: Try to extract and fix common issues
    // Remove leading/trailing text, fix common JSON issues
    let fixed = cleaned
      .replace(/^[^{]*/, '') // Remove everything before first {
      .replace(/[^}]*$/, '}') // Remove everything after last }
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

    try {
      const fixedParse = JSON.parse(fixed);
      const validated = TaskBreakdownSchema.parse(fixedParse);
      logger.debug('AI service: Fixed JSON parse succeeded', logContext);
      return this.validateTaskBreakdownOutput(validated);
    } catch (e) {
      logger.debug('AI service: Fixed JSON parse failed', {
        ...logContext,
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // All strategies failed
    throw new Error('All parsing strategies failed');
  }

  /**
   * Parse and validate weekly insights response
   */
  private parseAndValidateInsightsResponse(
    rawResponse: string,
    logContext: { requestId: string; userId: string }
  ): WeeklyInsightsOutput {
    let jsonStr = rawResponse.trim();
    const originalLength = jsonStr.length;

    logger.info('AI service: Starting insights response parsing', {
      ...logContext,
      originalLength,
      firstChars: jsonStr.substring(0, 100),
      lastChars: jsonStr.substring(Math.max(0, jsonStr.length - 100)),
    });

    // Strategy 1: Try direct JSON parse
    try {
      const directParse = JSON.parse(jsonStr);
      logger.info('AI service: JSON parse successful, validating schema', {
        ...logContext,
        keys: Object.keys(directParse),
      });
      
      const validated = WeeklyInsightsSchema.parse(directParse);
      logger.info('AI service: Direct insights parse succeeded', logContext);
      return validated;
    } catch (e) {
      logger.error('AI service: Direct insights parse failed', {
        ...logContext,
        error: e instanceof Error ? e.message : String(e),
        errorDetails: e instanceof z.ZodError ? JSON.stringify(e.errors, null, 2) : undefined,
        errorStack: e instanceof Error ? e.stack : undefined,
      });
    }

    // Strategy 2: Remove markdown code blocks
    logger.info('AI service: Trying strategy 2 - markdown removal', logContext);
    let cleaned = jsonStr
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const markdownParse = JSON.parse(cleaned);
      const validated = WeeklyInsightsSchema.parse(markdownParse);
      logger.info('AI service: Markdown removal insights parse succeeded', logContext);
      return validated;
    } catch (e) {
      logger.error('AI service: Strategy 2 failed', {
        ...logContext,
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // Strategy 3: Extract JSON object from text
    logger.info('AI service: Trying strategy 3 - JSON extraction', logContext);
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extractedParse = JSON.parse(jsonMatch[0]);
        const validated = WeeklyInsightsSchema.parse(extractedParse);
        logger.info('AI service: JSON extraction insights parse succeeded', logContext);
        return validated;
      } catch (e) {
        logger.error('AI service: Strategy 3 failed', {
          ...logContext,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    } else {
      logger.error('AI service: Strategy 3 - No JSON object found in response', logContext);
    }

    // Strategy 4: Try to fix common JSON issues
    logger.info('AI service: Trying strategy 4 - fixing common JSON issues', logContext);
    let fixed = cleaned
      .replace(/^[^{]*/, '') // Remove everything before first {
      .replace(/[^}]*$/, '}') // Remove everything after last }
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

    try {
      const fixedParse = JSON.parse(fixed);
      const validated = WeeklyInsightsSchema.parse(fixedParse);
      logger.info('AI service: Fixed JSON insights parse succeeded', logContext);
      return validated;
    } catch (e) {
      logger.error('AI service: Strategy 4 failed - all strategies exhausted', {
        ...logContext,
        error: e instanceof Error ? e.message : String(e),
        errorDetails: e instanceof z.ZodError ? JSON.stringify(e.errors, null, 2) : undefined,
      });
    }

    // All strategies failed - log a sample of the response
    logger.error('AI service: All parsing strategies failed', {
      ...logContext,
      responseSample: jsonStr.substring(0, 1000),
      responseEnd: jsonStr.substring(Math.max(0, jsonStr.length - 500)),
    });
    
    throw new Error('All insights parsing strategies failed');
  }

  /**
   * Validate and sanitize task breakdown output structure
   */
  private validateTaskBreakdownOutput(output: any): AITaskBreakdownResponse {
    try {
      // Ensure output has tasks array
      if (!output || typeof output !== 'object') {
        throw new Error('Output is not an object');
      }

      // Handle case where tasks might be at root level or nested
      let tasks = output.tasks || output.task || output.subtasks || [];
      
      // If tasks is not an array, try to convert it
      if (!Array.isArray(tasks)) {
        if (tasks && typeof tasks === 'object') {
          tasks = [tasks];
        } else {
          tasks = [];
        }
      }

      // Validate task count
      if (tasks.length === 0) {
        throw new Error('No tasks found in response');
      }

      if (tasks.length > 10) {
        // Limit to 10 tasks
        tasks = tasks.slice(0, 10);
        logger.warn('AI returned too many tasks, limiting to 10', {
          originalCount: tasks.length,
        });
      }

      // Validate and sanitize each task
      const validatedTasks = tasks.map((task: any, index: number) => {
        // Extract title
        let title = task.title || task.name || task.task || String(task);
        if (typeof title !== 'string' || title.trim().length === 0) {
          throw new Error(`Task ${index + 1} has invalid or missing title`);
        }
        title = title.trim().substring(0, 200);

        // Extract estimatedMinutes
        let estimatedMinutes = task.estimatedMinutes || task.estimatedTime || task.duration || task.time || 30;
        if (typeof estimatedMinutes === 'string') {
          // Try to parse string numbers
          estimatedMinutes = parseInt(estimatedMinutes, 10) || 30;
        }
        if (typeof estimatedMinutes !== 'number' || isNaN(estimatedMinutes)) {
          estimatedMinutes = 30; // Default fallback
        }
        // Clamp to valid range
        estimatedMinutes = Math.max(5, Math.min(480, Math.round(estimatedMinutes)));

        // Extract description (optional)
        let description = task.description || task.desc || null;
        if (description && typeof description === 'string') {
          description = description.trim().substring(0, 500);
          if (description.length === 0) {
            description = null;
          }
        } else {
          description = null;
        }

        return {
          title,
          estimatedMinutes,
          ...(description && { description }),
        };
      });

      // Validate with Zod schema
      const validated = TaskBreakdownSchema.parse({ tasks: validatedTasks });

      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('AI output validation failed after sanitization', {
          errors: error.errors,
          output: JSON.stringify(output).substring(0, 500),
        });
        throw error;
      }
      throw error;
    }
  }


  /**
   * Handle and transform AI errors into AppErrors
   */
  private handleAIError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof z.ZodError) {
      return new AppError(
        'AI returned invalid response format',
        500,
        'INVALID_AI_RESPONSE',
        { validationErrors: error.errors }
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle specific Gemini API errors
    if (errorMessage.includes('API key')) {
      logger.error('Gemini API key error', { error: errorMessage });
      return new AppError('AI service configuration error', 500, 'AI_CONFIG_ERROR');
    }

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      logger.warn('Gemini API rate limit', { error: errorMessage });
      return new AppError(
        'AI service temporarily unavailable. Please try again later.',
        503,
        'AI_RATE_LIMITED'
      );
    }

    if (errorMessage.includes('timeout')) {
      return new AppError(
        'AI request timed out. Please try again.',
        504,
        'AI_TIMEOUT'
      );
    }

    // Generic error
    logger.error('Unexpected AI error', { error: errorMessage });
    return new AppError(
      'AI service error. Please try again later.',
      500,
      'AI_SERVICE_ERROR',
      { originalError: errorMessage }
    );
  }
}

// Export singleton instance
export const aiService = new AIService();
