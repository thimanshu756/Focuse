'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
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
            Create Your Account
          </motion.h1>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SignUpForm />
          </motion.div>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-accent hover:text-accent-soft transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
