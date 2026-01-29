import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { StatCard } from '@/components/dashboard/StatCard';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { QuickStartSession } from '@/components/dashboard/QuickStartSession';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useTasks } from '@/hooks/useTasks';
import { getTimeBasedGreeting, formatHours } from '@/utils/date.utils';
import * as SecureStore from 'expo-secure-store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Task } from '@/types/api.types';
import { api } from '@/services/api.service';

export default function Dashboard() {
  const router = useRouter();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [refreshing, setRefreshing] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fetch dashboard data
  const {
    user,
    tasks,
    isLoading: dataLoading,
    error: dataError,
    refetch: refetchDashboard,
  } = useDashboardData();

  const { data: weeklyData, isLoading: statsLoading } = useWeeklyStats();
  const { session: activeSession, isLoading: sessionLoading } = useActiveSession();

  // Task management
  const { createTask, updateTask, isCreating, isUpdating } = useTasks();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        router.replace('/auth/login' as any);
      }
    };
    checkAuth();
  }, [router]);

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let timeoutId: NodeJS.Timeout;

      const refetch = async () => {
        await refetchDashboard();
      };

      // Delay refetch slightly to avoid conflict with initial load
      timeoutId = setTimeout(refetch, 500);

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [refetchDashboard])
  );

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchDashboard();
    setRefreshing(false);
  };

  // Task modal handlers
  const handleOpenTaskModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
    } else {
      setEditingTask(null);
    }
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = async (data: any) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        Alert.alert('Success', 'Task updated successfully');
      } else {
        await createTask(data);
        Alert.alert('Success', 'Task created successfully');
      }
      handleCloseTaskModal();
      await refetchDashboard();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save task');
    }
  };

  // Handle task start session - navigate to dashboard with task preselected
  // The actual session creation happens in QuickStartSession component
  const handleStartSession = async (task: Task) => {
    try {
      const response = await api.post('/sessions', {
        taskId: task.id,
        duration: 25, // Default 25 minute session
      });
      if (response.data.success && response.data.data?.session) {
        router.push(`/session/${response.data.data.session.id}` as any);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to start session'
      );
    }
  };

  // Calculate stats
  const weeklyFocusTime = user?.totalFocusTime ? formatHours(user.totalFocusTime) : '0.0';
  const treesGrown = user?.completedSessions || 0;
  const currentStreak = user?.currentStreak || 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary.accent}
              colors={[COLORS.primary.accent]}
            />
          }
        >
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>
              {greeting.text}, {firstName}! {greeting.emoji}
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCardWrapper}>
              <StatCard
                icon="flame"
                label="Day Streak"
                value={currentStreak}
                color="red"
                isLoading={dataLoading}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                icon="time-outline"
                label="Focus Hours"
                value={weeklyFocusTime}
                color="blue"
                isLoading={dataLoading || statsLoading}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                icon="leaf"
                label="Trees Grown"
                value={treesGrown}
                color="green"
                isLoading={dataLoading}
              />
            </View>
          </View>

          {/* Today's Focus Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎯 Today's Focus</Text>
              <Pressable
                onPress={() => handleOpenTaskModal()}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
              >
                <Ionicons name="add-circle" size={32} color={COLORS.primary.accent} />
              </Pressable>
            </View>

            <View >
              {dataLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading tasks...</Text>
                </View>
              ) : dataError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={48} color={COLORS.error} />
                  <Text style={styles.errorText}>{dataError}</Text>
                  <Button
                    title="Retry"
                    variant="secondary"
                    size="sm"
                    onPress={refetchDashboard}
                  />
                </View>
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="No tasks yet"
                  description="Add your first task to start focusing"
                  actionLabel="Add Your First Task"
                  onAction={() => handleOpenTaskModal()}
                />
              ) : (
                <View>
                  {tasks.slice(0, 5).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPress={() => handleOpenTaskModal(task)}
                      onStartSession={handleStartSession}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Quick Start Session */}
          <View style={styles.section}>
            <QuickStartSession tasks={tasks} activeSession={activeSession} />
          </View>

          {/* Weekly Progress */}
          <View style={styles.section}>
            <WeeklyChart data={weeklyData} isLoading={statsLoading} />
          </View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      {/* Task Modal */}
      <TaskModal
        visible={showTaskModal}
        onClose={handleCloseTaskModal}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        isLoading={isCreating || isUpdating}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    padding: 4,
  },
  addButtonPressed: {
    opacity: 0.6,
  },
  bottomPadding: {
    height: SPACING.xxxl,
  },
  container: {
    backgroundColor: COLORS.background.gradient,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  errorText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  greeting: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
  },
  greetingSection: {
    marginBottom: SPACING.xxl,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  statCardWrapper: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },

});
