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

    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash', // Free tier model - fast and efficient
      temperature: this.defaultConfig.temperature,
      maxOutputTokens: this.defaultConfig.maxTokens,
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
1. Break this task into 2-8 clear, actionable subtasks
2. Each subtask must be specific and achievable
3. Estimate realistic time for each subtask (between 5 and 480 minutes)
4. Ensure the total estimated time is reasonable for the ${daysUntilDeadline}-day deadline
5. Use clear, concise titles (maximum 200 characters each)
6. Optional descriptions should be helpful but brief (maximum 500 characters)

OUTPUT FORMAT REQUIREMENTS:
- You MUST return ONLY a valid JSON object
- Do NOT include any markdown formatting (no \`\`\`json or \`\`\`)
- Do NOT include any explanations, comments, or additional text
- Do NOT wrap the JSON in code blocks
- Return ONLY the raw JSON object starting with { and ending with }

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
