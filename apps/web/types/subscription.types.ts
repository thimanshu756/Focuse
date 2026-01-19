// Subscription types for frontend

export type SubscriptionTier = 'FREE' | 'PRO';
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'HALTED'
  | 'PAUSED';
export type PlanType = 'MONTHLY' | 'YEARLY';

// Plan details from API
export interface Plan {
  planId: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  billingPeriod: PlanType;
  amount: number; // in paise
  currency: string;
  features: string[];
  aiRequestsLimit: number | null;
  maxDevices: number;
  exportEnabled: boolean;
  prioritySupport: boolean;
  isActive: boolean;
  isPopular: boolean;
  savingsPercentage: number | null;
  displayOrder: number;
}

// Plans list response
export interface PlansListResponse {
  plans: Plan[];
  currentPlan: {
    planId: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
  } | null;
}

// Create subscription response
export interface CreateSubscriptionResponse {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  checkout: {
    key: string;
    subscription_id: string; // Razorpay subscription ID (snake_case from backend)
    name: string;
    description: string;
    amount: number; // Amount in paise
    currency: string; // Currency code (e.g., "INR")
    prefill: {
      email: string;
      name?: string;
      contact?: string;
    };
    theme: {
      color: string;
    };
    notes?: {
      userId: string;
      planId: string;
    };
  };
}

// Current subscription
export interface CurrentSubscription {
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    status: string;
    tier: SubscriptionTier;
    planId: string;
    planName: string;
    planType: PlanType;
    amount: number;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    nextBillingDate: string | null;
    cancelledAt: string | null;
    cancelAtPeriodEnd: boolean;
    autoRenewal: boolean;
    totalBillingCycles: number;
    daysRemaining: number;
    isExpired: boolean;
  } | null;
  user: {
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
  };
}

// Verify payment input
export interface VerifyPaymentInput {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature?: string; // Optional for subscription payments (Razorpay might not provide it)
}

// Cancel subscription input
export interface CancelSubscriptionInput {
  cancelAtPeriodEnd?: boolean;
  reason?: string;
}

// Razorpay options for checkout
export interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  amount?: number; // Amount in paise (optional but recommended for subscriptions)
  currency?: string; // Currency code (default: INR)
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name?: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

// Razorpay response
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string; // Might not be in response for subscriptions
  razorpay_signature?: string; // Optional for subscription payments
  // Alternative field names
  payment_id?: string;
  subscription_id?: string;
  signature?: string;
}

// Razorpay instance
export interface RazorpayInstance {
  open(): void;
  close(): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
