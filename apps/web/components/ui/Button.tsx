'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
      primary: 'bg-accent text-text-primary hover:bg-accent-soft',
      secondary: 'bg-white text-text-primary hover:bg-gray-50',
      ghost: 'bg-transparent text-text-primary hover:bg-white/50',
    };
    const sizeClasses = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-[52px] px-8 text-base',
    };

    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Please wait...</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
