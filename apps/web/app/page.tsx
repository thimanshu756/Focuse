'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/landing/Navigation';
import { ChitraSpotlight } from '@/components/landing/bento/ChitraSpotlight';
import { Footer } from '@/components/landing/Footer';
import { HeroBento } from '@/components/landing/bento/HeroBento';
import { FeaturesBento } from '@/components/landing/bento/FeaturesBento';
import { HowItWorksBento } from '@/components/landing/bento/HowItWorksBento';
import { PricingBento } from '@/components/landing/bento/PricingBento';
import { FAQBento } from '@/components/landing/bento/FAQBento';
import { FinalCTABento } from '@/components/landing/bento/FinalCTABento';
import { isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  OrganizationSchema,
  WebsiteSchema,
  SoftwareAppSchema,
} from '@/components/seo/StructuredData';

// Note: Page-level metadata is inherited from root layout.tsx
// The root layout already includes comprehensive SEO metadata

interface UserProfile {
  id: string;
  name: string;
  subscriptionTier: 'FREE' | 'PRO';
  avatar?: string | null;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile if authenticated
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data) {
          // Handle both response formats
          const user = response.data.data.user || response.data.data;
          setUserProfile({
            id: user.id,
            name: user.name || '',
            subscriptionTier: user.subscriptionTier || 'FREE',
            avatar: user.avatar || null,
          });
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        // Silently fail - user might not be authenticated or token expired
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [mounted]);

  return (
    <>
      {/* SEO Structured Data */}
      <OrganizationSchema />
      <WebsiteSchema />
      <SoftwareAppSchema />

      <div className="min-h-screen bg-[#FAFAFA] pt-14">
        <Navigation
          isLoading={isLoading}
          userTier={userProfile?.subscriptionTier}
          userName={userProfile?.name}
          userAvatar={userProfile?.avatar}
          userId={userProfile?.id}
        />

        <main>
          <HeroBento />
          <FeaturesBento />
          <HowItWorksBento />
          {/* <TrustBento /> */}
          <PricingBento />
          <ChitraSpotlight />
          <FAQBento />
          <FinalCTABento />
        </main>

        <Footer />
      </div>
    </>
  );
}
