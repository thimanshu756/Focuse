import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { useForestData } from '@/hooks/useForestData';
import { ForestStats } from '@/components/forest/ForestStats';
import { ForestFilters } from '@/components/forest/ForestFilters';
import { TreeItem } from '@/components/forest/TreeItem';
import { TreeDetailModal } from '@/components/forest/TreeDetailModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { Session } from '@/types/api.types';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  CancelAnimation
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const TREE_SIZE = (width - (SPACING.xl * 2)) / COLUMN_COUNT - 12;

const Cloud = ({ style, duration, startPos }: { style: any, duration: number, startPos: number }) => {
  const translateX = useSharedValue(startPos);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width + 100, { duration: duration, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <Animated.Text style={[style, animatedStyle, { position: 'absolute' }]}>
      ☁️
    </Animated.Text>
  );
};

export default function Forest() {
  const {
    sessions,
    stats,
    isLoading,
    dateFilter,
    setDateFilter,
    refetch
  } = useForestData();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTreePress = (session: Session) => {
    setSelectedSession(session);
  };

  const renderTree = ({ item }: { item: Session }) => (
    <TreeItem
      session={item}
      onPress={handleTreePress}
      size={TREE_SIZE}
    />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E0F2FE', '#E0F2FE', '#F0FDF4']} // Sky blue to Mint green
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Clouds */}
      <Cloud style={{ top: 60, opacity: 0.6, fontSize: 40 }} duration={25000} startPos={-50} />
      <Cloud style={{ top: 120, opacity: 0.4, fontSize: 30 }} duration={35000} startPos={-100} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Forest</Text>
          <Text style={styles.subtitle}>Your focus journey growing day by day</Text>
        </View>

        <ForestStats stats={stats} isLoading={isLoading} />
        <ForestFilters dateFilter={dateFilter} onDateFilterChange={setDateFilter} />

        <FlatList
          data={sessions}
          renderItem={renderTree}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary.accent}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="🌱"
                  title="No trees found"
                  description={
                    dateFilter !== 'all'
                      ? "Try changing the date filter to see more trees."
                      : "Complete focus sessions to grow your forest!"
                  }
                />
              </View>
            ) : null
          }
        />

        <TreeDetailModal
          session={selectedSession}
          visible={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    minHeight: 300,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  emptyContainer: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
  },
});
