'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { api } from '@/lib/api';
import { setAuthTokens } from '@/lib/auth';

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain a special character'
      ),
    timezone: z.string(),
  })
  .refine(
    (data) => {
      // Additional password validation
      return (
        data.password.length >= 8 &&
        /[A-Z]/.test(data.password) &&
        /[a-z]/.test(data.password) &&
        /[0-9]/.test(data.password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(data.password)
      );
    },
    {
      message: 'Password does not meet all requirements',
      path: ['password'],
    }
  );

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [timezone, setTimezone] = useState<string>('UTC');
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto-detect timezone
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detectedTimezone);
    } catch (error) {
      // Fallback to UTC if detection fails
      setTimezone('UTC');
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      timezone: 'UTC',
    },
    mode: 'onChange',
  });

  const password = watch('password', '');

  // Update timezone in form when detected
  useEffect(() => {
    if (timezone) {
      setValue('timezone', timezone);
    }
  }, [timezone, setValue]);

  const onSubmit = async (data: SignUpFormData) => {
    setServerError(null);

    try {
      const response = await api.post('/auth/register', {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        timezone: timezone,
      });

      if (response.data.success && response.data.data) {
        const { tokens } = response.data.data;

        // Store tokens
        setAuthTokens(tokens.accessToken, tokens.refreshToken);

        // Redirect to email verification or dashboard
        // For now, redirect to a verification page (you can create this later)
        router.push('/verify-email');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Something went wrong. Please try again.';

      // Handle specific error types
      if (error.response?.status === 409) {
        setError('email', {
          type: 'server',
          message: 'This email is already registered',
        });
      } else if (error.response?.status === 400) {
        // Validation errors from server
        const serverErrors = error.response?.data?.error?.details;
        if (serverErrors) {
          Object.keys(serverErrors).forEach((key) => {
            setError(key as keyof SignUpFormData, {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server Error Display */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          role="alert"
        >
          {serverError}
        </motion.div>
      )}

      {/* Name Field */}
      <Input
        {...register('name')}
        label="Name"
        type="text"
        placeholder="Enter your full name"
        error={errors.name?.message}
        autoComplete="name"
        aria-required="true"
      />

      {/* Email Field */}
      <Input
        {...register('email')}
        label="Email"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        autoComplete="email"
        aria-required="true"
      />

      {/* Password Field */}
      <div>
        <div className="relative">
          <Input
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            error={errors.password?.message}
            autoComplete="new-password"
            aria-required="true"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2  text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {password && <PasswordStrengthIndicator password={password} />}
      </div>

      {/* Timezone Field (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Timezone
        </label>
        <input
          {...register('timezone')}
          type="text"
          value={timezone}
          readOnly
          className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-text-primary cursor-not-allowed focus:outline-none"
          aria-label="Timezone (automatically detected)"
        />
        <p className="mt-1.5 text-sm text-text-muted">
          Automatically detected from your browser
        </p>
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
        Create Account
      </Button>
    </form>
  );
}
