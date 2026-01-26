/**
 * Analytics Service (PostHog)
 * 
 * Wrapper around PostHog for product analytics and user tracking.
 * Provides a unified interface for tracking events, screen views, and user properties.
 */

import PostHog from 'posthog-react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

interface UserProperties {
  id: string;
  email?: string;
  name?: string;
  createdAt?: string;
  [key: string]: any;
}

interface EventProperties {
  [key: string]: any;
}

class AnalyticsService {
  private client: PostHog | null = null;
  private initialized = false;

  /**
   * Initialize PostHog analytics
   * Call this in app entry point (_layout.tsx)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[Analytics] Already initialized');
      return;
    }

    const apiKey = Constants.expoConfig?.extra?.postHogApiKey;
    const host = Constants.expoConfig?.extra?.postHogHost;

    if (!apiKey) {
      console.warn('[Analytics] PostHog API key not found. Analytics disabled.');
      return;
    }

    try {
      this.client = new PostHog(apiKey, {
        host: host || 'https://app.posthog.com',
        captureAppLifecycleEvents: true, // Auto-capture app open, close
        flushAt: 5, // Send events after 5 events
        flushInterval: 30, // Send events every 30 seconds
      } as any); // Using 'as any' due to PostHog types not being fully up to date

      // Set device properties
      this.setDeviceProperties();

      this.initialized = true;
      console.log('[Analytics] Initialized successfully');

      // Track app open
      this.trackEvent('app_opened', {
        app_version: Application.nativeApplicationVersion,
        build_version: Application.nativeBuildVersion,
        os: Device.osName,
        os_version: Device.osVersion,
      });
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
    }
  }

  /**
   * Set device properties as super properties
   */
  private setDeviceProperties(): void {
    if (!this.client) return;

    this.client.register({
      app_version: Application.nativeApplicationVersion,
      build_version: Application.nativeBuildVersion,
      platform: Device.osName,
      platform_version: Device.osVersion,
      device_model: Device.modelName,
      device_manufacturer: Device.manufacturer,
    });
  }

  /**
   * Identify user (call after login)
   */
  identifyUser(userId: string, properties?: UserProperties): void {
    if (!this.client) {
      console.warn('[Analytics] Not initialized. Cannot identify user.');
      return;
    }

    this.client.identify(userId, properties);
    console.log('[Analytics] User identified:', userId);
  }

  /**
   * Reset user identity (call after logout)
   */
  reset(): void {
    if (!this.client) return;

    this.client.reset();
    console.log('[Analytics] User identity reset');
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: EventProperties): void {
    if (!this.client) {
      if (__DEV__) {
        console.log('[Analytics] Not initialized. Event:', eventName, properties);
      }
      return;
    }

    this.client.capture(eventName, properties);

    if (__DEV__) {
      console.log('[Analytics] Event tracked:', eventName, properties);
    }
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties?: EventProperties): void {
    if (!this.client) return;

    this.client.screen(screenName, properties);

    if (__DEV__) {
      console.log('[Analytics] Screen tracked:', screenName, properties);
    }
  }

  /**
   * Set user properties (without identifying)
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.client) return;

    // Note: setPersonProperties might not be available in all PostHog versions
    // As a workaround, we'll use group or register
    this.client.register(properties);

    if (__DEV__) {
      console.log('[Analytics] User properties set:', properties);
    }
  }

  /**
   * Track timing (e.g., how long an operation took)
   */
  trackTiming(eventName: string, durationMs: number, properties?: EventProperties): void {
    this.trackEvent(eventName, {
      ...properties,
      duration_ms: durationMs,
      duration_seconds: Math.round(durationMs / 1000),
    });
  }

