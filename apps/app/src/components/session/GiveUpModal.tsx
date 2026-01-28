/**
 * GiveUpModal
 * Confirmation dialog when user wants to abandon session
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { AlertTriangle, X, Play } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface GiveUpModalProps {
    visible: boolean;
    elapsedMinutes: number;
    currentStreak?: number;
    onKeepGoing: () => void;
    onGiveUp: () => void;
}

const { width } = Dimensions.get('window');

export function GiveUpModal({
    visible,
    elapsedMinutes,
    currentStreak = 0,
    onKeepGoing,
    onGiveUp,
}: GiveUpModalProps) {
    // Animation values
    const iconScale = useSharedValue(0);
    const modalScale = useSharedValue(0.9);

    React.useEffect(() => {
        if (visible) {
            modalScale.value = withSpring(1, { damping: 15 });
            iconScale.value = withSequence(
                withSpring(1.1, { damping: 10 }),
                withSpring(1, { damping: 12 })
            );
        } else {
            modalScale.value = 0.9;
            iconScale.value = 0;
        }
    }, [visible, iconScale, modalScale]);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
    }));

    const modalAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: modalScale.value }],
    }));

    return (
        <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
            <View style={styles.overlay}>
                <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onKeepGoing}
                        activeOpacity={0.7}
                    >
                        <X size={20} color={COLORS.text.secondary} />
                    </TouchableOpacity>

                    {/* Warning Icon */}
                    <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                        <AlertTriangle size={40} color={COLORS.warning} />
                    </Animated.View>

                    {/* Title and Message */}
                    <Text style={styles.title}>Give Up Session?</Text>
                    <Text style={styles.message}>
                        You've focused for{' '}
                        <Text style={styles.highlight}>{elapsedMinutes} minutes</Text>.
                        Your progress will be lost and the tree will wither.
                    </Text>

                    {/* Streak Warning */}
                    {currentStreak > 0 && (
                        <View style={styles.streakWarning}>
                            <Text style={styles.streakText}>
                                ⚠️ This may affect your {currentStreak}-day streak!
                            </Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onKeepGoing}
                            activeOpacity={0.8}
                        >
                            <Play size={18} color={COLORS.text.primary} />
                            <Text style={styles.primaryButtonText}>Keep Going</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.destructiveButton}
                            onPress={onGiveUp}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.destructiveButtonText}>Give Up</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    modalContainer: {
        backgroundColor: '#1a1a2e',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xxl,
        width: width - SPACING.xxl * 2,
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    closeButton: {
        position: 'absolute',
        top: SPACING.lg,
        right: SPACING.lg,
        padding: SPACING.xs,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.text.white,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    message: {
        fontSize: FONT_SIZES.md,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING.lg,
    },
    highlight: {
        color: COLORS.primary.accent,
        fontWeight: '600',
    },
    streakWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    streakText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.warning,
        fontWeight: '500',
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: SPACING.md,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary.accent,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.pill,
        gap: SPACING.sm,
    },
    primaryButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    destructiveButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.pill,
    },
    destructiveButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: COLORS.error,
    },
});
