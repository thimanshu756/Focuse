'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTouched({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
    }
  }, [isOpen]);

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

  // Validate password complexity
  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  // Validate current password
  const validateCurrentPassword = (password: string): string => {
    if (!password) {
      return 'Current password is required';
    }
    return '';
  };

  // Validate confirm password
  const validateConfirmPassword = (
    password: string,
    newPassword: string
  ): string => {
    if (!password) {
      return 'Please confirm your new password';
    }
    if (password !== newPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Handle field changes
  const handleCurrentPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setCurrentPassword(value);
    if (touched.currentPassword) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: validateCurrentPassword(value),
      }));
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    if (touched.newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: validatePassword(value),
      }));
    }
    // Re-validate confirm password if it's been touched
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, value),
      }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, newPassword),
      }));
    }
  };

  // Handle blur
  const handleBlur = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword'
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'currentPassword') {
      setErrors((prev) => ({
        ...prev,
        currentPassword: validateCurrentPassword(currentPassword),
      }));
    } else if (field === 'newPassword') {
      setErrors((prev) => ({
        ...prev,
        newPassword: validatePassword(newPassword),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, newPassword),
      }));
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Validate all fields
    const currentError = validateCurrentPassword(currentPassword);
    const newError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(confirmPassword, newPassword);

    setErrors({
      currentPassword: currentError,
      newPassword: newError,
      confirmPassword: confirmError,
    });

    if (currentError || newError || confirmError) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        toast.success('Password changed!');
        onClose();
      } else {
        toast.error(
          response.data.error?.message || 'Failed to change password'
        );
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: 'Current password is incorrect',
        }));
        toast.error('Current password is incorrect');
      } else {
        toast.error(
          error.response?.data?.error?.message || 'Failed to change password'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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
          >
            <X size={24} className="text-text-secondary" />
          </button>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <h2
                id="modal-title"
                className="text-2xl font-semibold text-text-primary mb-2"
              >
                Change Password
              </h2>
              <p className="text-sm text-text-secondary">
                Enter your current password and choose a new one
              </p>
            </div>

            {/* Current Password */}
            <div>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Current Password"
                  value={currentPassword}
                  onChange={handleCurrentPasswordChange}
                  onBlur={() => handleBlur('currentPassword')}
                  error={errors.currentPassword}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-9 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={
                    showCurrentPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  onBlur={() => handleBlur('newPassword')}
                  error={errors.newPassword}
                  placeholder="Enter new password"
                  helperText="Must be 8+ characters with uppercase, lowercase, and number"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={
                    showNewPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={errors.confirmPassword}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="flex-1"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Change Password
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
