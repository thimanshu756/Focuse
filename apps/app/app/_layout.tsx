import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Services
import ErrorBoundary from '../src/components/shared/ErrorBoundary';
import { envService } from '../src/services/env.service';
import { crashlyticsService } from '../src/services/crashlytics.service';
import { analyticsService } from '../src/services/analytics.service';
import { databaseService } from '../src/services/database.service';
import { syncService } from '../src/services/sync.service';
import { notificationService } from '../src/services/notification.service';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const [loaded, error] = useFonts({
    // Add custom fonts here if needed
    // 'Inter': require('../assets/fonts/Inter-Regular.ttf'),
  });
  
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize services
  useEffect(() => {
    async function initializeServices() {
      try {
        console.log('[App] Initializing services...');
        
        // 0. Validate environment variables
        envService.validate();
        
        // 1. Initialize crash reporting (first, so we can track errors)
        crashlyticsService.initialize();
        
        // 2. Initialize analytics
        await analyticsService.initialize();
        
        // 3. Initialize database
        await databaseService.initialize();
        
        // 4. Initialize sync service (depends on database)
        await syncService.initialize();
        
        // 5. Initialize notifications
        await notificationService.initialize();
        
        console.log('[App] All services initialized successfully');
        setServicesInitialized(true);
      } catch (error) {
        console.error('[App] Service initialization failed:', error);
        setInitError((error as Error).message);
        
        // Still set as initialized to allow app to run
        // (some features may not work, but app shouldn't crash)
        setServicesInitialized(true);
      }
    }

    initializeServices();

    // Cleanup on unmount
    return () => {
      syncService.cleanup();
      notificationService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && servicesInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, servicesInitialized]);

  // Show loading screen while initializing
  if (!loaded || !servicesInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D7F50A" />
        <Text style={styles.loadingText}>Initializing...</Text>
        {initError && (
          <Text style={styles.errorText}>Warning: {initError}</Text>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="session/[id]"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="test-phase1"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F9FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
