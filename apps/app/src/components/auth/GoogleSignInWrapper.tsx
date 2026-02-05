import React from 'react';

interface GoogleSignInWrapperProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Wrapper component that conditionally renders Google Sign-In button
 * Only renders when running in a native build (not Expo Go)
 */
export function GoogleSignInWrapper(props: GoogleSignInWrapperProps) {
  // Try to dynamically import Google Sign-In button
  // This will fail gracefully in Expo Go
  try {
    const { GoogleSignInButton } = require('./GoogleSignInButton');
    return <GoogleSignInButton {...props} />;
  } catch (error) {
    // Google Sign-In not available (Expo Go)
    // Return null to hide the button
    console.log('[Google Auth] Not available in current environment');
    return null;
  }
}
