'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Mail } from 'lucide-react';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { api } from '@/lib/api';
import { isAuthenticated, getAccessToken } from '@/lib/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user email if authenticated
  useEffect(() => {
    const fetchUserEmail = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        // Fetch current user to get email
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data?.user) {
          const userEmail = response.data.data.user.email;
          const isVerified = response.data.data.user.emailVerified;
          const onboardingCompleted =
            response.data.data.user.onboardingCompleted;

          // If already verified, check onboarding status
          if (isVerified) {
            if (onboardingCompleted) {
              router.push('/dashboard');
            } else {
              router.push('/onboarding');
            }
            return;
          }

          setEmail(userEmail);
        }
      } catch (error: any) {
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserEmail();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] flex items-center justify-center px-5 py-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return null; // Will redirect
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
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center"
          >
            <div className="p-4 bg-accent/20 rounded-full">
              <Mail className="h-12 w-12 text-accent" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[32px] font-semibold text-text-primary text-center"
          >
            Verify Your Email
          </motion.h1>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <VerifyEmailForm email={email} />
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
