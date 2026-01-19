'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import toast from 'react-hot-toast';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check if already authenticated and redirect
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isAuthenticated()) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success && response.data.data?.user) {
            const user = response.data.data.user;

            // Check email verification first
            if (!user.emailVerified) {
              router.push('/verify-email');
              return;
            }

            // Check onboarding status
            if (!user.onboardingCompleted) {
              router.push('/onboarding');
              return;
            }

            // User is verified and onboarded, go to dashboard
            router.push('/dashboard');
            return;
          }
        } catch (error) {
          // If error fetching user, stay on page
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuthAndRedirect();
  }, [router]);

  // Get token from URL
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setServerError(
        'Invalid or missing reset token. Please request a new password reset link.'
      );
      toast.error('Invalid or missing reset token');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError(
        'Invalid or missing reset token. Please request a new password reset link.'
      );
      toast.error('Invalid or missing reset token');
      return;
    }

    setServerError(null);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });

      if (response.data.success) {
        setIsPasswordReset(true);
        toast.success('Password reset successfully! Redirecting to login...', {
          duration: 3000,
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      // Handle network errors
      if (!error.response) {
        const errorMsg =
          'Unable to connect. Please check your internet connection and try again.';
        setServerError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Handle rate limiting (429)
      if (error.response?.status === 429) {
        const errorMsg =
          'Too many requests. Please wait a few minutes before trying again.';
        setServerError(errorMsg);
        toast.error(errorMsg, { duration: 6000 });
        return;
      }

      // Handle API errors
      const status = error.response?.status;
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Something went wrong. Please try again.';

      if (status === 400) {
        // Check for specific error codes
        const errorCode = error.response?.data?.error?.code;

        if (errorCode === 'TOKEN_EXPIRED') {
          const errorMsg =
            'This reset link has expired. Please request a new password reset link.';
          setServerError(errorMsg);
          toast.error(errorMsg, { duration: 6000 });
          // Redirect to forgot password page after showing error
          setTimeout(() => {
            router.push('/forgot-password');
          }, 3000);
          return;
        }

        if (errorCode === 'INVALID_TOKEN') {
          const errorMsg =
            'Invalid reset token. Please request a new password reset link.';
          setServerError(errorMsg);
          toast.error(errorMsg, { duration: 6000 });
          // Redirect to forgot password page after showing error
          setTimeout(() => {
            router.push('/forgot-password');
          }, 3000);
          return;
        }

        // Validation errors from server
        const serverErrors = error.response?.data?.error?.details;
        if (serverErrors) {
          Object.keys(serverErrors).forEach((key) => {
            if (key === 'newPassword') {
              setError('password', {
                type: 'server',
                message: serverErrors[key],
              });
            } else {
              setError(key as keyof ResetPasswordFormData, {
                type: 'server',
                message: serverErrors[key],
              });
            }
          });
        } else {
          setServerError(errorMessage);
          toast.error(errorMessage);
        }
      } else if (status === 404) {
        const errorMsg =
          'User not found. Please request a new password reset link.';
        setServerError(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => {
          router.push('/forgot-password');
        }, 3000);
      } else if (status >= 500) {
        // Server errors
        const errorMsg = 'Server error. Please try again later.';
        setServerError(errorMsg);
        toast.error(errorMsg);
      } else {
        setServerError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-text-secondary">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show success state after password is reset
  if (isPasswordReset) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Password Reset Successful!
          </h3>
          <p className="text-sm text-green-700">
            Your password has been reset successfully. Redirecting to login...
          </p>
        </div>
      </motion.div>
    );
  }

  // Show error if token is missing
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Invalid Reset Link
          </h3>
          <p className="text-sm text-red-700 mb-4">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/forgot-password')}
            className="w-full"
          >
            Request New Reset Link
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Server Error Display */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-3"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </motion.div>
      )}

      {/* Password Field */}
      <div>
        <div className="relative">
          <Input
            {...register('password')}
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            error={errors.password?.message}
            autoComplete="new-password"
            aria-required="true"
            className="pr-12"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {passwordValue && (
          <PasswordStrengthIndicator password={passwordValue} />
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <div className="relative">
          <Input
            {...register('confirmPassword')}
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            aria-required="true"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded p-1"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
        disabled={
          isSubmitting ||
          !passwordValue ||
          !confirmPasswordValue ||
          passwordValue !== confirmPasswordValue
        }
      >
        {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
      </Button>

      {/* Back to Login */}
      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.push('/login')}
          className="w-full"
          disabled={isSubmitting}
        >
          ← Back to Sign In
        </Button>
      </div>
    </form>
  );
}
