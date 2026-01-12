'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserProfile } from '@/hooks/useUserProfile';
import { Crown, Check } from 'lucide-react';

interface SubscriptionSectionProps {
  user: UserProfile | null;
}

export function SubscriptionSection({ user }: SubscriptionSectionProps) {
  const router = useRouter();
  const isPro = user?.subscriptionTier === 'PRO';

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">
        Subscription
      </h2>

      {/* Current Plan Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Current Plan
        </label>
        <div className="flex items-center gap-3">
          {isPro ? (
            <>
              <Crown size={32} className="text-yellow-500" />
              <span className="text-2xl font-bold text-text-primary">PRO</span>
            </>
          ) : (
            <>
              <span className="text-3xl">🌱</span>
              <span className="text-2xl font-bold text-text-primary">FREE</span>
            </>
          )}
        </div>
      </div>

      {isPro ? (
        /* PRO User View */
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-medium flex items-center justify-center gap-2">
              <Check size={18} />
              You're on the PRO plan
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push('/billing')}
            className="w-full"
          >
            Manage Billing
          </Button>
        </div>
      ) : (
        /* FREE User View */
        <div className="space-y-6">
          {/* Current Features */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              Current Features
            </h3>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <span>Unlimited focus sessions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <span>Basic task management</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <span>Forest visualization</span>
              </div>
            </div>
          </div>

          {/* PRO Features */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              PRO Features
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <span className="text-yellow-600">⭐</span>
                <span className="font-medium">AI task breakdown</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <span className="text-yellow-600">⭐</span>
                <span className="font-medium">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <span className="text-yellow-600">⭐</span>
                <span className="font-medium">Export reports</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <span className="text-yellow-600">⭐</span>
                <span className="font-medium">Priority support</span>
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/upgrade')}
            className="w-full flex items-center justify-center gap-2"
          >
            <Crown size={18} />
            Upgrade to Pro →
          </Button>
        </div>
      )}
    </Card>
  );
}
