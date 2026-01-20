'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  subscriptionTier: 'FREE' | 'PRO';
  avatar?: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hide navbar on session page
  const isSessionPage = pathname === '/session';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile once for all dashboard pages
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      router.push('/login');
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
            email: user.email || '',
            subscriptionTier: user.subscriptionTier || 'FREE',
            avatar: user.avatar || null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Don't redirect on error, just show default values
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [mounted, router]);

  // Show loading state during initial mount
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check authentication after mount
  if (!isAuthenticated()) {
    return null;
  }

  const firstName = userProfile?.name?.split(' ')[0] || '';
  const userTier = userProfile?.subscriptionTier || 'FREE';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8]">
      {!isSessionPage && (
        <Header
          userTier={userTier}
          userName={firstName}
          userAvatar={userProfile?.avatar}
          userId={userProfile?.id}
        />
      )}
      <div className={!isSessionPage ? 'pb-20 md:pb-0' : ''}>{children}</div>
      {!isSessionPage && <BottomNav />}
    </div>
  );
}
