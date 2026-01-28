/**
 * BackgroundWarning
 * Banner showing warning after returning from background
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { AlertCircle, X, RefreshCw } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface BackgroundWarningProps {
    visible: boolean;
    timeAwayMs: number;
    isSyncing?: boolean;
    onDismiss: () => void;
}

export function BackgroundWarning({
    visible,
    timeAwayMs,
    isSyncing = false,
    onDismiss,
}: BackgroundWarningProps) {
    // Animation
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 15 });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            translateY.value = withTiming(-100, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, translateY, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    // Format time away
    const formatTimeAway = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        return `${seconds}s`;
    };

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {isSyncing ? (
                        <RefreshCw size={18} color={COLORS.warning} />
                    ) : (
                        <AlertCircle size={18} color={COLORS.warning} />
                    )}
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        {isSyncing ? 'Syncing...' : 'Welcome back!'}
                    </Text>
                    <Text style={styles.message}>
                        {isSyncing
                            ? 'Re-syncing session with server'
                            : `You were away for ${formatTimeAway(timeAwayMs)}. Timer synced.`}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={onDismiss}
                    activeOpacity={0.7}
                >
                    <X size={16} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: SPACING.lg,
        right: SPACING.lg,
        zIndex: 50,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.warning,
        marginBottom: 2,
    },
    message: {
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    dismissButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.sm,
    },
});
