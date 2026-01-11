'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';
import { isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] flex items-center justify-center px-5 py-8">
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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] flex items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="space-y-6">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[32px] font-semibold text-text-primary text-center"
          >
            Welcome Back
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-sm text-text-muted text-center"
          >
            Sign in to continue your focus journey
          </motion.p>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LoginForm />
          </motion.div>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-accent hover:text-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-1 py-0.5"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
