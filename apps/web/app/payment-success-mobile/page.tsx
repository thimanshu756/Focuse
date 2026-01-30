'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Smartphone, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Payment Success Mobile Fallback Page
 *
 * This page is shown to mobile users after successful payment if the
 * deep link fails to automatically open the app.
 *
 * Flow:
 * 1. Attempts to open app via deep link on mount
 * 2. Shows success message and manual instructions
 * 3. Provides "Open App" button as fallback
 */
export default function PaymentSuccessMobilePage() {
  const router = useRouter();

  useEffect(() => {
    // Attempt to open the app via deep link
    const attemptDeepLink = () => {
      try {
        window.location.href = 'forest://payment-success';
        console.log('[Mobile Fallback] Attempted deep link redirect');
      } catch (error) {
        console.error('[Mobile Fallback] Deep link failed:', error);
      }
    };

    // Try deep link after a short delay
    const timeout = setTimeout(attemptDeepLink, 500);

    return () => clearTimeout(timeout);
  }, []);

  const handleOpenApp = () => {
    try {
      window.location.href = 'forest://home';
    } catch (error) {
      console.error('[Mobile Fallback] Manual deep link failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] flex items-center justify-center p-5">
      <motion.div
        className="max-w-md w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
        </motion.div>

        {/* Success Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Payment Successful! 🎉
          </h1>
          <p className="text-lg text-[#64748B]">
            Your PRO subscription is now active
          </p>
        </div>

        {/* Instructions Card */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="flex-shrink-0 w-10 h-10 bg-[#D7F50A] rounded-full flex items-center justify-center">
              <Smartphone size={20} className="text-[#0F172A]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#0F172A] mb-1">
                Couldn't open the app automatically?
              </h2>
              <p className="text-sm text-[#64748B]">
                No worries! Follow these simple steps
              </p>
            </div>
          </div>

          <ol className="text-left space-y-4 text-[#64748B]">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#E9F0FF] text-[#3B82F6] rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <span>Open the Forest Focus app manually</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#E9F0FF] text-[#3B82F6] rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <span>Go to the Profile tab</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#E9F0FF] text-[#3B82F6] rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <span>Your PRO features are ready to use!</span>
            </li>
          </ol>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleOpenApp}
              className="w-full bg-[#D7F50A] text-[#0F172A] py-3.5 px-6 rounded-full font-semibold text-[15px] hover:bg-[#E9FF6A] transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#D7F50A] focus:ring-offset-2 flex items-center justify-center gap-2"
              aria-label="Open Forest Focus app"
            >
              Open App
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white text-[#64748B] py-3.5 px-6 rounded-full font-medium text-[14px] hover:text-[#0F172A] transition-colors border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#D7F50A] focus:ring-offset-2"
              aria-label="Go to web dashboard"
            >
              Continue on Web
            </button>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          className="text-sm text-[#94A3B8]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Your subscription is active across all devices. You can access your
          PRO features on web and mobile.
        </motion.p>
      </motion.div>
    </div>
  );
}
