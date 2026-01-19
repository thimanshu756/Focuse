'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSubscriptionPlans } from '../../hooks/useSubscription';
import { useRazorpayCheckout } from '../../components/subscription/RazorpayCheckout';
import { PlanCard } from '../../components/subscription/PlanCard';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  subscriptionTier: 'FREE' | 'PRO';
  avatar?: string | null;
}

export default function PricingPage() {
  const router = useRouter();
  const { plans, currentPlan, isLoading, error } = useSubscriptionPlans();
  const { initiateCheckout, isSubscribing } = useRazorpayCheckout();
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile if authenticated
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      setUserProfile(null);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data) {
          // Handle both response formats
          const user = response.data.data.user || response.data.data;
          setUserProfile({
            id: user.id,
            name: user.name || '',
            subscriptionTier: user.subscriptionTier || 'FREE',
            avatar: user.avatar || null,
          });
        }
      } catch (error) {
        // Silently fail - user might not be authenticated or token expired
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [mounted]);

  const handleSubscribe = (planId: string) => {
    initiateCheckout(planId, () => {
      router.push('/dashboard');
      router.refresh();
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] flex items-center justify-center p-5">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8]">
      <Navigation
        userTier={userProfile?.subscriptionTier}
        userName={userProfile?.name}
        userAvatar={userProfile?.avatar}
        userId={userProfile?.id}
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-5 pt-24 pb-12 lg:pt-32 lg:py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6 shadow-sm">
            <Sparkles size={16} className="text-[#D7F50A]" />
            <span className="text-sm font-medium text-[#0F172A]">
              Simple, Transparent Pricing
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
            Upgrade to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#22C55E]">
              PRO
            </span>
          </h1>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            Unlock unlimited AI-powered focus sessions, advanced analytics, and
            premium features
          </p>
        </motion.div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[600px] bg-white rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
          >
            {plans
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((plan) => (
                <motion.div
                  key={plan.planId}
                  className="flex flex-col"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <PlanCard
                    plan={plan}
                    isCurrentPlan={currentPlan?.planId === plan.planId}
                    onSubscribe={handleSubscribe}
                    isSubscribing={isSubscribing}
                  />
                </motion.div>
              ))}
          </motion.div>
        )}

        {/* Feature Comparison */}
        <motion.div
          className="mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-8">
            Compare Features
          </h2>

          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <div className="grid grid-cols-3 gap-6">
              {/* Header */}
              <div className="text-sm font-semibold text-[#64748B]">
                Feature
              </div>
              <div className="text-center text-sm font-semibold text-[#64748B]">
                Free
              </div>
              <div className="text-center text-sm font-semibold text-[#0F172A] flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-[#D7F50A]" />
                PRO
              </div>

              {/* Feature rows */}
              {[
                { feature: 'Focus Timer', free: true, pro: true },
                {
                  feature: 'Weekly AI Reports',
                  free: '1 report',
                  pro: 'Unlimited',
                },
                {
                  feature: 'Daily Sessions',
                  free: '3 sessions',
                  pro: 'Unlimited',
                },
                { feature: 'Session Notes', free: '3 notes', pro: 'Unlimited' },
                {
                  feature: 'Focus Ambient Sounds',
                  free: '1 sound',
                  pro: '5+ sounds',
                },
                { feature: 'AI Task Breakdown', free: false, pro: true },
                {
                  feature: 'Advanced Analytics & Insights',
                  free: false,
                  pro: true,
                },
                { feature: 'Weekly AI Insights', free: false, pro: true },
                { feature: 'Export Data (CSV/PDF)', free: false, pro: true },
                { feature: 'Priority Support', free: false, pro: true },
              ].map((row, index) => (
                <div key={index} className="contents">
                  <div className="py-4 border-t border-[#E2E8F0]">
                    <span className="text-[#0F172A]">{row.feature}</span>
                  </div>
                  <div className="py-4 border-t border-[#E2E8F0] flex justify-center">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <X size={20} className="text-[#CBD5E1]" />
                      )
                    ) : (
                      <span className="text-sm text-[#64748B]">{row.free}</span>
                    )}
                  </div>
                  <div className="py-4 border-t border-[#E2E8F0] flex justify-center">
                    {typeof row.pro === 'boolean' ? (
                      row.pro ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <X size={20} className="text-[#CBD5E1]" />
                      )
                    ) : (
                      <span className="text-sm font-medium text-[#0F172A]">
                        {row.pro}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: "Yes! You can cancel your subscription anytime. You'll retain PRO access until the end of your billing period.",
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, UPI, net banking, and wallets through our secure payment partner Razorpay.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Currently, we offer a FREE plan with limited features. You can upgrade to PRO anytime to unlock all features.',
              },
              {
                q: 'Can I switch between plans?',
                a: 'Yes! You can upgrade from monthly to yearly anytime. The remaining balance will be adjusted automatically.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#0F172A] mb-2">{faq.q}</h3>
                <p className="text-[#64748B] text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        {/* <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-[#64748B] mb-4">Have more questions?</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#0F172A] font-medium hover:underline"
          >
            Contact Support →
          </button>
        </motion.div> */}
      </div>

      <Footer />
    </div>
  );
}
