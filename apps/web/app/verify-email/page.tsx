'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] flex items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center space-y-6">
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

          <div className="space-y-3">
            <h1 className="text-[32px] font-semibold text-text-primary">
              Check Your Email
            </h1>
            <p className="text-base text-text-secondary">
              We've sent a verification link to your email address. Please click
              the link to verify your account.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-text-muted">
              Didn't receive the email? Check your spam folder or{' '}
              <button className="font-semibold text-accent hover:text-accent-soft transition-colors">
                resend
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
