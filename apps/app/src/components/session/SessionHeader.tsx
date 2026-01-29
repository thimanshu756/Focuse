/**
 * SessionHeader
 * Premium header component for focus session
 * Minimal, non-intrusive design that complements the session experience
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X, WifiOff, Volume2, VolumeX } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface SessionHeaderProps {
  isOffline?: boolean;
  isSoundEnabled?: boolean;
  onClose: () => void;
  onSoundToggle?: () => void;
}

export function SessionHeader({
  isOffline = false,
  isSoundEnabled = false,
  onClose,
  onSoundToggle,
}: SessionHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Left side: Offline indicator only */}
      <View style={styles.leftSection}>
        {isOffline && (
          <View style={styles.offlineBadge}>
            <WifiOff size={14} color={COLORS.warning} />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>

      {/* Right side: Actions */}
      <View style={styles.rightSection}>
        {/* Sound Toggle */}
        {onSoundToggle && (
          <TouchableOpacity
            style={[styles.iconButton, isSoundEnabled && styles.iconButtonActive]}
            onPress={onSoundToggle}
            activeOpacity={0.7}
            accessibilityLabel={isSoundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {isSoundEnabled ? (
              <Volume2 size={20} color={COLORS.primary.accent} />
            ) : (
              <VolumeX size={20} color={COLORS.session.textMuted} />
            )}
          </TouchableOpacity>
        )}

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityLabel="Leave session"
        >
          <X size={22} color={COLORS.session.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  leftSection: {
    flex: 1,
    marginRight: SPACING.md,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignSelf: 'flex-start',
  },
  offlineText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.warning,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.session.card,
    borderWidth: 1,
    borderColor: COLORS.session.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(215, 245, 10, 0.1)',
    borderColor: 'rgba(215, 245, 10, 0.3)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.session.card,
    borderWidth: 1,
    borderColor: COLORS.session.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
