'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const emailValue = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);

    try {
      const response = await api.post('/auth/forgot-password', {
        email: data.email.toLowerCase().trim(),
      });

      if (response.data.success) {
        setIsEmailSent(true);
        setSubmittedEmail(data.email.toLowerCase().trim());
        toast.success(
          "If that email exists, you'll receive a password reset link",
          { duration: 5000 }
        );
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
        // Validation errors from server
        const serverErrors = error.response?.data?.error?.details;
        if (serverErrors) {
          Object.keys(serverErrors).forEach((key) => {
            setError(key as keyof ForgotPasswordFormData, {
              type: 'server',
              message: serverErrors[key],
            });
          });
        } else {
          setServerError(errorMessage);
          toast.error(errorMessage);
        }
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

  // Show success state after email is sent
  if (isEmailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Check your email
          </h3>
          <p className="text-sm text-green-700 mb-4">
            We've sent a password reset link to{' '}
            <span className="font-semibold">{submittedEmail}</span>
          </p>
          <p className="text-xs text-green-600">
            If you don't see the email, check your spam folder or try again.
          </p>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-text-secondary">
            Didn't receive the email?
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setIsEmailSent(false);
              setSubmittedEmail('');
              setServerError(null);
            }}
            className="w-full"
          >
            Resend Email
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Back to Sign In
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

      {/* Info Message */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-start gap-3">
        <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <span>
          Enter your email address and we'll send you a link to reset your
          password.
        </span>
      </div>

      {/* Email Field */}
      <Input
        {...register('email')}
        label="Email"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        autoComplete="email"
        aria-required="true"
        autoFocus
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
        disabled={isSubmitting || !emailValue}
      >
        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
