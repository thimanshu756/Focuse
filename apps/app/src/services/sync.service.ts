/**
 * Sync Service
 * 
 * Handles synchronization between local SQLite database and remote API.
 * Implements offline-first architecture with conflict resolution.
 * 
 * Conflict Resolution Strategy: Last-Write-Wins (server timestamp)
 */

import NetInfo from '@react-native-community/netinfo';
import { databaseService, TaskRecord, SessionRecord } from './database.service';
import { api } from './api.service';
import { analyticsService } from './analytics.service';
import { crashlyticsService } from './crashlytics.service';

interface SyncResult {
  success: boolean;
  tasksSynced: number;
  sessionsSynced: number;
  conflicts: number;
  errors: string[];
}

interface SyncOperation {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
}

interface SyncResponse {
  success: boolean;
  data: {
    synced: number;
    conflicts: number;
    mapping?: Record<string, string>; // temp ID to server ID mapping
    serverTasks?: any[];
    serverSessions?: any[];
    lastSyncedAt: string;
  };
}

class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncedAt: string | null = null;
  private netInfoUnsubscribe: (() => void) | null = null;
  private isOnline = true;

  /**
   * Initialize sync service
   * - Start network status listener
   * - Load last sync timestamp
   * - Set up auto-sync on network reconnect
   */
  async initialize(): Promise<void> {
    // Initialize database if not already done
    if (!databaseService.isInitialized()) {
      await databaseService.initialize();
    }

    // Load last sync timestamp from storage
    this.lastSyncedAt = await this.getLastSyncTimestamp();

    // Listen to network status changes
    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (__DEV__) {
        console.log('[Sync] Network status:', this.isOnline ? 'Online' : 'Offline');
      }

      // If we just came back online, trigger a sync
      if (wasOffline && this.isOnline) {
        console.log('[Sync] Network reconnected, triggering sync');
        this.sync().catch(error => {
          console.error('[Sync] Auto-sync failed:', error);
        });
      }
    });

    // Set up periodic sync (every 5 minutes when online)
    this.startPeriodicSync(5 * 60 * 1000); // 5 minutes

    console.log('[Sync] Initialized successfully');
  }

  /**
   * Start periodic background sync
   */
  private startPeriodicSync(intervalMs: number): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync(true).catch(error => {
          console.error('[Sync] Periodic sync failed:', error);
        });
      }
    }, intervalMs);
  }

  /**
   * Check if device is online
   */
  async checkNetworkStatus(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  /**
   * Main sync function
   * Syncs both tasks and sessions with the server
   */
  async sync(isAutomatic = false): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[Sync] Sync already in progress, skipping');
      return {
        success: false,
        tasksSynced: 0,
        sessionsSynced: 0,
        conflicts: 0,
        errors: ['Sync already in progress'],
      };
    }

    // Check network status
    const isOnline = await this.checkNetworkStatus();
    if (!isOnline) {
      console.log('[Sync] Device is offline, skipping sync');
      return {
        success: false,
        tasksSynced: 0,
        sessionsSynced: 0,
        conflicts: 0,
        errors: ['Device is offline'],
      };
    }

    this.isSyncing = true;
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      tasksSynced: 0,
      sessionsSynced: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // Track sync start
      const unsyncedTasks = await databaseService.getUnsyncedTasks();
      const unsyncedSessions = await databaseService.getUnsyncedSessions();
      const totalItems = unsyncedTasks.length + unsyncedSessions.length;

      if (totalItems > 0) {
        analyticsService.trackSyncStarted(totalItems, isAutomatic);
      }

      // Sync tasks
      if (unsyncedTasks.length > 0) {
        const taskResult = await this.syncTasks(unsyncedTasks);
        result.tasksSynced = taskResult.synced;
        result.conflicts += taskResult.conflicts;
      }

      // Sync sessions
      if (unsyncedSessions.length > 0) {
        const sessionResult = await this.syncSessions(unsyncedSessions);
        result.sessionsSynced = sessionResult.synced;
        result.conflicts += sessionResult.conflicts;
      }

      // Update last synced timestamp
      this.lastSyncedAt = new Date().toISOString();
      await this.saveLastSyncTimestamp(this.lastSyncedAt);

      // Track sync completion
      const duration = Date.now() - startTime;
      analyticsService.trackSyncCompleted(
        result.tasksSynced,
        result.sessionsSynced,
        result.conflicts,
        duration
      );

      console.log('[Sync] Completed:', result);
    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
      
      crashlyticsService.logError(error as Error, {
        context: 'sync_service',
        unsyncedTasksCount: (await databaseService.getUnsyncedTasks()).length,
        unsyncedSessionsCount: (await databaseService.getUnsyncedSessions()).length,
      });

      analyticsService.trackSyncFailed(
        (error as Error).message,
        result.tasksSynced + result.sessionsSynced
      );

      console.error('[Sync] Failed:', error);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Sync tasks with server
   */
  private async syncTasks(tasks: TaskRecord[]): Promise<SyncResponse['data']> {
    const operations: SyncOperation[] = tasks.map(task => ({
      id: task.clientId || task.id,
      operation: task.clientId ? 'CREATE' : 'UPDATE',
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
      },
      timestamp: task.updatedAt,
    }));

    try {
      const response = await api.post<SyncResponse>('/sync/tasks', {
        clientId: await this.getDeviceId(),
        lastSyncedAt: this.lastSyncedAt,
        operations,
      });

      const { data } = response.data;

      // Handle ID mapping for newly created tasks
      if (data.mapping) {
        for (const [clientId, serverId] of Object.entries(data.mapping)) {
          const task = tasks.find(t => t.clientId === clientId);
          if (task) {
            // Update local task with server ID
            await databaseService.updateTask(task.id, {
              id: serverId,
              clientId: undefined,
            });
            await databaseService.markTaskSynced(serverId);
          }
        }
      }

      // Mark synced tasks
      for (const task of tasks) {
        if (!task.clientId) {
          await databaseService.markTaskSynced(task.id);
        }
      }

      // Update local database with server changes
      if (data.serverTasks && data.serverTasks.length > 0) {
        for (const serverTask of data.serverTasks) {
          await this.mergeServerTask(serverTask);
        }
      }

      return data;
    } catch (error) {
      console.error('[Sync] Task sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync sessions with server
   */
  private async syncSessions(sessions: SessionRecord[]): Promise<SyncResponse['data']> {
    const operations: SyncOperation[] = sessions.map(session => ({
      id: session.clientId || session.id,
      operation: session.clientId ? 'CREATE' : 'UPDATE',
      data: {
        taskId: session.taskId,
        duration: session.duration,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        pausedAt: session.pausedAt,
        status: session.status,
      },
      timestamp: session.updatedAt,
    }));

    try {
      const response = await api.post<SyncResponse>('/sync/sessions', {
        clientId: await this.getDeviceId(),
        lastSyncedAt: this.lastSyncedAt,
        operations,
      });

      const { data } = response.data;

      // Handle ID mapping for newly created sessions
      if (data.mapping) {
        for (const [clientId, serverId] of Object.entries(data.mapping)) {
          const session = sessions.find(s => s.clientId === clientId);
          if (session) {
            // Update local session with server ID
            await databaseService.updateSession(session.id, {
              id: serverId,
              clientId: undefined,
            });
            await databaseService.markSessionSynced(serverId);
          }
        }
      }

      // Mark synced sessions
      for (const session of sessions) {
        if (!session.clientId) {
          await databaseService.markSessionSynced(session.id);
        }
      }

      // Update local database with server changes
      if (data.serverSessions && data.serverSessions.length > 0) {
        for (const serverSession of data.serverSessions) {
          await this.mergeServerSession(serverSession);
        }
      }

      return data;
    } catch (error) {
      console.error('[Sync] Session sync failed:', error);
      throw error;
    }
  }

  /**
   * Merge server task with local task (conflict resolution)
   * Strategy: Server wins if server timestamp > local timestamp
   */
  private async mergeServerTask(serverTask: any): Promise<void> {
    const localTask = await databaseService.getTask(serverTask.id);

    if (!localTask) {
      // Task doesn't exist locally, insert it
      await databaseService.insertTask({
        ...serverTask,
        synced: 1,
      });
      return;
    }

    // Compare timestamps
    const serverTime = new Date(serverTask.updatedAt).getTime();
    const localTime = new Date(localTask.updatedAt).getTime();

    if (serverTime > localTime) {
      // Server is newer, update local
      await databaseService.updateTask(localTask.id, {
        ...serverTask,
        synced: 1,
      });
      console.log('[Sync] Task updated from server:', localTask.id);
    } else {
      // Local is newer or same, mark as synced
      await databaseService.markTaskSynced(localTask.id);
    }
  }

  /**
   * Merge server session with local session (conflict resolution)
   */
  private async mergeServerSession(serverSession: any): Promise<void> {
    const localSession = await databaseService.getSession(serverSession.id);

    if (!localSession) {
      // Session doesn't exist locally, insert it
      await databaseService.insertSession({
        ...serverSession,
        synced: 1,
      });
      return;
    }

    // Compare timestamps
    const serverTime = new Date(serverSession.updatedAt).getTime();
    const localTime = new Date(localSession.updatedAt).getTime();

    if (serverTime > localTime) {
      // Server is newer, update local
      await databaseService.updateSession(localSession.id, {
        ...serverSession,
        synced: 1,
      });
      console.log('[Sync] Session updated from server:', localSession.id);
    } else {
      // Local is newer or same, mark as synced
      await databaseService.markSessionSynced(localSession.id);
    }
  }

  /**
   * Get device ID for sync tracking
   */
  private async getDeviceId(): Promise<string> {
    // Import AsyncStorage dynamically to avoid circular dependencies
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    let deviceId = await AsyncStorage.getItem('device_id');
    
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
  }

  /**
   * Get last sync timestamp
   */
  private async getLastSyncTimestamp(): Promise<string | null> {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return await AsyncStorage.getItem('last_synced_at');
  }

  /**
   * Save last sync timestamp
   */
  private async saveLastSyncTimestamp(timestamp: string): Promise<void> {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem('last_synced_at', timestamp);
  }

  /**
   * Force sync now (manual trigger)
   */
  async forceSyncNow(): Promise<SyncResult> {
    console.log('[Sync] Force sync triggered');
    return await this.sync(false);
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    isSyncing: boolean;
    isOnline: boolean;
    lastSyncedAt: string | null;
    unsyncedItems: number;
  }> {
    const stats = await databaseService.getStats();
    
    return {
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      lastSyncedAt: this.lastSyncedAt,
      unsyncedItems: stats.unsyncedTasksCount + stats.unsyncedSessionsCount,
    };
  }

  /**
   * Cleanup and stop sync service
   */
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }

    console.log('[Sync] Cleanup completed');
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Export class for testing
export default SyncService;
