/**
 * SessionHeader
 * Header component for focus session with close button and status indicators
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X, WifiOff, Volume2 } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface SessionHeaderProps {
    taskTitle?: string;
    isOffline?: boolean;
    isSoundEnabled?: boolean;
    onClose: () => void;
    onSoundToggle?: () => void;
}

export function SessionHeader({
    taskTitle,
    isOffline = false,
    isSoundEnabled = false,
    onClose,
    onSoundToggle,
}: SessionHeaderProps) {
    return (
        <View style={styles.container}>
            {/* Left side: Task title or offline badge */}
            <View style={styles.leftSection}>
                {isOffline && (
                    <View style={styles.offlineBadge}>
                        <WifiOff size={12} color={COLORS.warning} />
                        <Text style={styles.offlineText}>Offline</Text>
                    </View>
                )}
                {taskTitle && !isOffline && (
                    <Text style={styles.taskTitle} numberOfLines={1}>
                        {taskTitle}
                    </Text>
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
                    >
                        <Volume2
                            size={20}
                            color={isSoundEnabled ? COLORS.primary.accent : 'rgba(255, 255, 255, 0.5)'}
                        />
                    </TouchableOpacity>
                )}

                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                    accessibilityLabel="Leave session"
                >
                    <X size={24} color={COLORS.text.white} />
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
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
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
    taskTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
        maxWidth: 200,
    },
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.pill,
        alignSelf: 'flex-start',
    },
    offlineText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.warning,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButtonActive: {
        backgroundColor: 'rgba(215, 245, 10, 0.2)',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