  /**
   * Feature flag helpers
   */
  async isFeatureEnabled(featureKey: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.isFeatureEnabled(featureKey);
      return result ?? false;
    } catch (error) {
      console.error('[Analytics] Feature flag check failed:', error);
      return false;
    }
  }

  async getFeatureFlag(featureKey: string): Promise<boolean | string | undefined> {
    if (!this.client) return undefined;

    try {
      return await this.client.getFeatureFlag(featureKey);
    } catch (error) {
      console.error('[Analytics] Feature flag retrieval failed:', error);
      return undefined;
    }
  }

  /**
   * Flush events immediately
   */
  flush(): void {
    if (!this.client) return;

    this.client.flush();
    console.log('[Analytics] Events flushed');
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  // ======================
  // APP-SPECIFIC EVENTS
  // ======================

  // Authentication Events
  trackLogin(method: 'email' | 'google' | 'biometric'): void {
    this.trackEvent('user_logged_in', { method });
  }

  trackSignup(method: 'email' | 'google'): void {
    this.trackEvent('user_signed_up', { method });
  }

  trackLogout(): void {
    this.trackEvent('user_logged_out');
  }

  // Task Events
  trackTaskCreated(taskId: string, priority: string, isOffline: boolean): void {
    this.trackEvent('task_created', {
      task_id: taskId,
      priority,
      offline: isOffline,
    });
  }

  trackTaskCompleted(taskId: string, durationMinutes: number): void {
    this.trackEvent('task_completed', {
      task_id: taskId,
      duration_minutes: durationMinutes,
    });
  }

  trackTaskDeleted(taskId: string): void {
    this.trackEvent('task_deleted', { task_id: taskId });
  }

  trackTaskEdited(taskId: string, fieldsChanged: string[]): void {
    this.trackEvent('task_edited', {
      task_id: taskId,
      fields_changed: fieldsChanged,
    });
  }

  // Session Events
  trackSessionStarted(sessionId: string, taskId: string | null, durationMinutes: number): void {
    this.trackEvent('session_started', {
      session_id: sessionId,
      task_id: taskId,
      duration_minutes: durationMinutes,
    });
  }

  trackSessionPaused(sessionId: string, elapsedMinutes: number): void {
    this.trackEvent('session_paused', {
      session_id: sessionId,
      elapsed_minutes: elapsedMinutes,
    });
  }

  trackSessionResumed(sessionId: string): void {
    this.trackEvent('session_resumed', { session_id: sessionId });
  }

  trackSessionCompleted(sessionId: string, durationMinutes: number, wasSuccessful: boolean): void {
    this.trackEvent('session_completed', {
      session_id: sessionId,
      duration_minutes: durationMinutes,
      successful: wasSuccessful,
    });
  }

  trackSessionCancelled(sessionId: string, elapsedMinutes: number): void {
    this.trackEvent('session_cancelled', {
      session_id: sessionId,
      elapsed_minutes: elapsedMinutes,
    });
  }

  // Sync Events
  trackSyncStarted(itemCount: number, isAutomatic: boolean): void {
    this.trackEvent('sync_started', {
      item_count: itemCount,
      automatic: isAutomatic,
    });
  }

  trackSyncCompleted(syncedTasks: number, syncedSessions: number, conflicts: number, durationMs: number): void {
    this.trackEvent('sync_completed', {
      synced_tasks: syncedTasks,
      synced_sessions: syncedSessions,
      conflicts,
      duration_ms: durationMs,
    });
  }

  trackSyncFailed(error: string, itemCount: number): void {
    this.trackEvent('sync_failed', {
      error,
      item_count: itemCount,
    });
  }

  // App Events
  trackAppBackgrounded(activeScreenName: string): void {
    this.trackEvent('app_backgrounded', {
      active_screen: activeScreenName,
    });
  }

  trackAppForegrounded(): void {
    this.trackEvent('app_foregrounded');
  }

  trackUpdateAvailable(currentVersion: string, newVersion: string): void {
    this.trackEvent('update_available', {
      current_version: currentVersion,
      new_version: newVersion,
    });
  }

  trackUpdateInstalled(version: string): void {
    this.trackEvent('update_installed', { version });
  }

  // Error Events
  trackError(errorType: string, errorMessage: string, screenName?: string): void {
    this.trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      screen: screenName,
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export class for testing
export default AnalyticsService;
