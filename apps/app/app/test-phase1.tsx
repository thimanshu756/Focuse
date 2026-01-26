/**
 * Phase 1 Testing Screen
 * 
 * This screen allows you to test all Phase 1 services:
 * - Crash Reporting (Sentry)
 * - Analytics (PostHog)
 * - Database (SQLite)
 * - Sync Service
 * - Notifications
 * - Environment Validation
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';

// Services
import { crashlyticsService } from '../src/services/crashlytics.service';
import { analyticsService } from '../src/services/analytics.service';
import { databaseService } from '../src/services/database.service';
import { syncService } from '../src/services/sync.service';
import { notificationService } from '../src/services/notification.service';
import { envService } from '../src/services/env.service';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export default function TestPhase1Screen() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (name: string, status: 'success' | 'error', message: string) => {
    setResults(prev => [...prev, { name, status, message }]);
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Environment Validation
    try {
      const env = envService.get();
      addResult(
        'Environment Validation',
        'success',
        `Environment: ${env.environment}\nAPI URL: ${env.apiUrl}`
      );
    } catch (error) {
      addResult('Environment Validation', 'error', (error as Error).message);
    }

    // Test 2: Crash Reporting
    try {
      if (crashlyticsService.isInitialized()) {
        crashlyticsService.logError(
          new Error('[TEST] Phase 1 test error'),
          { testTimestamp: new Date().toISOString() }
        );
        addResult('Crash Reporting', 'success', 'Test error logged to Sentry');
      } else {
        addResult('Crash Reporting', 'error', 'Sentry not initialized (check DSN)');
      }
    } catch (error) {
      addResult('Crash Reporting', 'error', (error as Error).message);
    }

    // Test 3: Analytics
    try {
      if (analyticsService.isInitialized()) {
        analyticsService.trackEvent('phase1_test', {
          testTimestamp: new Date().toISOString(),
          source: 'test_screen',
        });
        addResult('Analytics', 'success', 'Test event tracked in PostHog');
      } else {
        addResult('Analytics', 'error', 'PostHog not initialized (check API key)');
      }
    } catch (error) {
      addResult('Analytics', 'error', (error as Error).message);
    }

    // Test 4: Database - Create Task
    try {
      const testTask = {
        id: `test-task-${Date.now()}`,
        clientId: `client-${Date.now()}`,
        title: '[TEST] Phase 1 Test Task',
        description: 'This is a test task created during Phase 1 testing',
        priority: 'HIGH' as const,
        status: 'TODO' as const,
        userId: 'test-user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await databaseService.insertTask(testTask);
      
      const retrieved = await databaseService.getTask(testTask.id);
      if (retrieved) {
        addResult('Database - Create Task', 'success', `Task created: ${retrieved.title}`);
      } else {
        addResult('Database - Create Task', 'error', 'Task not found after creation');
      }
    } catch (error) {
      addResult('Database - Create Task', 'error', (error as Error).message);
    }

    // Test 5: Database - Stats
    try {
      const stats = await databaseService.getStats();
      addResult(
        'Database - Stats',
        'success',
        `Tasks: ${stats.tasksCount}\nUnsynced: ${stats.unsyncedTasksCount}\nSync Queue: ${stats.syncQueueCount}`
      );
    } catch (error) {
      addResult('Database - Stats', 'error', (error as Error).message);
    }

    // Test 6: Sync Service Status
    try {
      const syncStatus = await syncService.getSyncStatus();
      addResult(
        'Sync Service Status',
        'success',
        `Online: ${syncStatus.isOnline}\nSyncing: ${syncStatus.isSyncing}\nUnsynced: ${syncStatus.unsyncedItems}`
      );
    } catch (error) {
      addResult('Sync Service Status', 'error', (error as Error).message);
    }

    // Test 7: Notifications - Permission Check
    try {
      if (notificationService.isInitialized()) {
        addResult('Notifications - Init', 'success', 'Notification service initialized');
      } else {
        addResult('Notifications - Init', 'error', 'Notification service not initialized');
      }
    } catch (error) {
      addResult('Notifications - Init', 'error', (error as Error).message);
    }

    setTesting(false);
  };

  const testNotification = async () => {
    try {
      await notificationService.showNotification('session_completed', {
        title: '🎉 Phase 1 Test',
        body: 'Notification system is working correctly!',
      });
      Alert.alert('Success', 'Test notification sent! Check your notification tray.');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const testScheduledNotification = async () => {
    try {
      const notificationId = await notificationService.scheduleNotification(
        'session_reminder',
        {
          title: '⏰ Scheduled Test',
          body: 'This notification was scheduled 10 seconds ago',
        },
        10
      );
      Alert.alert('Success', `Notification scheduled (ID: ${notificationId.substring(0, 8)}...)\n\nIt will appear in 10 seconds.`);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const testCrash = () => {
    Alert.alert(
      'Test Crash',
      'This will crash the app to test crash reporting. The crash will be reported to Sentry.\n\nContinue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Crash App',
          style: 'destructive',
          onPress: () => crashlyticsService.testCrash(),
        },
      ]
    );
  };

  const clearTestData = async () => {
    Alert.alert(
      'Clear Test Data',
      'This will delete all test tasks from the database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get all tasks and delete test ones
              const tasks = await databaseService.getAllTasks('test-user-123');
              let deleted = 0;
              for (const task of tasks) {
                if (task.title.includes('[TEST]')) {
                  await databaseService.deleteTask(task.id);
                  deleted++;
                }
              }
              Alert.alert('Success', `Deleted ${deleted} test tasks`);
            } catch (error) {
              Alert.alert('Error', (error as Error).message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Phase 1 Testing</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🧪 Test All Services</Text>
          <Text style={styles.infoText}>
            This screen tests all Phase 1 services to ensure they're working correctly.
          </Text>
        </View>

        {/* Run All Tests Button */}
        <TouchableOpacity
          style={[styles.primaryButton, testing && styles.buttonDisabled]}
          onPress={runAllTests}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.primaryButtonText}>Run All Tests</Text>
          )}
        </TouchableOpacity>

        {/* Test Results */}
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            {results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  {result.status === 'success' ? (
                    <CheckCircle2 size={20} color="#22C55E" />
                  ) : (
                    <XCircle size={20} color="#EF4444" />
                  )}
                  <Text style={styles.resultName}>{result.name}</Text>
                </View>
                <Text style={styles.resultMessage}>{result.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Individual Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Tests</Text>

          <TouchableOpacity style={styles.button} onPress={testNotification}>
            <Text style={styles.buttonText}>📱 Test Immediate Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testScheduledNotification}>
            <Text style={styles.buttonText}>⏰ Test Scheduled Notification (10s)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={clearTestData}>
            <Text style={styles.buttonText}>🗑️ Clear Test Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={testCrash}
          >
            <Text style={[styles.buttonText, styles.dangerButtonText]}>
              💥 Test Crash (Destructive)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Service Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Status</Text>
          <View style={styles.statusCard}>
            <StatusRow
              label="Crash Reporting"
              status={crashlyticsService.isInitialized()}
            />
            <StatusRow label="Analytics" status={analyticsService.isInitialized()} />
            <StatusRow label="Database" status={databaseService.isInitialized()} />
            <StatusRow
              label="Notifications"
              status={notificationService.isInitialized()}
            />
            <StatusRow label="Environment" status={true} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatusRow({ label, status }: { label: string; status: boolean }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={[styles.statusBadge, status ? styles.statusActive : styles.statusInactive]}>
        <Text style={styles.statusBadgeText}>{status ? 'Active' : 'Inactive'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0F172A',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#E9F0FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#D7F50A',
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    textAlign: 'center',
  },
  dangerButton: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  dangerButtonText: {
    color: '#DC2626',
  },
  resultsContainer: {
    marginTop: 24,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  resultMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
});
