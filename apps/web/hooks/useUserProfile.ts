'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  timezone: string;
  subscriptionTier: 'FREE' | 'PRO';
  avatar?: string | null;
}

export function useUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/auth/me');

      if (response.data.success && response.data.data) {
        const userData = response.data.data.user || response.data.data;
        setUser({
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          emailVerified: userData.emailVerified || false,
          timezone: userData.timezone || 'America/New_York',
          subscriptionTier: userData.subscriptionTier || 'FREE',
          avatar: userData.avatar || null,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    timezone?: string;
    avatar?: string;
  }) => {
    try {
      const response = await api.patch('/auth/update-profile', data);
      if (response.data.success && response.data.data) {
        const userData = response.data.data.user || response.data.data;
        setUser({
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          emailVerified: userData.emailVerified || false,
          timezone: userData.timezone || 'America/New_York',
          subscriptionTier: userData.subscriptionTier || 'FREE',
          avatar: userData.avatar || null,
        });
        return { success: true };
      }
      return { success: false, error: 'Failed to update profile' };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error?.message || 'Failed to update profile',
      };
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
    updateProfile,
  };
}
