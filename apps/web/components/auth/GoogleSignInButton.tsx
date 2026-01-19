'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

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
  const { isLoading, error, successMessage, handleGoogleAuth, clearError } =
    useGoogleAuth();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const result = await handleGoogleAuth(credentialResponse);

    if (result.success) {
      onSuccess?.();
    } else if (result.error) {
      onError?.(result.error);
    }
  };

  const handleError = () => {
    const errorMsg = 'Google sign-in was cancelled or failed';
    toast.error(errorMsg);
    onError?.(errorMsg);
  };

  return (
    <div className="space-y-3">
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700"
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl"
        >
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm font-medium text-text-secondary">
            Signing in with Google...
          </span>
        </motion.div>
      )}

      {/* Google Login Button */}
      {!isLoading && !successMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text={mode === 'signup' ? 'signup_with' : 'signin_with'}
            shape="rectangular"
            logo_alignment="left"
            width="100%"
          />
        </motion.div>
      )}
    </div>
  );
}
