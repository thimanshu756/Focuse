import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
  Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { authService } from '@/services/auth.service';
import { crashlyticsService } from '@/services/crashlytics.service';

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function GoogleSignInButton({
  mode = 'signin',
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Check network connectivity before attempting sign-in
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.'
        );
        return;
      }

      // Check Google Play Services availability (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign out any previous session to ensure fresh account picker
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore — no previous session to clear
      }

      // Trigger Google Sign-In
      const response = await GoogleSignin.signIn();

      if (response.type === 'cancelled') {
        // User cancelled — not an error, just return silently
        return;
      }

      const userInfo = response.data;
      const idToken = userInfo?.idToken;

      if (!idToken) {
        throw new Error('NO_ID_TOKEN');
      }

      console.log('[Google Auth] ID token received, authenticating with backend');

      // Authenticate with backend
      const result = await authService.googleAuth(idToken);

      console.log('[Google Auth] Authentication successful', {
        userId: result.user.id,
        isNewUser: result.isNewUser,
        isLinked: result.isLinked,
      });

      onSuccess?.();
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[Google Auth] Error:', error);

      // Don't show alert for user-initiated cancellation
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      // Report to Sentry with context
      crashlyticsService.logError(error instanceof Error ? error : new Error(String(error.message || error)), {
        component: 'GoogleSignInButton',
        mode,
        errorCode: error.code,
        httpStatus: error.response?.status,
      });

      const errorMessage = getErrorMessage(error);
      Alert.alert('Sign In Failed', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={handleGoogleSignIn}
      disabled={isLoading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.text.primary} />
      ) : (
        <View style={styles.buttonContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.buttonText}>
            {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/**
 * Maps error codes/responses to user-friendly messages.
 * Never exposes raw internal error strings.
 */
function getErrorMessage(error: any): string {
  // Google Sign-In SDK errors
  if (error.code === statusCodes.IN_PROGRESS) {
    return 'Sign-in is already in progress. Please wait.';
  }
  if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services is not available. Please update it and try again.';
  }

  // Backend API errors
  if (error.response?.status === 401) {
    return 'Google authentication failed. Please try again.';
  }
  if (error.response?.status === 409) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // Internal errors — map to user-friendly messages
  if (error.message === 'NO_ID_TOKEN') {
    return 'Unable to verify your Google account. Please try again.';
  }
  if (error.message?.includes('network') || error.message?.includes('Network')) {
    return 'Network error. Please check your connection and try again.';
  }

  return 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
