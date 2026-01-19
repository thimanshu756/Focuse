'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Sparkles, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  benefits?: string[];
}

export function UpgradePrompt({
  isOpen,
  onClose,
  feature = 'this feature',
  benefits = [
    'Unlimited AI requests',
    'Advanced analytics',
    'Export to CSV/PDF',
    '5 devices',
    'Priority support',
  ],
}: UpgradePromptProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-5 z-50 pointer-events-none">
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full pointer-events-auto shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-[#64748B]" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  className="p-4 bg-gradient-to-br from-[#D7F50A] to-[#E9FF6A] rounded-3xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                  <Crown size={32} className="text-[#0F172A]" />
                </motion.div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-[#0F172A] text-center mb-2">
                Unlock PRO Features
              </h3>

              {/* Description */}
              <p className="text-[#64748B] text-center mb-6">
                Upgrade to PRO to access {feature} and unlock all premium
                features
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-green-600" />
                    </div>
                    <span className="text-[#0F172A] text-sm font-medium">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Price highlight */}
              <div className="bg-gradient-to-r from-[#D7F50A]/10 to-[#E9FF6A]/10 rounded-2xl p-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles size={16} className="text-[#D7F50A]" />
                  <span className="text-sm font-medium text-[#64748B]">
                    Starting at
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-[#0F172A]">₹95</span>
                  <span className="text-[#64748B] text-sm">/month</span>
                </div>
                <div className="text-xs text-[#64748B] mt-1">
                  or save 47% with yearly plan
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push('/pricing');
                    onClose();
                  }}
                  className="w-full bg-[#D7F50A] text-[#0F172A] py-3.5 rounded-full font-semibold 
                    hover:bg-[#E9FF6A] transition-all duration-200 hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-[#D7F50A] focus:ring-offset-2"
                >
                  View Plans & Upgrade
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-[#F1F5F9] text-[#64748B] py-3 rounded-full font-medium 
                    hover:bg-[#E2E8F0] transition-colors
                    focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
