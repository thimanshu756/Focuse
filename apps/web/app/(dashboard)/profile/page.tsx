'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import { SubscriptionSection } from '@/components/settings/SubscriptionSection';
import { LogoutButton } from '@/components/settings/LogoutButton';
import { AvatarPickerModal } from '@/components/settings/AvatarPickerModal';
import { useUserProfile } from '@/hooks/useUserProfile';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, isLoading, error, refetch, updateProfile } = useUserProfile();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleAvatarSave = async (avatar: string) => {
    const result = await updateProfile({ avatar });
    if (result.success) {
      toast.success('Avatar updated!');
      return { success: true };
    } else {
      toast.error(result.error || 'Failed to update avatar');
      return { success: false, error: result.error };
    }
  };

  return (
    <>
      <main className="max-w-3xl mx-auto px-5 md:px-10 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">
            Settings
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          {error ? (
            <Card className="p-6">
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="text-sm text-accent hover:underline"
                >
                  Retry
                </button>
              </div>
            </Card>
          ) : (
            <ProfileSection
              user={user}
              isLoading={isLoading}
              onUpdate={updateProfile}
              onAvatarClick={() => setShowAvatarModal(true)}
            />
          )}
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <SecuritySection />
        </motion.div>

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-6"
        >
          <SubscriptionSection user={user} />
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <LogoutButton />
        </motion.div>
      </main>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarModal}
        currentAvatar={user?.avatar || null}
        onSave={handleAvatarSave}
        onClose={() => setShowAvatarModal(false)}
      />
    </>
  );
}
