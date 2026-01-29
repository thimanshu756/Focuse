import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
  padding?: keyof typeof SPACING;
}

export function Card({
  children,
  variant = 'default',
  padding = 'lg',
  style,
  ...props
}: CardProps) {
  const cardStyles = [
    styles.card,
    variant === 'outlined' && styles.outlined,
    { padding: SPACING[padding] },
    style,
  ];

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.card,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: COLORS.text.muted,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
});
