'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export function LogoutButton() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Try to call logout API
      try {
        await api.post('/auth/logout');
      } catch (error) {
        // Even if API fails, proceed with client-side logout
        console.error('Logout API error:', error);
      }

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }

      // Show success toast
      toast.success('Logged out successfully');

      // Redirect to login
      router.push('/login');
    } catch (error: any) {
      // Show error but still proceed with logout
      toast.error('Error during logout, but session cleared');

      // Clear local storage anyway
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }

      // Redirect to login
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="md"
        onClick={() => setIsModalOpen(true)}
        className="w-full max-w-md mx-auto flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
      >
        <span>🚪</span>
        Logout
      </Button>

      <LogoutConfirmModal
        isOpen={isModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsModalOpen(false)}
        isLoading={isLoggingOut}
      />
    </>
  );
}
