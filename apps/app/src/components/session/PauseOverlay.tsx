/**
 * PauseOverlay
 * Semi-transparent overlay when session is paused
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Play, Pause } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface PauseOverlayProps {
    visible: boolean;
    onResume: () => void;
    isLoading?: boolean;
}

export function PauseOverlay({ visible, onResume, isLoading = false }: PauseOverlayProps) {
    // Pulsing animation for PAUSED text
    const pulseOpacity = useSharedValue(1);

    React.useEffect(() => {
        if (visible) {
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1, // Infinite repeat
                true // Reverse
            );
        } else {
            pulseOpacity.value = 1;
        }
    }, [visible, pulseOpacity]);

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.content}>
                {/* Pause Icon */}
                <View style={styles.iconContainer}>
                    <Pause size={48} color={COLORS.text.white} />
                </View>

                {/* PAUSED Text with pulse */}
                <Animated.Text style={[styles.pausedText, pulseAnimatedStyle]}>
                    PAUSED
                </Animated.Text>

                <Text style={styles.subtitle}>
                    Your focus session is paused. Take a moment, then continue.
                </Text>

                {/* Resume Button */}
                <TouchableOpacity
                    style={[styles.resumeButton, isLoading && styles.resumeButtonDisabled]}
                    onPress={onResume}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    <Play size={24} color={COLORS.text.primary} />
                    <Text style={styles.resumeButtonText}>
                        {isLoading ? 'Resuming...' : 'Resume'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    content: {
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    pausedText: {
        fontSize: 48,
        fontWeight: '800',
        color: COLORS.text.white,
        letterSpacing: 8,
        marginBottom: SPACING.lg,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        maxWidth: 280,
        marginBottom: SPACING.xxxl,
        lineHeight: 22,
    },
    resumeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary.accent,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xxxl,
        borderRadius: BORDER_RADIUS.pill,
        gap: SPACING.sm,
        minWidth: 180,
    },
    resumeButtonDisabled: {
        opacity: 0.6,
    },
    resumeButtonText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
});
