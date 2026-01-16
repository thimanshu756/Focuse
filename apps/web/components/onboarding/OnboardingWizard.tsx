'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { api, aiApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import toast from 'react-hot-toast';

type UserType = 'student' | 'professional' | 'freelancer';
type FocusTime = 'morning' | 'afternoon' | 'evening' | 'night';

interface OnboardingData {
  userType: UserType | null;
  preferredFocusTime: FocusTime | null;
  taskTitle: string;
  useAI: boolean;
}

const USER_TYPES: { value: UserType; emoji: string; label: string }[] = [
  { value: 'student', emoji: '📚', label: 'Student' },
  { value: 'professional', emoji: '💼', label: 'Professional' },
  { value: 'freelancer', emoji: '🚀', label: 'Freelancer' },
];

const FOCUS_TIMES: { value: FocusTime; emoji: string; label: string }[] = [
  { value: 'morning', emoji: '🌅', label: 'Morning' },
  { value: 'afternoon', emoji: '☀️', label: 'Afternoon' },
  { value: 'evening', emoji: '🌙', label: 'Evening' },
  { value: 'night', emoji: '🌃', label: 'Night' },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    userType: null,
    preferredFocusTime: null,
    taskTitle: '',
    useAI: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'FREE' | 'PRO'>(
    'FREE'
  );

  // Check authentication and onboarding status
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data?.user) {
          const user = response.data.data.user;

          // Check email verification first
          if (!user.emailVerified) {
            router.push('/verify-email');
            return;
          }

          // If already onboarded, redirect to dashboard
          if (user.onboardingCompleted) {
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        // If error, redirect to login
        router.push('/login');
      }
    };

    checkAuthAndOnboarding();
  }, [router]);

  // Fetch user subscription tier
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data?.user) {
          setSubscriptionTier(
            response.data.data.user.subscriptionTier as 'FREE' | 'PRO'
          );
        }
      } catch (error) {
        // Ignore error, default to FREE
      }
    };
    fetchUser();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      // Arrow keys for selection (Step 1 & 2)
      if (currentStep === 1 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const currentIndex = USER_TYPES.findIndex(
          (t) => t.value === data.userType
        );
        if (e.key === 'ArrowDown') {
          const nextIndex =
            currentIndex < USER_TYPES.length - 1 ? currentIndex + 1 : 0;
          setData((prev) => ({
            ...prev,
            userType: USER_TYPES[nextIndex].value,
          }));
        } else {
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : USER_TYPES.length - 1;
          setData((prev) => ({
            ...prev,
            userType: USER_TYPES[prevIndex].value,
          }));
        }
      }

      if (
        currentStep === 2 &&
        (e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight')
      ) {
        e.preventDefault();
        const currentIndex = FOCUS_TIMES.findIndex(
          (t) => t.value === data.preferredFocusTime
        );
        let nextIndex = currentIndex;
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < 2 ? currentIndex + 2 : currentIndex - 2;
        } else if (e.key === 'ArrowUp') {
          nextIndex = currentIndex >= 2 ? currentIndex - 2 : currentIndex + 2;
        } else if (e.key === 'ArrowRight') {
          nextIndex =
            currentIndex < FOCUS_TIMES.length - 1 ? currentIndex + 1 : 0;
        } else if (e.key === 'ArrowLeft') {
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : FOCUS_TIMES.length - 1;
        }
        setData((prev) => ({
          ...prev,
          preferredFocusTime: FOCUS_TIMES[nextIndex].value,
        }));
      }

      // Enter key to proceed
      if (e.key === 'Enter') {
        const canProceedNow =
          (currentStep === 1 && data.userType !== null) ||
          (currentStep === 2 && data.preferredFocusTime !== null) ||
          (currentStep === 3 && data.taskTitle.trim().length >= 3);

        if (canProceedNow) {
          if (currentStep < 3) {
            handleNext();
          } else {
            handleComplete();
          }
        }
      }

      // Escape to skip
      if (e.key === 'Escape' && currentStep < 3) {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentStep,
    data.userType,
    data.preferredFocusTime,
    data.taskTitle,
    isLoading,
  ]);

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!data.userType) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!data.preferredFocusTime) return;

      // Save preferences
      setIsLoading(true);
      try {
        await api.patch('/auth/update-profile', {
          userType: data.userType,
          preferredFocusTime: data.preferredFocusTime,
        });
        setCurrentStep(3);
      } catch (error: any) {
        toast.error(
          error.response?.data?.error?.message ||
            'Failed to save preferences. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleComplete = async () => {
    if (!data.taskTitle.trim() || data.taskTitle.trim().length < 3) return;

    setIsLoading(true);
    try {
      if (data.useAI && subscriptionTier === 'PRO') {
        // Use AI breakdown
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7); // Default 7 days from now

        const response = await aiApi.post('/tasks/ai-breakdown', {
          prompt: data.taskTitle,
          deadline: deadline.toISOString(),
          priority: 'MEDIUM',
        });

        if (response.data.success) {
          // Mark onboarding as completed
          await api.patch('/auth/update-profile', {
            onboardingCompleted: true,
          });

          toast.success(
            'Welcome to Sylva! 🌱 Ready for your first focus session?'
          );
          router.push('/dashboard');
        }
      } else {
        // Create regular task
        const response = await api.post('/tasks', {
          title: data.taskTitle,
          status: 'TODO',
          priority: 'MEDIUM',
        });

        if (response.data.success) {
          // Mark onboarding as completed
          await api.patch('/auth/update-profile', {
            onboardingCompleted: true,
          });

          toast.success(
            'Welcome to Sylva! 🌱 Ready for your first focus session?'
          );
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message ||
        'Failed to create task. Please try again.';

      if (error.response?.status === 429 && data.useAI) {
        // AI rate limit - fallback to regular task
        toast.error('AI breakdown unavailable. Creating regular task instead.');
        try {
          const response = await api.post('/tasks', {
            title: data.taskTitle,
            status: 'TODO',
            priority: 'MEDIUM',
          });
          if (response.data.success) {
            await api.patch('/auth/update-profile', {
              onboardingCompleted: true,
            });
            toast.success(
              'Welcome to Sylva! 🌱 Ready for your first focus session?'
            );
            router.push('/dashboard');
          }
        } catch (fallbackError: any) {
          toast.error('Failed to create task. Please try again.');
        }
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressDots = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            {step < currentStep ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-text-primary" />
              </motion.div>
            ) : step === currentStep ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full bg-accent"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            )}
            {step < 3 && (
              <div
                className={`h-1 w-8 ${
                  step < currentStep ? 'bg-accent' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-text-primary text-center">
        🎯 What's your focus goal?
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {USER_TYPES.map((type) => (
          <motion.button
            key={type.value}
            type="button"
            onClick={() => setData({ ...data, userType: type.value })}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              data.userType === type.value
                ? 'border-accent bg-accent/10 scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            whileHover={{ scale: data.userType === type.value ? 1.02 : 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{type.emoji}</span>
              <span className="text-lg font-medium text-text-primary">
                {type.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-text-primary text-center">
        ⏰ When do you focus best?
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {FOCUS_TIMES.map((time) => (
          <motion.button
            key={time.value}
            type="button"
            onClick={() => setData({ ...data, preferredFocusTime: time.value })}
            className={`p-6 rounded-2xl border-2 transition-all text-center ${
              data.preferredFocusTime === time.value
                ? 'border-accent bg-accent/10 scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            whileHover={{
              scale: data.preferredFocusTime === time.value ? 1.02 : 1.01,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="space-y-2">
              <span className="text-3xl block">{time.emoji}</span>
              <span className="text-base font-medium text-text-primary">
                {time.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-text-primary text-center">
        ✨ Let's add your first focus task
      </h2>

      <Input
        label="Task"
        type="text"
        placeholder="e.g., Study for DBMS exam"
        value={data.taskTitle}
        onChange={(e) => setData({ ...data, taskTitle: e.target.value })}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && data.taskTitle.trim().length >= 3) {
            handleComplete();
          }
        }}
      />

      <div className="space-y-2">
        <Checkbox
          label={
            <span className="flex items-center gap-2">
              Break it down with AI <Sparkles className="h-4 w-4 text-accent" />
            </span>
          }
          checked={data.useAI}
          onChange={(e) => setData({ ...data, useAI: e.target.checked })}
          disabled={subscriptionTier !== 'PRO'}
        />
        {subscriptionTier !== 'PRO' && (
          <p className="text-xs text-text-muted ml-8">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
              PRO
            </span>{' '}
            feature - Upgrade to unlock AI task breakdown
          </p>
        )}
      </div>
    </motion.div>
  );

  const canProceed = () => {
    if (currentStep === 1) return data.userType !== null;
    if (currentStep === 2) return data.preferredFocusTime !== null;
    if (currentStep === 3) return data.taskTitle.trim().length >= 3;
    return false;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] flex items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="space-y-6">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">
                Step {currentStep} of 3
              </span>
            </div>
            {renderProgressDots()}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
            {currentStep > 1 ? (
              <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
                ← Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3 flex-1 justify-end">
              {currentStep < 3 && (
                <>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-1 py-0.5"
                    disabled={isLoading}
                  >
                    Skip for now
                  </button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!canProceed() || isLoading}
                    isLoading={isLoading}
                  >
                    Next →
                  </Button>
                </>
              )}
              {currentStep === 3 && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleComplete}
                  disabled={!canProceed() || isLoading}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Start Focusing →
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
