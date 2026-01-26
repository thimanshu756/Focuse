/**
 * Database Service (SQLite)
 * 
 * Manages local SQLite database for offline storage.
 * Stores tasks, sessions, and sync queue for offline-first functionality.
 */

import * as SQLite from 'expo-sqlite';
import { crashlyticsService } from './crashlytics.service';

// Database version for migration management
const DATABASE_NAME = 'forest_focus.db';
const DATABASE_VERSION = 1;

// Type definitions for database records
export interface TaskRecord {
  id: string;
  clientId?: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  userId: string;
  createdAt: string;
  updatedAt: string;
  synced: number; // 0 = not synced, 1 = synced
}

export interface SessionRecord {
  id: string;
  clientId?: string;
  taskId?: string;
  duration: number;
  startedAt: string;
  completedAt?: string;
  pausedAt?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  userId: string;
  createdAt: string;
  updatedAt: string;
  synced: number; // 0 = not synced, 1 = synced
}

export interface SyncQueueRecord {
  id: number;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'TASK' | 'SESSION';
  entityId: string;
  data: string; // JSON stringified data
  timestamp: string;
  retryCount: number;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  /**
   * Initialize database and create tables
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[Database] Already initialized');
      return;
    }

    try {
      // Open database
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');

      // Create tables
      await this.createTables();

      // Run migrations if needed
      await this.runMigrations();

      this.initialized = true;
      console.log('[Database] Initialized successfully');
    } catch (error) {
      console.error('[Database] Initialization failed:', error);
      crashlyticsService.logError(error as Error, {
        context: 'database_initialization',
      });
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTablesSQL = `
      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        clientId TEXT UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
        status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
        userId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT tasks_clientId_unique UNIQUE (clientId)
      );

      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        clientId TEXT UNIQUE,
        taskId TEXT,
        duration INTEGER NOT NULL,
        startedAt TEXT NOT NULL,
        completedAt TEXT,
        pausedAt TEXT,
        status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED')),
        userId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL,
        CONSTRAINT sessions_clientId_unique UNIQUE (clientId)
      );

      -- Sync queue table
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL CHECK(operation IN ('CREATE', 'UPDATE', 'DELETE')),
        entity TEXT NOT NULL CHECK(entity IN ('TASK', 'SESSION')),
        entityId TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        retryCount INTEGER NOT NULL DEFAULT 0
      );

      -- Indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_synced ON tasks(synced);
      CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_sessions_taskId ON sessions(taskId);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
      CREATE INDEX IF NOT EXISTS idx_sessions_synced ON sessions(synced);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity, entityId);
    `;

    await this.db.execAsync(createTablesSQL);
    console.log('[Database] Tables created successfully');
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    // Get current version
    const currentVersion = await this.getDatabaseVersion();

    if (currentVersion < DATABASE_VERSION) {
      console.log(`[Database] Running migrations from v${currentVersion} to v${DATABASE_VERSION}`);
      
      // Add migration logic here as needed
      // Example:
      // if (currentVersion < 2) {
      //   await this.db.execAsync('ALTER TABLE tasks ADD COLUMN newColumn TEXT;');
      // }

      // Update version
      await this.setDatabaseVersion(DATABASE_VERSION);
    }
  }

  /**
   * Get current database version
   */
  private async getDatabaseVersion(): Promise<number> {
    if (!this.db) return 0;

    try {
      const result = await this.db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version;'
      );
      return result?.user_version || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Set database version
   */
  private async setDatabaseVersion(version: number): Promise<void> {
    if (!this.db) return;

    await this.db.execAsync(`PRAGMA user_version = ${version};`);
    console.log(`[Database] Version updated to ${version}`);
  }

  // ======================
  // TASKS OPERATIONS
  // ======================

  async insertTask(task: Omit<TaskRecord, 'synced'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO tasks (id, clientId, title, description, priority, status, userId, createdAt, updatedAt, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        task.id,
        task.clientId || null,
        task.title,
        task.description || null,
        task.priority,
        task.status,
        task.userId,
        task.createdAt,
        task.updatedAt,
      ]
    );
  }

  async updateTask(id: string, updates: Partial<TaskRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    await this.db.runAsync(
      `UPDATE tasks SET ${setClause}, updatedAt = ?, synced = 0 WHERE id = ?`,
      [...values, new Date().toISOString(), id]
    );
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  }

