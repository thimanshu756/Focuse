import React, { useEffect, useState } from 'react';

interface GoogleSignInWrapperProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Wrapper component that conditionally renders Google Sign-In button.
 * Only renders when running in a native build (not Expo Go).
 * Uses state to avoid swallowing unrelated runtime errors.
 */
export function GoogleSignInWrapper(props: GoogleSignInWrapperProps) {
  const [GoogleSignInButton, setGoogleSignInButton] = useState<React.ComponentType<GoogleSignInWrapperProps> | null>(null);

  useEffect(() => {
    try {
      const mod = require('./GoogleSignInButton');
      if (mod?.GoogleSignInButton) {
        setGoogleSignInButton(() => mod.GoogleSignInButton);
      }
    } catch (error: any) {
      // Only silence module-not-found errors (Expo Go), re-log others
      if (error?.code === 'MODULE_NOT_FOUND' || error?.message?.includes('Cannot find module')) {
        console.log('[Google Auth] Native module not available (Expo Go)');
      } else {
        console.error('[Google Auth] Failed to load GoogleSignInButton:', error);
      }
    }
  }, []);

  if (!GoogleSignInButton) return null;

  return <GoogleSignInButton {...props} />;
}
