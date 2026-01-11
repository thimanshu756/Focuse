'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { api } from '@/lib/api';
import { setAuthTokens, isAuthenticated } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

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
          // If error fetching user, stay on login page
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuthAndRedirect();
  }, [router]);

  // Auto-focus email field on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Detect Caps Lock
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
    mode: 'onChange',
  });

  const emailRegister = register('email');
  const passwordRegister = register('password');

  const onSubmit = async (
    data: LoginFormData,
    e?: React.BaseSyntheticEvent
  ) => {
    // Prevent default form submission
    e?.preventDefault();

    setServerError(null);

    try {
      const response = await api.post('/auth/login', {
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      if (response.data.success && response.data.data) {
        const { tokens, user } = response.data.data;

        // Store tokens
        setAuthTokens(tokens.accessToken, tokens.refreshToken);

        // Check if email is verified
        if (!user.emailVerified) {
          // Redirect to email verification page
          router.push('/verify-email');
          return;
        }

        // Check if onboarding is completed
        if (!user.onboardingCompleted) {
          // Redirect to onboarding
          router.push('/onboarding');
          return;
        }

        // Redirect to dashboard if email is verified and onboarding completed
        router.push('/dashboard');
      }
    } catch (error: any) {
      // Prevent any default behavior
      e?.preventDefault();

      // Handle network errors
      if (!error.response) {
        setServerError(
          'Unable to connect. Please check your internet connection and try again.'
        );
        return;
      }

      // Handle API errors
      const status = error.response?.status;
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Something went wrong. Please try again.';

      if (status === 401) {
        // Don't reveal whether email or password is incorrect (security best practice)
        setServerError('Invalid email or password. Please try again.');
        // Clear password field using react-hook-form
        setValue('password', '');
        // Also clear the input ref if it exists
        if (passwordInputRef.current) {
          passwordInputRef.current.value = '';
        }
      } else if (status === 400) {
        // Validation errors from server
        const serverErrors = error.response?.data?.error?.details;
        if (serverErrors) {
          Object.keys(serverErrors).forEach((key) => {
            setError(key as keyof LoginFormData, {
              type: 'server',
              message: serverErrors[key],
            });
          });
        } else {
          setServerError(errorMessage);
        }
      } else {
        setServerError(errorMessage);
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      className="space-y-6"
      noValidate
    >
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

      {/* Email Field */}
      <Input
        {...emailRegister}
        ref={(e) => {
          emailRegister.ref(e);
          if (e) {
            emailInputRef.current = e;
          }
        }}
        label="Email"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        autoComplete="email"
        aria-required="true"
        onKeyDown={handleKeyDown}
      />

      {/* Password Field */}
      <div>
        <div className="relative">
          <Input
            {...passwordRegister}
            ref={(e) => {
              passwordRegister.ref(e);
              if (e) {
                passwordInputRef.current = e;
              }
            }}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            error={errors.password?.message}
            autoComplete="current-password"
            aria-required="true"
            className="pr-12"
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2  text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded p-1"
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
        {/* Caps Lock Warning */}
        {capsLockOn && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-amber-600 flex items-center gap-1.5"
            role="alert"
          >
            <AlertCircle className="h-4 w-4" />
            Caps Lock is on
          </motion.p>
        )}
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Checkbox
          {...register('rememberMe')}
          label="Remember me"
          className="flex-shrink-0"
        />
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-accent hover:text-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-1 py-0.5"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
