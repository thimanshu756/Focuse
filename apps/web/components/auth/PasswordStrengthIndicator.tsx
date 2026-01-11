'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = 'weak' | 'medium' | 'strong';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const { strength, requirements } = useMemo(() => {
    const reqs: PasswordRequirement[] = [
      {
        label: 'At least 8 characters',
        met: password.length >= 8,
      },
      {
        label: 'Contains uppercase letter',
        met: /[A-Z]/.test(password),
      },
      {
        label: 'Contains lowercase letter',
        met: /[a-z]/.test(password),
      },
      {
        label: 'Contains number',
        met: /[0-9]/.test(password),
      },
      {
        label: 'Contains special character',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ];

    const metCount = reqs.filter((r) => r.met).length;
    let strength: StrengthLevel = 'weak';
    if (metCount >= 4) {
      strength = 'strong';
    } else if (metCount >= 3) {
      strength = 'medium';
    }

    return { strength, requirements: reqs };
  }, [password]);

  if (!password) return null;

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  const strengthWidths = {
    weak: '33%',
    medium: '66%',
    strong: '100%',
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-text-secondary">
            Password strength
          </span>
          <span
            className={`text-xs font-semibold ${
              strength === 'weak'
                ? 'text-red-600'
                : strength === 'medium'
                  ? 'text-yellow-600'
                  : 'text-green-600'
            }`}
          >
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
            style={{ width: strengthWidths[strength] }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            {req.met ? (
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
            )}
            <span
              className={`text-xs ${
                req.met ? 'text-green-600' : 'text-text-muted'
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
