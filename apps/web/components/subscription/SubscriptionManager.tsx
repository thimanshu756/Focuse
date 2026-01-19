'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSubscription } from '../../hooks/useSubscription';
import {
  cancelSubscription,
  resumeSubscription,
} from '../../lib/subscription-api';
import { formatDistance } from 'date-fns';

export function SubscriptionManager() {
  const router = useRouter();
  const { subscription, isLoading, refetch, isPro, isActive } =
    useSubscription();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = async (immediate = false) => {
    setIsCancelling(true);
    try {
      const result = await cancelSubscription({
        cancelAtPeriodEnd: !immediate,
        reason: cancelReason || undefined,
      });
      toast.success(result.message);
      setShowCancelModal(false);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message || 'Failed to cancel subscription'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResume = async () => {
    setIsResuming(true);
    try {
      const result = await resumeSubscription();
      toast.success(result.message);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message || 'Failed to resume subscription'
      );
    } finally {
      setIsResuming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <motion.div
        className="bg-gradient-to-br from-[#D7F50A]/10 to-[#E9FF6A]/5 rounded-3xl p-8 border border-[#D7F50A]/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-[#D7F50A] rounded-2xl">
            <Crown size={24} className="text-[#0F172A]" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
              Upgrade to PRO
            </h3>
            <p className="text-[#64748B]">
              Unlock unlimited AI requests, advanced analytics, and premium
              features
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/pricing')}
          className="w-full bg-[#D7F50A] text-[#0F172A] py-3.5 rounded-full font-semibold 
            hover:bg-[#E9FF6A] transition-all duration-200 hover:scale-[1.02]
            focus:outline-none focus:ring-2 focus:ring-[#D7F50A] focus:ring-offset-2
            flex items-center justify-center gap-2"
        >
          View Plans
          <ArrowRight size={18} />
        </button>
      </motion.div>
    );
  }

  const sub = subscription?.subscription;
  if (!sub) return null;

  const isCancelled = sub.status === 'CANCELLED';
  const canResume = isCancelled && sub.cancelAtPeriodEnd && !sub.isExpired;

  return (
    <>
      <motion.div
        className="bg-white rounded-3xl p-8 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D7F50A] rounded-2xl">
              <Crown size={24} className="text-[#0F172A]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-1">
                {sub.planName}
              </h3>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <div className="flex items-center gap-1.5 text-green-600 text-sm">
                    <CheckCircle size={16} />
                    <span className="font-medium">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-orange-600 text-sm">
                    <AlertCircle size={16} />
                    <span className="font-medium">Cancelled</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-[#0F172A]">
              ₹{(sub.amount / 100).toLocaleString()}
            </div>
            <div className="text-sm text-[#64748B]">
              /{sub.planType === 'MONTHLY' ? 'month' : 'year'}
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="space-y-4 mb-6">
          {/* Current Period */}
          <div className="flex items-center gap-3 p-4 bg-[#F6F9FF] rounded-2xl">
            <Calendar size={20} className="text-[#64748B]" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[#0F172A]">
                Current Period
              </div>
              <div className="text-sm text-[#64748B]">
                {new Date(sub.currentPeriodStart).toLocaleDateString()} -{' '}
                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </div>
            </div>
            <div className="text-sm font-medium text-[#0F172A]">
              {sub.daysRemaining} days left
            </div>
          </div>

          {/* Next Billing */}
          {sub.nextBillingDate && !isCancelled && (
            <div className="flex items-center gap-3 p-4 bg-[#F6F9FF] rounded-2xl">
              <CreditCard size={20} className="text-[#64748B]" />
              <div className="flex-1">
                <div className="text-sm font-medium text-[#0F172A]">
                  Next Billing Date
                </div>
                <div className="text-sm text-[#64748B]">
                  {new Date(sub.nextBillingDate).toLocaleDateString()} (
                  {formatDistance(new Date(sub.nextBillingDate), new Date(), {
                    addSuffix: true,
                  })}
                  )
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Notice */}
          {isCancelled && sub.cancelAtPeriodEnd && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
              <AlertCircle size={20} className="text-orange-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-orange-900 mb-1">
                  Subscription Cancelled
                </div>
                <div className="text-sm text-orange-700">
                  Your PRO access will end on{' '}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}. You can
                  resume your subscription anytime before then.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {canResume ? (
            <button
              onClick={handleResume}
              disabled={isResuming}
              className="flex-1 bg-[#D7F50A] text-[#0F172A] py-3 rounded-full font-semibold 
                hover:bg-[#E9FF6A] transition-all duration-200 hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                focus:outline-none focus:ring-2 focus:ring-[#D7F50A] focus:ring-offset-2"
            >
              {isResuming ? 'Resuming...' : 'Resume Subscription'}
            </button>
          ) : (
            !isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex-1 bg-red-50 text-red-600 py-3 rounded-full font-semibold 
                  hover:bg-red-100 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel Subscription
              </button>
            )
          )}

          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 bg-[#0F172A] text-white rounded-full font-semibold 
              hover:bg-[#1E293B] transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2"
          >
            View Plans
          </button>
        </div>
      </motion.div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <XCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A]">
                Cancel Subscription
              </h3>
            </div>

            <p className="text-[#64748B] mb-6">
              We're sorry to see you go! Please let us know why you're
              cancelling (optional).
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Help us improve..."
              className="w-full p-4 border border-[#E2E8F0] rounded-2xl resize-none mb-6
                focus:outline-none focus:ring-2 focus:ring-[#D7F50A] focus:border-transparent"
              rows={3}
            />

            <div className="space-y-3">
              <button
                onClick={() => handleCancel(false)}
                disabled={isCancelling}
                className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold 
                  hover:bg-orange-600 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {isCancelling
                  ? 'Cancelling...'
                  : 'Cancel at Period End (Keep Access)'}
              </button>

              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full bg-[#F1F5F9] text-[#64748B] py-3 rounded-full font-semibold 
                  hover:bg-[#E2E8F0] transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Never Mind
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
