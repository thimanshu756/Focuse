'use client';

import { Check, X } from 'lucide-react';
import Link from 'next/link';

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
      { text: 'Unlimited Session Notes', included: true },
      { text: 'Priority Support', included: true },
      { text: '5+ focus ambient sounds', included: true },
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/signup?plan=pro-monthly',
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
      { text: 'Unlimited Session Notes', included: true },
      { text: 'Priority Support', included: true },
      { text: '5+ focus ambient sounds', included: true },
      { text: 'Best value - Save 47%', included: true },
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/signup?plan=pro-yearly',
    popular: true,
  },
];

export const PricingBento = () => {
  return (
    <section id="pricing" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
          Simple Pricing
        </h2>
        <p className="text-lg text-text-secondary">
          Invest in your focus. Cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {pricingTiers.map((tier, index) => (
          <div
            key={index}
            className={`
                            rounded-3xl p-8 border shadow-sm flex flex-col relative overflow-hidden group transition-all duration-300
                            ${
                              tier.popular
                                ? 'bg-gradient-to-br from-[#111] to-[#222] border-gray-800 text-white shadow-card hover:shadow-xl'
                                : 'bg-white border-gray-100 text-text-primary hover:shadow-card hover:-translate-y-1'
                            }
                        `}
          >
            {/* Glow effect for popular card */}
            {tier.popular && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] group-hover:bg-accent/20 transition-colors pointer-events-none" />
            )}

            <div className="mb-8 relative z-10">
              {tier.popular && (
                <div className="inline-block px-3 py-1 rounded-full bg-accent text-black text-xs font-bold mb-4">
                  MOST POPULAR
                </div>
              )}
              <h3
                className={`text-2xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-text-primary'}`}
              >
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-4xl font-display font-bold ${tier.popular ? 'text-white' : 'text-text-primary'}`}
                >
                  {tier.price}
                </span>
                {tier.priceDetail && (
                  <span
                    className={`text-lg font-normal ${tier.popular ? 'text-gray-400' : 'text-text-muted'}`}
                  >
                    {tier.priceDetail}
                  </span>
                )}
              </div>
              {tier.name === 'PRO' && tier.priceDetail === '/year' && (
                <p className="text-gray-400 mt-2 text-sm">
                  ₹50/month (billed annually)
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8 flex-grow relative z-10">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div
                    className={`
                                        w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                                        ${tier.popular ? 'bg-accent' : feature.included ? 'bg-gray-100' : 'bg-transparent'}
                                    `}
                  >
                    {feature.included ? (
                      <Check
                        className={`w-3 h-3 ${tier.popular ? 'text-black' : 'text-text-primary'}`}
                      />
                    ) : (
                      <X className="w-3 h-3 text-text-muted" />
                    )}
                  </div>
                  <span
                    className={`
                                        text-sm leading-tight
                                        ${tier.popular ? 'text-gray-300' : feature.included ? 'text-text-secondary' : 'text-text-muted line-through'}
                                    `}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.ctaLink}
              className={`
                                relative z-10 w-full h-12 rounded-xl flex items-center justify-center font-bold transition-all
                                ${
                                  tier.popular
                                    ? 'bg-accent text-black hover:bg-accent-soft hover:scale-[1.02]'
                                    : 'border border-gray-200 text-text-primary hover:bg-gray-50'
                                }
                            `}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
