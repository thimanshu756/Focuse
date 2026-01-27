import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useTasks, TaskFilters } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import { Task } from '@/types/api.types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function Tasks() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Derive filters for useTasks
  const getFilters = (): TaskFilters => {
    const filters: TaskFilters = {};
    if (activeFilter !== 'ALL') {
      filters.status = [activeFilter];
    }
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    }
    return filters;
  };

  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refetch,
    isCreating,
    isUpdating,
  } = useTasks(getFilters());

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
        await createTask({
          ...data,
          status: 'TODO',
        });
        Alert.alert('Success', 'Task created successfully');
      }
      handleCloseTaskModal();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
    }
  }

  const handleStartSession = (task: Task) => {
    router.push(`/session?taskId=${task.id}` as any);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => handleOpenTaskModal(item)}
      onStartSession={handleStartSession}
      onComplete={handleCompleteTask}
      onDelete={handleDeleteTask}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>Manage your focus tasks</Text>
        </View>
        <Pressable
          onPress={() => handleOpenTaskModal()}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Ionicons name="add" size={24} color={COLORS.text.primary} />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={COLORS.text.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.text.muted} />
          </Pressable>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setActiveFilter(item.value)}
              style={[
                styles.filterTag,
                activeFilter === item.value && styles.activeFilterTag,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item.value && styles.activeFilterText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.accent}
            colors={[COLORS.primary.accent]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyStateContainer}>
              <EmptyState
                icon="📝"
                title={search ? 'No tasks found' : 'No tasks yet'}
                description={search ? 'Try adjusting your search terms' : 'Add your first task to start focusing'}
                actionLabel={!search ? "Add Task" : undefined}
                onAction={!search ? () => handleOpenTaskModal() : undefined}
              />
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary.accent} />
            </View>
          ) : <View style={{ height: SPACING.xxl }} />
        }
      />

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
  container: {
    backgroundColor: COLORS.background.gradient,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: COLORS.primary.accent,
    borderRadius: BORDER_RADIUS.pill,
    padding: SPACING.md,
    shadowColor: COLORS.primary.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    height: '100%',
  },
  filtersContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.xl,
    paddingRight: SPACING.md,
  },
  filterTag: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilterTag: {
    backgroundColor: COLORS.text.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.text.white,
  },
  listContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    flexGrow: 1,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxxl * 2,
  },
});
