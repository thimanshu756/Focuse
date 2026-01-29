import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    // eslint-disable-next-line react-native/no-unused-styles
    styles[variant],
    // eslint-disable-next-line react-native/no-unused-styles
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || isLoading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    // eslint-disable-next-line react-native/no-unused-styles
    styles[`${variant}Text` as 'primaryText' | 'secondaryText' | 'ghostText'],
    // eslint-disable-next-line react-native/no-unused-styles
    styles[`${size}Text` as 'smText' | 'mdText' | 'lgText'],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === 'primary' ? COLORS.text.primary : COLORS.primary.accent
          }
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

/* eslint-disable react-native/no-unused-styles */
const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: COLORS.text.secondary,
  },
  lg: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
  },
  lgText: {
    fontSize: FONT_SIZES.lg,
  },
  md: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  mdText: {
    fontSize: FONT_SIZES.md,
  },
  primary: {
    backgroundColor: COLORS.primary.accent,
  },
  primaryText: {
    color: COLORS.text.primary,
  },
  secondary: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.text.muted,
    borderWidth: 1,
  },
  secondaryText: {
    color: COLORS.text.primary,
  },
  sm: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  smText: {
    fontSize: FONT_SIZES.sm,
  },
  text: {
    fontWeight: '600',
  },
});
