import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { COLORS } from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login' as any);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FOCUSE</Text>
      <ActivityIndicator size="large" color={COLORS.primary.accent} />

      {/* Development: Quick access to Phase 1 testing */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => router.push('/test-phase1')}
        >
          <Text style={styles.testButtonText}>🧪 Test Phase 1</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background.gradient,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 24,
  },
  testButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#D7F50A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
