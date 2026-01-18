'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  priceDetail?: string;
  features: PricingFeature[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'FREE',
    price: '₹0',
    priceDetail: '/month',
    features: [
      { text: 'Focus Timer', included: true },
      { text: '1 Weekly AI Reports', included: true },
      { text: '3 Sessions Daily', included: true },
      { text: '3 Session Notes ', included: true },
      // { text: '1 Device', included: true },
      { text: 'One focus ambient sound', included: true },
      { text: 'AI Task Breakdown', included: false },
      { text: 'Advanced Insights', included: false },
      { text: 'Export Data (CSV/PDF)', included: false },
      { text: 'Priority Support', included: false },
    ],
    cta: 'Start Free',
    ctaLink: '/signup',
  },
  {
    name: 'PRO',
    price: '₹95',
    priceDetail: '/month',
    features: [
      { text: 'Focus Timer', included: true },
      { text: 'Unlimited Daily Sessions', included: true },
      { text: 'AI Task Breakdown', included: true },
      { text: 'Advanced Analytics & Insights', included: true },
      { text: 'Weekly AI Insights', included: true },
      { text: 'Export to CSV/PDF', included: true },
      // { text: 'Up to 5 Devices', included: true },
      { text: 'Unlimited Session Notes', included: true },
      { text: 'Priority Support', included: true },
      { text: '5+ focus ambient sounds', included: true },
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/pricing',
  },
  {
    name: 'PRO',
    price: '₹600',
    priceDetail: '/year',
    features: [
      { text: 'Focus Timer', included: true },
      { text: 'Unlimited Daily Sessions', included: true },
      { text: 'AI Task Breakdown', included: true },
      { text: 'Advanced Analytics & Insights', included: true },
      { text: 'Weekly AI Insights', included: true },
      { text: 'Export to CSV/PDF', included: true },
      // { text: 'Up to 5 Devices', included: true },
      { text: 'Unlimited Session Notes', included: true },
      { text: 'Priority Support', included: true },
      { text: '5+ focus ambient sounds', included: true },
      { text: 'Best value - Save 47%', included: true },
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/pricing',
    popular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-[120px] px-5 md:px-10 bg-white/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Start Free, Upgrade When You're Ready
          </h2>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              {/* Most Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-accent text-text-primary px-6 py-2 rounded-full text-sm font-semibold shadow-md">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Pricing Card */}
              <div
                className={`h-full bg-white rounded-3xl p-8 flex flex-col ${
                  tier.popular
                    ? 'border-2 border-accent shadow-floating'
                    : 'border border-gray-200 shadow-card'
                }`}
              >
                {/* Tier Name */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-text-primary">
                    {tier.name}
                  </h3>
                  {tier.priceDetail === '/year' && (
                    <p className="text-sm text-text-secondary mt-1">
                      Yearly Plan
                    </p>
                  )}
                  {tier.priceDetail === '/month' && tier.name === 'PRO' && (
                    <p className="text-sm text-text-secondary mt-1">
                      Monthly Plan
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-text-primary">
                      {tier.price}
                    </span>
                    {tier.priceDetail && (
                      <span className="text-text-secondary text-sm">
                        {tier.priceDetail}
                      </span>
                    )}
                  </div>
                  {tier.name === 'PRO' && tier.priceDetail === '/year' && (
                    <p className="text-sm text-text-muted mt-1">
                      ₹50/month (billed annually)
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check
                          size={20}
                          className="text-[#22C55E] flex-shrink-0 mt-0.5"
                        />
                      ) : (
                        <X
                          size={20}
                          className="text-text-muted flex-shrink-0 mt-0.5"
                        />
                      )}
                      <span
                        className={
                          feature.included
                            ? 'text-text-primary'
                            : 'text-text-muted line-through'
                        }
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href={tier.ctaLink} className="mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-full font-semibold text-base transition-all shadow-sm ${
                      tier.popular
                        ? 'bg-accent text-text-primary hover:bg-accent-soft shadow-md hover:shadow-lg'
                        : 'bg-white text-text-primary border-2 border-accent hover:bg-accent/10'
                    }`}
                  >
                    {tier.cta}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
