'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createSubscription, verifyPayment } from '../../lib/subscription-api';
import {
  RazorpayOptions,
  RazorpayResponse,
} from '../../types/subscription.types';

interface RazorpayCheckoutProps {
  planId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useRazorpayCheckout() {
  const router = useRouter();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      toast.error('Failed to load payment gateway. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiateCheckout = async (
    planId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!isScriptLoaded) {
      toast.error('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    setIsSubscribing(true);

    try {
      // Step 1: Create subscription on backend
      const subscriptionData = await createSubscription(planId);

      console.log('Subscription data:', subscriptionData);
      // Store subscription ID for verification (in case Razorpay response doesn't include it)
      const razorpaySubscriptionId = subscriptionData.razorpaySubscriptionId;

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: subscriptionData.checkout.key,
        subscription_id: subscriptionData.checkout.subscription_id,
        name: subscriptionData.checkout.name,
        description: subscriptionData.checkout.description,
        amount: subscriptionData.checkout.amount, // Amount in paise (required for correct display)
        currency: subscriptionData.checkout.currency || 'INR', // Currency code
        prefill: subscriptionData.checkout.prefill,
        theme: {
          color: '#D7F50A',
        },
        handler: async (response: any) => {
          // Step 3: Verify payment on backend
          try {
            // Log the full response for debugging
            console.log('Razorpay payment response:', response);

            // Extract all required fields from Razorpay response
            // Handle different possible field names from Razorpay
            const razorpayPaymentId =
              response.razorpay_payment_id ||
              response.payment_id ||
              response.razorpayPaymentId;

            // Use subscription_id from response, or fallback to the one we stored
            const razorpaySubscriptionIdFromResponse =
              response.razorpay_subscription_id ||
              response.subscription_id ||
              response.razorpaySubscriptionId ||
              razorpaySubscriptionId;

            // For subscription payments, signature might not be in the response
            // Backend will verify by fetching payment details from Razorpay
            const razorpaySignature =
              response.razorpay_signature ||
              response.signature ||
              response.razorpaySignature ||
              null; // Make signature optional for subscription payments

            // Validate we have required fields
            if (!razorpayPaymentId) {
              console.error('Missing payment ID. Full response:', response);
              throw new Error('Payment ID is missing from Razorpay response');
            }
            if (!razorpaySubscriptionIdFromResponse) {
              console.error(
                'Missing subscription ID. Full response:',
                response
              );
              throw new Error(
                'Subscription ID is missing from Razorpay response'
              );
            }

            console.log('Verifying payment with:', {
              razorpayPaymentId,
              razorpaySubscriptionId: razorpaySubscriptionIdFromResponse,
              hasSignature: !!razorpaySignature,
            });

            // Verify payment (signature is optional for subscription payments)
            await verifyPayment({
              razorpayPaymentId,
              razorpaySubscriptionId: razorpaySubscriptionIdFromResponse,
              ...(razorpaySignature && { razorpaySignature }), // Only include if present
            });

            toast.success('🎉 Subscription activated successfully!');

            if (onSuccess) {
              onSuccess();
            } else {
              // Default: redirect to dashboard
              router.push('/dashboard');
              router.refresh();
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            const message =
              error?.response?.data?.error?.message ||
              error?.message ||
              'Payment verification failed. Please contact support.';
            toast.error(message);
            if (onError) onError(message);
          } finally {
            setIsSubscribing(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: '❌' });
            setIsSubscribing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Checkout initiation error:', error);
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to initiate checkout. Please try again.';
      toast.error(message);
      if (onError) onError(message);
      setIsSubscribing(false);
    }
  };

  return {
    initiateCheckout,
    isSubscribing,
    isScriptLoaded,
  };
}
