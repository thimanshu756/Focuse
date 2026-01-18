import { SubscriptionTier, SubscriptionPlanType } from '@prisma/client';

// Plan response type
export interface PlanResponse {
  id: string;
  planId: string;
  name: string;
  description: string | null;
  tier: SubscriptionTier;
  billingPeriod: SubscriptionPlanType;
  amount: number; // in paise
  currency: string;
  displayAmount: string; // formatted like "₹95"
  features: {
    features: string[];
  };
  aiRequestsLimit: number | null; // null = unlimited
  maxDevices: number;
  exportEnabled: boolean;
  prioritySupport: boolean;
  isPopular: boolean;
  savingsPercentage: number | null;
  savingsAmount?: number; // in paise, if applicable
  monthlyEquivalent?: number; // for yearly plans
}

// Plans list response
export interface PlansListResponse {
  plans: PlanResponse[];
  currentPlan: {
    planId: string | null;
    status: string | null;
    expiresAt: Date | null;
  } | null;
}

// Create subscription input
export interface CreateSubscriptionInput {
  planId: string; // "pro_monthly" or "pro_yearly"
}

// Razorpay checkout options
export interface RazorpayCheckoutOptions {
  key: string; // Razorpay key ID
  subscription_id: string; // Razorpay subscription ID
  name: string; // Company name
  description: string; // Plan description
  amount: number; // Amount in paise (required for correct display)
  currency: string; // Currency code (e.g., "INR")
  prefill: {
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  notes?: {
    userId: string;
    planId: string;
  };
}

// Create subscription response
export interface CreateSubscriptionResponse {
  subscriptionId: string; // Our DB subscription ID
  razorpaySubscriptionId: string; // Razorpay subscription ID
  planId: string;
  planName: string;
  amount: number; // in paise
  currency: string;
  status: string;
  checkout: RazorpayCheckoutOptions;
}

// Verify payment input
export interface VerifyPaymentInput {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature?: string; // Optional for subscription payments (Razorpay might not provide it)
}

// Verify payment response
export interface VerifyPaymentResponse {
  verified: true;
  subscription: {
    id: string;
    status: string;
    tier: string;
    planType: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    nextBillingDate: Date | null;
  };
}

// Current subscription response
export interface CurrentSubscriptionResponse {
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    status: string;
    tier: string;
    planId: string;
    planName: string;
    planType: string;
    amount: number; // in paise
    currency: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    nextBillingDate: Date | null;
    cancelledAt: Date | null;
    cancelAtPeriodEnd: boolean;
    autoRenewal: boolean;
    totalBillingCycles: number;
    daysRemaining: number;
    isExpired: boolean;
  } | null;
  user: {
    subscriptionTier: string;
    subscriptionStatus: string;
  };
}

// Cancel subscription input
export interface CancelSubscriptionInput {
  cancelAtPeriodEnd?: boolean; // Default: true (cancel at end of billing period)
  reason?: string; // Optional cancellation reason
}

// Cancel subscription response
export interface CancelSubscriptionResponse {
  cancelled: true;
  subscription: {
    id: string;
    status: string;
    cancelledAt: Date;
    cancelAtPeriodEnd: boolean;
    accessUntil: Date | null; // When user loses access (immediate or period end)
    refundAmount: number | null; // If immediate cancellation with refund
  };
  message: string;
}

// Resume subscription response
export interface ResumeSubscriptionResponse {
  resumed: true;
  subscription: {
    id: string;
    status: string;
    resumedAt: Date;
    currentPeriodEnd: Date;
    nextBillingDate: Date | null;
    autoRenewal: boolean;
  };
  message: string;
}
