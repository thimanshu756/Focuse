import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Configure Google Sign-In SDK.
 * Must be called once at app startup before any signIn() calls.
 * Throws if the required web client ID env variable is missing.
 */
export function configureGoogleSignIn() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!webClientId) {
    console.error(
      '[Google Auth] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set. Google Sign-In will not work.'
    );
    return;
  }

  GoogleSignin.configure({
    webClientId,
    // iOS needs its own client ID if not provided via GoogleService-Info.plist
    ...(Platform.OS === 'ios' && iosClientId ? { iosClientId } : {}),
    offlineAccess: true,
    scopes: ['profile', 'email'],
  });

  console.log('[Google Auth] Configured successfully');
}
