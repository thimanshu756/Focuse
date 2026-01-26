/**
 * Notification Service
 * 
 * Handles push notifications using Expo Notifications.
 * Manages permissions, device registration, and notification scheduling.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api.service';
import { analyticsService } from './analytics.service';
import { crashlyticsService } from './crashlytics.service';

// Notification types
export type NotificationType = 
  | 'session_reminder'
  | 'session_started'
  | 'session_completed'
  | 'session_failed'
  | 'task_due'
  | 'streak_milestone'
  | 'daily_reminder';

interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
}

interface ScheduledNotification {
  id: string;
  trigger: Date | number; // Date or delay in seconds
  content: NotificationContent;
}

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private pushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private initialized = false;

  /**
   * Initialize notification service
   * - Request permissions
   * - Get push token
   * - Register device with backend
   * - Set up notification listeners
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[Notifications] Already initialized');
      return;
    }

    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        console.warn('[Notifications] Permission denied');
        return;
      }

      // Get push token
      this.pushToken = await this.getPushToken();
      
      if (!this.pushToken) {
        console.warn('[Notifications] Failed to get push token');
        return;
      }

      // Register device with backend
      await this.registerDevice(this.pushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }

      this.initialized = true;
      console.log('[Notifications] Initialized successfully');
    } catch (error) {
      console.error('[Notifications] Initialization failed:', error);
      crashlyticsService.logError(error as Error, {
        context: 'notification_initialization',
      });
    }
  }

  /**
   * Request notification permissions
   * Handles Android 13+ runtime permissions
   */
  async requestPermissions(): Promise<boolean> {
    // Check if we're on a physical device
    if (!Device.isDevice) {
      console.warn('[Notifications] Must use physical device for push notifications');
      return false;
    }

    try {
      // Get current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return false;
      }

      console.log('[Notifications] Permission granted');
      return true;
    } catch (error) {
      console.error('[Notifications] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Get Expo push token
   */
  private async getPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.error('[Notifications] EAS project ID not found');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('[Notifications] Push token:', tokenData.data);
      return tokenData.data;
    } catch (error) {
      console.error('[Notifications] Failed to get push token:', error);
      crashlyticsService.logError(error as Error, {
        context: 'get_push_token',
      });
      return null;
    }
  }

  /**
   * Register device with backend
   */
  private async registerDevice(pushToken: string): Promise<void> {
    try {
      await api.post('/devices', {
        deviceId: await this.getDeviceId(),
        platform: Platform.OS,
        osVersion: Device.osVersion,
        appVersion: Constants.expoConfig?.version,
        pushToken,
      });

      console.log('[Notifications] Device registered successfully');
    } catch (error) {
      console.error('[Notifications] Device registration failed:', error);
      // Don't throw - this is not critical for app functionality
    }
  }

  /**
   * Set up Android notification channel (required for Android 8.0+)
   */
  private async setupAndroidChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D7F50A',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('sessions', {
      name: 'Focus Sessions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#D7F50A',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#D7F50A',
      sound: 'default',
    });

    console.log('[Notifications] Android channels configured');
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notifications] Notification received:', notification);
      
      analyticsService.trackEvent('notification_received', {
        type: notification.request.content.data?.type,
        title: notification.request.content.title,
      });
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('[Notifications] Notification tapped:', data);
      
      analyticsService.trackEvent('notification_tapped', {
        type: data?.type,
        action: data?.action,
      });

      // Handle notification action
      this.handleNotificationAction(data);
    });
  }

  /**
   * Handle notification tap actions
   */
  private handleNotificationAction(data: any): void {
    // TODO: Implement navigation based on notification type
    // Example:
    // if (data?.type === 'session_completed') {
    //   navigation.navigate('Forest');
    // } else if (data?.type === 'task_due') {
    //   navigation.navigate('Tasks');
    // }
    
    console.log('[Notifications] Handle action for:', data);
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    type: NotificationType,
    content: NotificationContent,
    trigger: Date | number
  ): Promise<string> {
    try {
      const notificationTrigger: Notifications.NotificationTriggerInput =
        trigger instanceof Date
          ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger }
          : { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: trigger, repeats: false };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: { ...content.data, type },
          sound: content.sound !== false,
          badge: content.badge,
        },
        trigger: notificationTrigger,
      });

      console.log('[Notifications] Notification scheduled:', notificationId, type);
      return notificationId;
    } catch (error) {
      console.error('[Notifications] Schedule failed:', error);
      crashlyticsService.logError(error as Error, {
        context: 'schedule_notification',
        type,
      });
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('[Notifications] Notification cancelled:', notificationId);
    } catch (error) {
      console.error('[Notifications] Cancel failed:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[Notifications] All notifications cancelled');
    } catch (error) {
      console.error('[Notifications] Cancel all failed:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[Notifications] Get scheduled failed:', error);
      return [];
    }
  }

  /**
   * Show immediate notification (for testing or local events)
   */
  async showNotification(
    type: NotificationType,
    content: NotificationContent
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: { ...content.data, type },
          sound: content.sound !== false,
        },
        trigger: null, // Show immediately
      });
      
      console.log('[Notifications] Immediate notification shown:', type);
    } catch (error) {
      console.error('[Notifications] Show notification failed:', error);
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('[Notifications] Set badge count failed:', error);
    }
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  // ======================
  // APP-SPECIFIC NOTIFICATIONS
  // ======================

  /**
   * Schedule session start reminder
   */
  async scheduleSessionReminder(sessionId: string, delaySeconds: number): Promise<string> {
    return await this.scheduleNotification(
      'session_reminder',
      {
        title: '⏰ Time to Focus!',
        body: 'Your focus session is about to begin. Ready to get started?',
        data: { sessionId },
      },
      delaySeconds
    );
  }

  /**
   * Show session completed notification
   */
  async notifySessionCompleted(duration: number, taskTitle?: string): Promise<void> {
    await this.showNotification('session_completed', {
      title: '🎉 Session Completed!',
      body: taskTitle
        ? `Great work on "${taskTitle}"! ${duration} minutes of focused work.`
        : `Awesome! You focused for ${duration} minutes. Keep it up!`,
      data: { duration, taskTitle },
    });
  }

  /**
   * Show session failed notification
   */
  async notifySessionFailed(reason: string): Promise<void> {
    await this.showNotification('session_failed', {
      title: '😔 Session Interrupted',
      body: reason || 'Your focus session was interrupted. Try again when you\'re ready!',
      data: { reason },
    });
  }

  /**
   * Schedule task due reminder
   */
  async scheduleTaskDueReminder(
    taskId: string,
    taskTitle: string,
    dueDate: Date
  ): Promise<string> {
    // Schedule 1 hour before due date
    const reminderDate = new Date(dueDate.getTime() - 60 * 60 * 1000);
    
    if (reminderDate.getTime() < Date.now()) {
      throw new Error('Cannot schedule reminder in the past');
    }

    return await this.scheduleNotification(
      'task_due',
      {
        title: '📌 Task Due Soon',
        body: `"${taskTitle}" is due in 1 hour!`,
        data: { taskId, taskTitle },
      },
      reminderDate
    );
  }

  /**
   * Schedule daily reminder
   */
  async scheduleDailyReminder(hour: number, minute: number): Promise<string> {
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledDate.getTime() < now.getTime()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    return await this.scheduleNotification(
      'daily_reminder',
      {
        title: '🌲 Time to Focus',
        body: 'Plant a tree today! Start a focus session and grow your forest.',
      },
      scheduledDate
    );
  }

  /**
   * Show streak milestone notification
   */
  async notifyStreakMilestone(days: number): Promise<void> {
    await this.showNotification('streak_milestone', {
      title: '🔥 Streak Milestone!',
      body: `Amazing! You've maintained a ${days}-day focus streak. Keep going!`,
      data: { days },
    });
  }

  /**
   * Get device ID
   */
  private async getDeviceId(): Promise<string> {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    let deviceId = await AsyncStorage.getItem('device_id');
    
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
  }

  /**
   * Get push token
   */
  getPushTokenSync(): string | null {
    return this.pushToken;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    console.log('[Notifications] Cleanup completed');
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export class for testing
export default NotificationService;
