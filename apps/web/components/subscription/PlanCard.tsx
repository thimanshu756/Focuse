'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Plan } from '../../types/subscription.types';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSubscribe: (planId: string) => void;
  isSubscribing: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan,
  onSubscribe,
  isSubscribing,
}: PlanCardProps) {
  const price = plan.amount / 100; // Convert from paise to rupees
  const monthlyPrice = plan.billingPeriod === 'YEARLY' ? price / 12 : price;

  return (
    <motion.div
      className={`relative bg-white rounded-3xl p-8 shadow-[0_8px_24px_rgba(15,23,42,0.08)] 
        ${plan.isPopular ? 'ring-2 ring-[#D7F50A]' : ''}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 bg-[#D7F50A] text-[#0F172A] px-4 py-2 rounded-full text-sm font-semibold">
            <Sparkles size={16} />
            Most Popular
          </div>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </div>
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-2xl font-semibold text-[#0F172A] mb-2">
        {plan.name}
      </h3>

      {/* Description */}
      <p className="text-[#64748B] text-sm mb-6">{plan.description}</p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-[#0F172A]">
            ₹{price.toLocaleString()}
          </span>
          <span className="text-[#64748B] text-sm">
            /{plan.billingPeriod === 'MONTHLY' ? 'month' : 'year'}
          </span>
        </div>
        {plan.billingPeriod === 'YEARLY' && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[#64748B] text-sm">
              ₹{monthlyPrice.toFixed(0)}/month
            </span>
            {plan.savingsPercentage && (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                Save {plan.savingsPercentage.toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSubscribe(plan.planId)}
        disabled={isCurrentPlan || isSubscribing}
        className={`w-full py-3.5 rounded-full font-semibold text-[15px] transition-all duration-200
          ${
            plan.isPopular
              ? 'bg-[#D7F50A] text-[#0F172A] hover:bg-[#E9FF6A] hover:scale-[1.02]'
              : 'bg-[#0F172A] text-white hover:bg-[#1E293B] hover:scale-[1.02]'
          }
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          focus:outline-none focus:ring-2 focus:ring-[#D7F50A] focus:ring-offset-2
        `}
      >
        {isSubscribing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          'Subscribe Now'
        )}
      </button>

      {/* Features list */}
      <div className="mt-8 space-y-4">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              <Check size={14} className="text-green-600" />
            </div>
            <span className="text-[#0F172A] text-sm leading-relaxed">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
