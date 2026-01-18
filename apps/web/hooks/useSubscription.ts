import { useState, useEffect } from 'react';
import {
  getCurrentSubscription,
  getSubscriptionPlans,
} from '../lib/subscription-api';
import {
  CurrentSubscription,
  PlansListResponse,
} from '../types/subscription.types';

/**
 * Hook to fetch and manage current subscription
 */
export function useSubscription(sync = false) {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCurrentSubscription(sync);
      setSubscription(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || 'Failed to load subscription'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [sync]);

  return {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription,
    isPro: subscription?.user.subscriptionTier === 'PRO',
    isActive: subscription?.hasActiveSubscription || false,
  };
}

/**
 * Hook to fetch subscription plans
 */
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<PlansListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans: plans?.plans || [],
    currentPlan: plans?.currentPlan,
    isLoading,
    error,
    refetch: fetchPlans,
  };
}
