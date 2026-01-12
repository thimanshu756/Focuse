'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatar: string | null | undefined;
  onSave: (avatar: string) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

const avatars = [
  '😊',
  '🤓',
  '😎',
  '🥳',
  '🤩',
  '😇',
  '🦸',
  '🧑‍💻',
  '👨‍🎓',
  '👩‍🚀',
  '🧙',
  '🦊',
];

export function AvatarPickerModal({
  isOpen,
  currentAvatar,
  onSave,
  onClose,
}: AvatarPickerModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selected avatar
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar || null);
    }
  }, [isOpen, currentAvatar]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!selectedAvatar) return;

    setIsSaving(true);
    const result = await onSave(selectedAvatar);

    if (result.success) {
      onClose();
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.25 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close modal"
            disabled={isSaving}
          >
            <X size={24} className="text-text-secondary" />
          </button>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div>
              <h2
                id="modal-title"
                className="text-2xl font-semibold text-text-primary mb-2"
              >
                Choose Your Avatar
              </h2>
              <p className="text-sm text-text-secondary">
                Select an avatar to represent you
              </p>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {avatars.map((avatar) => {
                const isSelected = selectedAvatar === avatar;
                return (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl sm:text-4xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent ${
                      isSelected
                        ? 'ring-4 ring-accent bg-yellow-50'
                        : 'hover:bg-gray-200'
                    }`}
                    aria-label={`Select avatar ${avatar}`}
                    disabled={isSaving}
                  >
                    {avatar}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-accent/20 rounded-full"
                      >
                        <Check
                          size={24}
                          className="text-accent drop-shadow-sm"
                        />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSave}
                className="flex-1"
                isLoading={isSaving}
                disabled={!selectedAvatar || isSaving}
              >
                Save Avatar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
