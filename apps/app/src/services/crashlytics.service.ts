/**
 * Crash Reporting Service (Sentry)
 * 
 * Wrapper around Sentry for crash reporting and error tracking.
 * Provides a unified interface for error logging across the app.
 */

// Conditional Sentry import - only load if not in dev mode
let Sentry: any = null;
try {
  if (!__DEV__) {
    Sentry = require('@sentry/react-native');
  }
} catch (error) {
  console.warn('[Crashlytics] Sentry not available:', error);
}

import * as Application from 'expo-application';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

interface UserContext {
  id: string;
  email?: string;
  name?: string;
}

interface ErrorMetadata {
  [key: string]: any;
}

class CrashlyticsService {
  private initialized = false;

  /**
   * Initialize Sentry crash reporting
   * Call this in app entry point (_layout.tsx)
   */
  initialize(): void {
    if (this.initialized) {
      console.warn('[Crashlytics] Already initialized');
      return;
    }

    // Only initialize in non-development environments
    if (__DEV__) {
      console.log('[Crashlytics] Skipping initialization in development mode');
      this.initialized = true;
      return;
    }

    if (!Sentry) {
      console.warn('[Crashlytics] Sentry module not loaded. Crash reporting disabled.');
      this.initialized = true;
      return;
    }

    const dsn = Constants.expoConfig?.extra?.sentryDsn;

    if (!dsn) {
      console.warn('[Crashlytics] Sentry DSN not found. Crash reporting disabled.');
      return;
    }

    try {
      Sentry.init({
        dsn,
        debug: false, // Set to true for debugging
        environment: Constants.expoConfig?.extra?.environment || 'production',
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000, // 30 seconds

        // Release versioning
        release: `${Application.applicationId}@${Application.nativeApplicationVersion}`,
        dist: Application.nativeBuildVersion || undefined,

        // Performance monitoring
        tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% of transactions in production

        // Integrations (optional - comment out if not available in your Sentry version)
        // integrations: [],

        // Before send hook - filter sensitive data
        beforeSend(event, hint) {
          // Filter out sensitive data
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['Cookie'];
          }

          // Log in dev for debugging
          if (__DEV__) {
            console.log('[Crashlytics] Event:', event);
          }

          return event;
        },
      });

      // Set device context
      this.setDeviceContext();

      this.initialized = true;
      console.log('[Crashlytics] Initialized successfully');
    } catch (error) {
      console.error('[Crashlytics] Initialization failed:', error);
    }
  }

  /**
   * Set device context for better debugging
   */
  private setDeviceContext(): void {
    if (!Sentry) return;
    Sentry.setContext('device', {
      manufacturer: Device.manufacturer,
      model: Device.modelName,
      brand: Device.brand,
      osName: Device.osName,
      osVersion: Device.osVersion,
      appVersion: Application.nativeApplicationVersion,
      buildVersion: Application.nativeBuildVersion,
    });
  }

  /**
   * Set user context (call after login)
   */
  setUser(user: UserContext): void {
    if (!this.initialized || !Sentry) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });

    console.log('[Crashlytics] User context set:', user.id);
  }

  /**
   * Clear user context (call after logout)
   */
  clearUser(): void {
    if (!this.initialized || !Sentry) return;

    Sentry.setUser(null);
    console.log('[Crashlytics] User context cleared');
  }

  /**
   * Log a non-fatal error
   */
  logError(error: Error, metadata?: ErrorMetadata): void {
    if (!this.initialized || !Sentry) {
      console.error('[Crashlytics] Not initialized. Error:', error, metadata);
      return;
    }

    Sentry.captureException(error, {
      extra: metadata,
    });

    if (__DEV__) {
      console.error('[Crashlytics] Error logged:', error, metadata);
    }
  }

  /**
   * Log a message (info, warning, error)
   */
  logMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    metadata?: ErrorMetadata
  ): void {
    if (!this.initialized || !Sentry) {
      console.log(`[Crashlytics] Not initialized. ${level.toUpperCase()}: ${message}`, metadata);
      return;
    }

    Sentry.captureMessage(message, {
      level,
      extra: metadata,
    });

    if (__DEV__) {
      console.log(`[Crashlytics] Message logged [${level}]:`, message, metadata);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (!this.initialized || !Sentry) return;

    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });

    if (__DEV__) {
      console.log('[Crashlytics] Breadcrumb:', category, message, data);
    }
  }

  /**
   * Test crash reporting (use for testing only)
   */
  testCrash(): void {
    console.warn('[Crashlytics] Triggering test crash');
    throw new Error('[TEST] Crashlytics test crash');
  }

  /**
   * Test error logging (use for testing only)
   */
  testError(): void {
    console.warn('[Crashlytics] Triggering test error');
    this.logError(new Error('[TEST] Crashlytics test error'), {
      testMetadata: 'This is a test error',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start a transaction for performance monitoring
   * Note: This feature requires additional Sentry configuration
   */
  startTransaction(name: string, operation: string): any {
    if (!this.initialized) return null;

    // Performance monitoring is available through Sentry.startTransaction
    // but might require additional setup. Returning null for now.
    console.log('[Crashlytics] Transaction:', name, operation);
    return null;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const crashlyticsService = new CrashlyticsService();

// Export class for testing
export default CrashlyticsService;
