'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle } from 'lucide-react';

interface GiveUpModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GiveUpModal({
  onConfirm,
  onCancel,
  isLoading = false,
}: GiveUpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="flex justify-center"
          >
            <div className="p-4 bg-red-50 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-text-primary">
              Give Up Session?
            </h2>
            <p className="text-base text-text-secondary">
              Your tree will die and this session won't count toward your
              streak.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onConfirm}
              disabled={isLoading}
              isLoading={isLoading}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              Yes, Give Up
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
