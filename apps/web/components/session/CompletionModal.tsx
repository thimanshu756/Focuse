'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TreePine, Coffee, RefreshCw } from 'lucide-react';

interface CompletionModalProps {
  duration: number; // Duration in minutes
  onClose: () => void;
}

export function CompletionModal({ duration, onClose }: CompletionModalProps) {
  const router = useRouter();

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
              delay: 0.2,
            }}
            className="text-6xl"
          >
            🎉
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-text-primary">
              Great Work!
            </h2>
            <p className="text-base text-text-secondary">
              You focused for {duration} minutes and grew a tree!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <Button
              variant="ghost"
              size="md"
              onClick={() => router.push('/forest')}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <TreePine size={24} />
              <span className="text-sm">View Forest</span>
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                // TODO: Implement break timer
                onClose();
                router.push('/dashboard');
              }}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Coffee size={24} />
              <span className="text-sm">Take Break</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/dashboard')}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <RefreshCw size={24} />
              <span className="text-sm">New Session</span>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
