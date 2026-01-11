'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={`peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white transition-all checked:border-accent checked:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              {...props}
            />
            <Check
              className="pointer-events-none absolute h-3.5 w-3.5 text-text-primary opacity-0 transition-opacity peer-checked:opacity-100"
              strokeWidth={3}
            />
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-text-primary cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="mt-1.5 text-sm text-red-600 ml-8"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
