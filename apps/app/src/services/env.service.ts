/**
 * Environment Validation Service
 * 
 * Validates environment variables on app startup using Zod.
 * Ensures all required configuration is present and correctly formatted.
 */

import Constants from 'expo-constants';
import { z } from 'zod';

// Define environment schema
const envSchema = z.object({
  // Environment
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  
  // API Configuration
  apiUrl: z.string().url('API_URL must be a valid URL'),
  
  // Observability (optional in development)
  sentryDsn: z.string().url('SENTRY_DSN must be a valid URL').optional(),
  postHogApiKey: z.string().min(1, 'POSTHOG_API_KEY is required').optional(),
  postHogHost: z.string().url('POSTHOG_HOST must be a valid URL').default('https://app.posthog.com'),
  
  // EAS
  easProjectId: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

class EnvService {
  private env: Environment | null = null;
  private validated = false;

  /**
   * Validate environment variables on startup
   */
  validate(): Environment {
    if (this.validated && this.env) {
      return this.env;
    }

    const extra = Constants.expoConfig?.extra || {};

    // Parse and validate
    const result = envSchema.safeParse({
      environment: extra.environment,
      apiUrl: extra.apiUrl,
      sentryDsn: extra.sentryDsn,
      postHogApiKey: extra.postHogApiKey,
      postHogHost: extra.postHogHost,
      easProjectId: extra.eas?.projectId,
    });

    if (!result.success) {
      const errors = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      console.error('[Env] Validation failed:\n', errors);
      
      // In development, show warning but don't crash
      if (__DEV__) {
        console.warn('[Env] Running with invalid environment configuration');
        // Return default values for development
        this.env = {
          environment: 'development',
          apiUrl: 'http://localhost:8080/api',
          postHogHost: 'https://app.posthog.com',
        };
        this.validated = true;
        return this.env;
      }
      
      // In production, throw error
      throw new Error(`Environment validation failed:\n${errors}`);
    }

    this.env = result.data;
    this.validated = true;

    if (__DEV__) {
      console.log('[Env] Validation successful:', {
        environment: this.env.environment,
        apiUrl: this.env.apiUrl,
        sentryConfigured: !!this.env.sentryDsn,
        postHogConfigured: !!this.env.postHogApiKey,
      });
    }

    return this.env;
  }

  /**
   * Get validated environment
   */
  get(): Environment {
    if (!this.env) {
      return this.validate();
    }
    return this.env;
  }

  /**
   * Check if in development mode
   */
  isDevelopment(): boolean {
    return this.get().environment === 'development';
  }

  /**
   * Check if in staging mode
   */
  isStaging(): boolean {
    return this.get().environment === 'staging';
  }

  /**
   * Check if in production mode
   */
  isProduction(): boolean {
    return this.get().environment === 'production';
  }

  /**
   * Get API URL
   */
  getApiUrl(): string {
    return this.get().apiUrl;
  }

  /**
   * Check if crash reporting is configured
   */
  isCrashReportingEnabled(): boolean {
    return !!this.get().sentryDsn;
  }

  /**
   * Check if analytics is configured
   */
  isAnalyticsEnabled(): boolean {
    return !!this.get().postHogApiKey;
  }
}

// Export singleton instance
export const envService = new EnvService();

// Export class for testing
export default EnvService;