  async getTask(id: string): Promise<TaskRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    const task = await this.db.getFirstAsync<TaskRecord>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    return task || null;
  }

  async getAllTasks(userId: string): Promise<TaskRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const tasks = await this.db.getAllAsync<TaskRecord>(
      'SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    return tasks;
  }

  async getUnsyncedTasks(): Promise<TaskRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const tasks = await this.db.getAllAsync<TaskRecord>(
      'SELECT * FROM tasks WHERE synced = 0'
    );
    return tasks;
  }

  async markTaskSynced(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('UPDATE tasks SET synced = 1 WHERE id = ?', [id]);
  }

  // ======================
  // SESSIONS OPERATIONS
  // ======================

  async insertSession(session: Omit<SessionRecord, 'synced'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO sessions (id, clientId, taskId, duration, startedAt, completedAt, pausedAt, status, userId, createdAt, updatedAt, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        session.id,
        session.clientId || null,
        session.taskId || null,
        session.duration,
        session.startedAt,
        session.completedAt || null,
        session.pausedAt || null,
        session.status,
        session.userId,
        session.createdAt,
        session.updatedAt,
      ]
    );
  }

  async updateSession(id: string, updates: Partial<SessionRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    await this.db.runAsync(
      `UPDATE sessions SET ${setClause}, updatedAt = ?, synced = 0 WHERE id = ?`,
      [...values, new Date().toISOString(), id]
    );
  }

  async deleteSession(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
  }

  async getSession(id: string): Promise<SessionRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    const session = await this.db.getFirstAsync<SessionRecord>(
      'SELECT * FROM sessions WHERE id = ?',
      [id]
    );
    return session || null;
  }

  async getAllSessions(userId: string): Promise<SessionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const sessions = await this.db.getAllAsync<SessionRecord>(
      'SELECT * FROM sessions WHERE userId = ? ORDER BY startedAt DESC',
      [userId]
    );
    return sessions;
  }

  async getUnsyncedSessions(): Promise<SessionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const sessions = await this.db.getAllAsync<SessionRecord>(
      'SELECT * FROM sessions WHERE synced = 0'
    );
    return sessions;
  }

  async markSessionSynced(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('UPDATE sessions SET synced = 1 WHERE id = ?', [id]);
  }

  // ======================
  // SYNC QUEUE OPERATIONS
  // ======================

  async addToSyncQueue(
    operation: SyncQueueRecord['operation'],
    entity: SyncQueueRecord['entity'],
    entityId: string,
    data: object
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO sync_queue (operation, entity, entityId, data, timestamp, retryCount)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [operation, entity, entityId, JSON.stringify(data), new Date().toISOString()]
    );
  }

  async getSyncQueue(): Promise<SyncQueueRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const queue = await this.db.getAllAsync<SyncQueueRecord>(
      'SELECT * FROM sync_queue ORDER BY timestamp ASC'
    );
    return queue;
  }

  async removeFromSyncQueue(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  }

  async incrementSyncRetryCount(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE sync_queue SET retryCount = retryCount + 1 WHERE id = ?',
      [id]
    );
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM sync_queue');
  }

  // ======================
  // UTILITY OPERATIONS
  // ======================

  /**
   * Clear all data (use for logout)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      DELETE FROM sync_queue;
      DELETE FROM sessions;
      DELETE FROM tasks;
    `);
    console.log('[Database] All data cleared');
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    tasksCount: number;
    sessionsCount: number;
    unsyncedTasksCount: number;
    unsyncedSessionsCount: number;
    syncQueueCount: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [tasks, sessions, unsyncedTasks, unsyncedSessions, syncQueue] = await Promise.all([
      this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks'),
      this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sessions'),
      this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks WHERE synced = 0'),
      this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sessions WHERE synced = 0'),
      this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sync_queue'),
    ]);

    return {
      tasksCount: tasks?.count || 0,
      sessionsCount: sessions?.count || 0,
      unsyncedTasksCount: unsyncedTasks?.count || 0,
      unsyncedSessionsCount: unsyncedSessions?.count || 0,
      syncQueueCount: syncQueue?.count || 0,
    };
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
      console.log('[Database] Closed successfully');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Export class for testing
export default DatabaseService;
