'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserProfile } from '@/hooks/useUserProfile';
import { Option } from '@/types/select.types';
import toast from 'react-hot-toast';

interface ProfileSectionProps {
  user: UserProfile | null;
  isLoading: boolean;
  onUpdate: (data: {
    name?: string;
    timezone?: string;
    avatarEmoji?: string;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onAvatarClick?: () => void;
}

const timezones: Option[] = [
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
];

// Generate color from user ID hash
function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

export function ProfileSection({
  user,
  isLoading,
  onUpdate,
  onAvatarClick,
}: ProfileSectionProps) {
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasTouchedName, setHasTouchedName] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setTimezone(user.timezone || 'America/New_York');
    }
  }, [user]);

  // Validate name
  const validateName = (value: string): string => {
    if (!value || value.trim().length === 0) {
      return 'Name is required';
    }
    if (value.length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (value.length > 50) {
      return 'Name must be less than 50 characters';
    }
    return '';
  };

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (hasTouchedName) {
      setNameError(validateName(value));
    }
  };

  // Handle name blur
  const handleNameBlur = () => {
    setHasTouchedName(true);
    setNameError(validateName(name));
  };

  // Check if there are changes
  const hasChanges = user && (name !== user.name || timezone !== user.timezone);

  // Check if form is valid
  const isValid =
    !nameError && name.trim().length >= 2 && name.trim().length <= 50;

  // Handle save
  const handleSave = async () => {
    // Final validation
    const error = validateName(name);
    if (error) {
      setNameError(error);
      setHasTouchedName(true);
      return;
    }

    setIsSaving(true);
    const result = await onUpdate({
      name: name.trim(),
      timezone,
    });

    if (result.success) {
      toast.success('Profile updated!');
      setHasTouchedName(false);
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-80 rounded-2xl" />
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-text-secondary">Failed to load profile</p>
        </div>
      </Card>
    );
  }

  const avatarColor = getAvatarColor(user.id);
  const avatarInitial = user.name.charAt(0).toUpperCase();
  const hasAvatarEmoji = user.avatarEmoji && user.avatarEmoji.trim() !== '';

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Profile</h2>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          {hasAvatarEmoji ? (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-4xl flex-shrink-0">
              {user.avatarEmoji}
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {avatarInitial}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">Avatar</p>
            {onAvatarClick && (
              <button
                type="button"
                onClick={onAvatarClick}
                className="text-xs text-accent hover:underline mt-1"
              >
                Change Avatar
              </button>
            )}
          </div>
        </div>

        {/* Name Input */}
        <div>
          <Input
            label="Name"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            error={nameError}
            placeholder="Enter your name"
            maxLength={50}
            required
          />
        </div>

        {/* Email Display */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-text-secondary cursor-not-allowed"
            />
            {user.emailVerified && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-green-600 text-sm font-medium">
                  ✓ Verified
                </span>
              </div>
            )}
          </div>
          <p className="mt-1.5 text-sm text-text-muted">
            Email cannot be changed
          </p>
        </div>

        {/* Timezone Dropdown */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Timezone
          </label>
          <Select
            options={timezones}
            value={timezones.find((tz) => tz.value === timezone) || null}
            onChange={(option) => {
              if (option) {
                setTimezone(option.value);
              }
            }}
            placeholder="Select timezone"
          />
          <p className="mt-1.5 text-sm text-text-muted">
            Used for session timestamps
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={!hasChanges || !isValid || isSaving}
            isLoading={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
