/**
 * Crash Reporting Service (Sentry)
 *
 * Wrapper around Sentry for crash reporting and error tracking.
 * Provides a unified interface for error logging across the app.
 */

let Sentry: any = null;
try {
  Sentry = require('@sentry/react-native');
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
   * Initialize Sentry crash reporting.
   * Call this in app entry point (_layout.tsx).
   *
   * In __DEV__ mode, Sentry initializes with debug:true so you can
   * verify events are being sent, but with a 100% sample rate.
   */
  initialize(): void {
    if (this.initialized) {
      console.warn('[Crashlytics] Already initialized');
      return;
    }

    if (!Sentry) {
      console.warn('[Crashlytics] Sentry module not loaded. Crash reporting disabled.');
      this.initialized = true;
      return;
    }

    // Try multiple sources for DSN — env var is most reliable in production builds
    const dsn =
      process.env.EXPO_PUBLIC_SENTRY_DSN ||
      Constants.expoConfig?.extra?.sentryDsn;

    if (!dsn) {
      console.warn('[Crashlytics] Sentry DSN not found. Crash reporting disabled.');
      console.warn('[Crashlytics] Check EXPO_PUBLIC_SENTRY_DSN env variable.');
      this.initialized = true;
      return;
    }

    const environment =
      process.env.EXPO_PUBLIC_ENVIRONMENT ||
      Constants.expoConfig?.extra?.environment ||
      'production';

    try {
      Sentry.init({
        dsn,
        debug: __DEV__, // Show Sentry debug logs in dev so you can verify it works
        environment,
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,

        // Release versioning
        release: `${Application.applicationId}@${Application.nativeApplicationVersion}`,
        dist: Application.nativeBuildVersion || undefined,

        // Performance monitoring
        tracesSampleRate: __DEV__ ? 1.0 : 0.2,

        // Session Replay
        replaysSessionSampleRate: __DEV__ ? 0 : 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Integrations — only add replay in production (heavy on perf)
        integrations: __DEV__
          ? []
          : [
              Sentry.mobileReplayIntegration(),
              Sentry.feedbackIntegration(),
            ],

        // Before send hook - filter sensitive data
        beforeSend(event: any) {
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['Cookie'];
          }
          return event;
        },
      });

      // Set device context
      this.setDeviceContext();

      this.initialized = true;
      console.log(`[Crashlytics] Initialized successfully (env: ${environment}, dev: ${__DEV__})`);
    } catch (error) {
      console.error('[Crashlytics] Initialization failed:', error);
      this.initialized = true;
    }
  }

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

  setUser(user: UserContext): void {
    if (!this.initialized || !Sentry) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });

    console.log('[Crashlytics] User context set:', user.id);
  }

  clearUser(): void {
    if (!this.initialized || !Sentry) return;

    Sentry.setUser(null);
    console.log('[Crashlytics] User context cleared');
  }

  logError(error: Error, metadata?: ErrorMetadata): void {
    console.error('[Crashlytics] Error:', error.message, metadata);

    if (!this.initialized || !Sentry) return;

    Sentry.captureException(error, {
      extra: metadata,
    });
  }

  logMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    metadata?: ErrorMetadata
  ): void {
    console.log(`[Crashlytics] ${level.toUpperCase()}: ${message}`, metadata);

    if (!this.initialized || !Sentry) return;

    Sentry.captureMessage(message, {
      level,
      extra: metadata,
    });
  }

  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (!this.initialized || !Sentry) return;

    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }

  testCrash(): void {
    console.warn('[Crashlytics] Triggering test crash');
    throw new Error('[TEST] Crashlytics test crash');
  }

  testError(): void {
    console.warn('[Crashlytics] Triggering test error');
    this.logError(new Error('[TEST] Crashlytics test error'), {
      testMetadata: 'This is a test error',
      timestamp: new Date().toISOString(),
    });
  }

  startTransaction(name: string, operation: string): any {
    if (!this.initialized || !Sentry) return null;
    const transaction = Sentry.startTransaction({
      name,
      op: operation,
    });
    return transaction;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const crashlyticsService = new CrashlyticsService();
export default CrashlyticsService;
