import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View, Text, ActivityIndicator, StyleSheet, Linking, Alert } from 'react-native';

// Services
import ErrorBoundary from '../src/components/shared/ErrorBoundary';
import { envService } from '../src/services/env.service';
import { crashlyticsService } from '../src/services/crashlytics.service';
import { analyticsService } from '../src/services/analytics.service';
import { databaseService } from '../src/services/database.service';
import { syncService } from '../src/services/sync.service';
import { notificationService } from '../src/services/notification.service';
import { useAuthStore } from '../src/stores/auth.store';
import { DEEP_LINK_SCHEME } from '../src/constants/config';
import * as Sentry from '@sentry/react-native';




// Initialize Sentry immediately for performance monitoring
crashlyticsService.initialize();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();

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


        // 2. Initialize analytics
        await analyticsService.initialize();

        // 3. Initialize database
        await databaseService.initialize();

        // 4. Initialize sync service (depends on database)
        await syncService.initialize();

        // 5. Initialize notifications
        await notificationService.initialize();

        // 6. Configure Google Sign-In (safe to fail in Expo Go)
        try {
          const { configureGoogleSignIn } = require('../src/config/google-signin.config');
          configureGoogleSignIn();
        } catch (e) {
          console.log('[App] Google Sign-In not available in this environment');
        }

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

  // Deep link event listener for payment callbacks
  useEffect(() => {
    if (!servicesInitialized) return;

    const handleDeepLink = async (url: string) => {
      console.log('[Deep Link] Received URL:', url);

      try {
        // Validate deep link scheme
        if (!url.startsWith(DEEP_LINK_SCHEME)) {
          console.warn('[Deep Link] Invalid scheme, ignoring:', url);
          return;
        }

        // Parse URL and extract route
        const route = url.replace(DEEP_LINK_SCHEME, '');
        const [path, queryString] = route.split('?');

        console.log('[Deep Link] Parsed route:', { path, queryString });

        // Handle different deep link routes
        switch (path) {
          case 'payment-success':
            await handlePaymentSuccess();
            break;

          case 'payment-failure':
            await handlePaymentFailure(queryString);
            break;

          case 'home':
            router.replace('/(tabs)');
            break;

          default:
            console.warn('[Deep Link] Unknown route:', path);
        }
      } catch (error) {
        console.error('[Deep Link] Error handling deep link:', error);
        Alert.alert(
          'Navigation Error',
          'Unable to process the link. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };

    const handlePaymentSuccess = async () => {
      console.log('[Deep Link] Payment successful, refreshing user data');

      try {
        // Refresh user data to get updated subscription status
        await checkAuth();

        Alert.alert(
          'Payment Successful! 🎉',
          'Your PRO subscription is now active. Enjoy unlimited focus sessions!',
          [
            {
              text: 'View Profile',
              onPress: () => router.replace('/(tabs)/profile'),
            },
            {
              text: 'Start Focusing',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } catch (error) {
        console.error('[Deep Link] Failed to refresh user data:', error);
        Alert.alert(
          'Payment Successful',
          'Your subscription is active! Please refresh the app to see your PRO features.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      }
    };

    const handlePaymentFailure = async (queryString?: string) => {
      console.log('[Deep Link] Payment failed');

      // Parse query parameters to extract failure reason
      let reason = 'Payment was not completed';

      if (queryString) {
        const params = new URLSearchParams(queryString);
        const encodedReason = params.get('reason');

        if (encodedReason) {
          const decodedReason = decodeURIComponent(encodedReason);

          // Map specific reasons to user-friendly messages
          if (decodedReason === 'token_expired') {
            reason = 'Your session expired. Please try again from the app.';
          } else if (decodedReason === 'already_subscribed') {
            reason = 'You already have an active PRO subscription!';
          } else {
            reason = decodedReason;
          }
        }
      }

      Alert.alert(
        'Payment Not Completed',
        reason,
        [
          {
            text: 'Try Again',
            onPress: () => router.replace('/(tabs)/profile'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    };

    // Handle initial URL (app opened from deep link when not running)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('[Deep Link] Initial URL:', url);
        handleDeepLink(url);
      }
    });

    // Handle URL events (app already running, receives deep link)
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('[Deep Link] URL event:', event.url);
      handleDeepLink(event.url);
    });

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
  }, [servicesInitialized, checkAuth, router]);

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
        <Stack.Screen name="auth" />
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

export default Sentry.wrap(function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutContent />
    </ErrorBoundary>
  );
});

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