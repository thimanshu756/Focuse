import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { authService } from '@/services/auth.service';

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
    try {
      setIsLoading(true);

      // Check if Google Play services are available (Android only)
      await GoogleSignin.hasPlayServices();

      // Trigger Google Sign-In
      const userInfo = await GoogleSignin.signIn();

      // Get the ID token
      const idToken = userInfo.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      console.log('[Google Auth] ID token received, authenticating with backend');

      // Send ID token to backend
      const result = await authService.googleAuth(idToken);

      console.log('[Google Auth] Authentication successful', {
        userId: result.user.id,
        isNewUser: result.isNewUser,
        isLinked: result.isLinked,
      });

      // Show success message
      let message = 'Successfully signed in with Google!';
      if (result.isNewUser) {
        message = 'Welcome to Forest! Account created successfully.';
      } else if (result.isLinked) {
        message = 'Google account linked successfully!';
      }

      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.();
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (error: any) {
      console.error('[Google Auth] Error:', error);

      let errorMessage = 'Failed to sign in with Google. Please try again.';

      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Google sign-in was cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Google sign-in is already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play services not available';
      } else if (error.response?.status === 401) {
        errorMessage = 'Google authentication failed. Please try again.';
      } else if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

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
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.text.primary} />
      ) : (
        <View style={styles.buttonContent}>
          {/* Google Icon SVG - You can replace with Image if you have the icon */}
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
