import { GoogleSignin } from '@react-native-google-signin/google-signin';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    // Your WEB OAuth Client ID (the one from Next.js Google Auth)
    // Get this from: https://console.cloud.google.com/apis/credentials
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',

    // Request offline access (to get refresh token)
    offlineAccess: true,

    // Request user's basic profile info
    scopes: ['profile', 'email'],
  });
}
