'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface VerifyEmailFormProps {
  email: string;
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCount, setResendCount] = useState(0);

  // Check for token in URL (when user clicks email link)
  const token = searchParams.get('token');

  // Resend cooldown timer (3 requests/hour = 1 request per 20 minutes)
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check if user is authenticated, if not redirect to login
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleVerifyEmail = useCallback(
    async (verificationToken: string) => {
      setIsVerifying(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const response = await api.post('/auth/verify-email', {
          token: verificationToken,
        });

        if (response.data.success) {
          setSuccessMessage('Email verified successfully! Redirecting...');
          // Fetch user to check onboarding status
          try {
            const userResponse = await api.get('/auth/me');
            if (userResponse.data.success && userResponse.data.data?.user) {
              const onboardingCompleted =
                userResponse.data.data.user.onboardingCompleted;
              // Redirect based on onboarding status
              setTimeout(() => {
                if (onboardingCompleted) {
                  router.push('/dashboard');
                } else {
                  router.push('/onboarding');
                }
              }, 2000);
            } else {
              // Fallback to onboarding if can't fetch user
              setTimeout(() => {
                router.push('/onboarding');
              }, 2000);
            }
          } catch (error) {
            // Fallback to onboarding if error fetching user
            setTimeout(() => {
              router.push('/onboarding');
            }, 2000);
          }
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Failed to verify email. Please try again.';

        if (error.response?.status === 400) {
          if (errorMsg.includes('expired')) {
            setErrorMessage(
              'Verification link has expired. Please request a new one.'
            );
          } else {
            setErrorMessage(errorMsg);
          }
        } else {
          setErrorMessage('Unable to verify email. Please try again.');
        }
      } finally {
        setIsVerifying(false);
      }
    },
    [router]
  );

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && !isVerifying && !successMessage) {
      handleVerifyEmail(token);
    }
  }, [token, isVerifying, successMessage, handleVerifyEmail]);

  const handleResend = async () => {
    // Check cooldown (3 requests/hour = 20 minutes between requests)
    if (resendCooldown > 0) {
      const minutes = Math.floor(resendCooldown / 60);
      const seconds = resendCooldown % 60;
      setErrorMessage(
        `Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before requesting another email.`
      );
      return;
    }

    // Check resend limit (3 per hour)
    if (resendCount >= 3) {
      setErrorMessage(
        'You have reached the maximum number of resend requests. Please wait an hour before trying again.'
      );
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await api.post('/auth/resend-verification', {
        email: email,
      });

      if (response.data.success) {
        setSuccessMessage('Verification email sent! Please check your inbox.');
        setResendCount(resendCount + 1);
        // Set cooldown to 20 minutes (1200 seconds)
        setResendCooldown(1200);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to send verification email. Please try again.';

      if (error.response?.status === 429) {
        setErrorMessage('Too many requests. Please wait before trying again.');
        setResendCooldown(1200); // 20 minutes
      } else {
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsResending(false);
    }
  };

  // Reset resend count after 1 hour
  useEffect(() => {
    if (resendCount > 0) {
      const timer = setTimeout(() => {
        setResendCount(0);
      }, 3600000); // 1 hour
      return () => clearTimeout(timer);
    }
  }, [resendCount]);

  const formatCooldown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-3"
          role="alert"
          aria-live="polite"
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-3"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Email Display */}
      <div className="text-center space-y-2">
        <p className="text-sm text-text-secondary">
          We sent a verification link to:
        </p>
        <p className="text-base font-medium text-text-primary">{email}</p>
      </div>

      {/* Resend Button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={handleResend}
        isLoading={isResending}
        disabled={isResending || isVerifying || resendCooldown > 0}
        className="w-full"
      >
        {isResending
          ? 'Sending...'
          : resendCooldown > 0
            ? `Resend in ${formatCooldown(resendCooldown)}`
            : 'Resend Verification Email'}
      </Button>

      {/* Verification Status */}
      {isVerifying && (
        <div className="text-center">
          <p className="text-sm text-text-secondary">Verifying your email...</p>
        </div>
      )}

      {/* Info Message */}
      <div className="text-center">
        <p className="text-xs text-text-muted">
          Didn't receive the email? Check your spam folder or wait a few
          minutes.
        </p>
        {resendCount > 0 && resendCount < 3 && (
          <p className="text-xs text-amber-600 mt-1">
            {3 - resendCount} resend{3 - resendCount > 1 ? 's' : ''} remaining
            this hour
          </p>
        )}
      </div>
    </div>
  );
}
