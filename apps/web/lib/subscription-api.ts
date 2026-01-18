import { api } from './api';
import {
  PlansListResponse,
  CreateSubscriptionResponse,
  CurrentSubscription,
  VerifyPaymentInput,
  CancelSubscriptionInput,
} from '../types/subscription.types';

/**
 * Subscription API functions
 */

// Get available subscription plans
export async function getSubscriptionPlans(): Promise<PlansListResponse> {
  const { data } = await api.get('/v1/subscription/plans');
  return data.data;
}

// Create a new subscription
export async function createSubscription(
  planId: string
): Promise<CreateSubscriptionResponse> {
  const { data } = await api.post('/v1/subscription/create', { planId });
  return data.data;
}

// Verify payment after Razorpay checkout
export async function verifyPayment(
  payload: VerifyPaymentInput
): Promise<void> {
  await api.post('/v1/subscription/verify', payload);
}

// Get current subscription
export async function getCurrentSubscription(
  sync = false
): Promise<CurrentSubscription> {
  const { data } = await api.get('/v1/subscription/current', {
    params: { sync },
  });
  return data.data;
}

// Cancel subscription
export async function cancelSubscription(
  payload: CancelSubscriptionInput = {}
): Promise<{ message: string }> {
  const { data } = await api.post('/v1/subscription/cancel', payload);
  return { message: data.message };
}

// Resume cancelled subscription
export async function resumeSubscription(): Promise<{ message: string }> {
  const { data } = await api.post('/v1/subscription/resume');
  return { message: data.message };
}
