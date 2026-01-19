'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { setAuthTokens } from '@/lib/auth';

export interface GoogleAuthResult {
  success: boolean;
  isNewUser?: boolean;
  isLinked?: boolean;
  error?: string;
}

export interface UseGoogleAuthReturn {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  handleGoogleAuth: (
    credentialResponse: CredentialResponse
  ) => Promise<GoogleAuthResult>;
  clearError: () => void;
  clearSuccess: () => void;
}

/**
 * Custom hook for Google OAuth authentication
 * Handles the complete flow: token verification, account creation/linking, and navigation
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleAuth = async (
    credentialResponse: CredentialResponse
  ): Promise<GoogleAuthResult> => {
    if (!credentialResponse.credential) {
      const errorMsg = 'No credential received from Google';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Get user's timezone
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      // Send Google ID token to backend
      const response = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
        timezone,
      });

      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        const { isNewUser, isLinked } = response.data.meta || {};

        // Store tokens
        setAuthTokens(tokens.accessToken, tokens.refreshToken);

        // Set appropriate success message
        let message = 'Successfully signed in!';
        if (isNewUser) {
          message = '🎉 Welcome to Forest! Account created successfully.';
        } else if (isLinked) {
          message = '🔗 Google account linked successfully!';
        }

        setSuccessMessage(message);
        toast.success(message);

        // Navigate to appropriate page after short delay for UX
        setTimeout(() => {
          if (!user.emailVerified) {
            router.push('/verify-email');
          } else if (!user.onboardingCompleted) {
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
        }, 1000);

        return {
          success: true,
          isNewUser,
          isLinked,
        };
      }

      // Unexpected response format
      throw new Error('Unexpected response from server');
    } catch (err: any) {
      // Handle errors with user-friendly messages
      let errorMessage = 'Failed to sign in with Google. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Google authentication failed. Please try again.';
      } else if (err.response?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setError(errorMessage);
      toast.error(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccessMessage(null);

  return {
    isLoading,
    error,
    successMessage,
    handleGoogleAuth,
    clearError,
    clearSuccess,
  };
}
