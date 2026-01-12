'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Lock } from 'lucide-react';

export function SecuritySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Security
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Manage your password and security settings
        </p>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Lock size={18} />
          Change Password
        </Button>
      </Card>

      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
