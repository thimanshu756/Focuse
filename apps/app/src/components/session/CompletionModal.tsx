/**
 * CompletionModal
 * Full-screen modal celebrating session completion
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
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, TreeDeciduous, Clock, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { TreeType } from '@/types/session.types';

interface CompletionModalProps {
    visible: boolean;
    duration: number; // in seconds
    treeTier: TreeType;
    sessionNumber?: number;
    streak?: number;
    onViewFocuse: () => void;
    onBackToDashboard: () => void;
}

const { width } = Dimensions.get('window');

export function CompletionModal({
    visible,
    duration,
    treeTier,
    sessionNumber = 1,
    streak = 1,
    onViewFocuse,
    onBackToDashboard,
}: CompletionModalProps) {
    // Animation values
    const checkScale = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const statsScale = useSharedValue(0.8);

    React.useEffect(() => {
        if (visible) {
            // Animate in sequence
            checkScale.value = withSequence(
                withSpring(1.2, { damping: 10 }),
                withSpring(1, { damping: 15 })
            );
            contentOpacity.value = withDelay(300, withSpring(1));
            statsScale.value = withDelay(500, withSpring(1, { damping: 12 }));
        } else {
            checkScale.value = 0;
            contentOpacity.value = 0;
            statsScale.value = 0.8;
        }
    }, [visible, checkScale, contentOpacity, statsScale]);

    const checkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    const statsAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: statsScale.value }],
        opacity: contentOpacity.value,
    }));

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins < 60) {
            return `${mins} min`;
        }
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
    };

    // Get tree tier display name
    const getTierName = (tier: TreeType) => {
        switch (tier) {
            case 'elite':
                return 'Elite Tree';
            case 'premium':
                return 'Premium Tree';
            default:
                return 'Tree';
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
            <View style={styles.overlay}>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.9)', 'rgba(15, 23, 42, 0.95)']}
                    style={styles.gradient}
                >
                    {/* Success Check Icon */}
                    <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
                        <LinearGradient
                            colors={[COLORS.primary.accent, COLORS.primary.soft]}
                            style={styles.checkGradient}
                        >
                            <Check size={48} color={COLORS.text.primary} strokeWidth={3} />
                        </LinearGradient>
                    </Animated.View>

                    {/* Title and Message */}
                    <Animated.View style={[styles.textContainer, contentAnimatedStyle]}>
                        <Text style={styles.title}>Session Complete! 🎉</Text>
                        <Text style={styles.subtitle}>
                            Amazing focus! You earned a {getTierName(treeTier)}.
                        </Text>
                    </Animated.View>

                    {/* Stats Cards */}
                    <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
                        <View style={styles.statCard}>
                            <Clock size={24} color={COLORS.primary.accent} />
                            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
                            <Text style={styles.statLabel}>Focus Time</Text>
                        </View>

                        <View style={styles.statCard}>
                            <TreeDeciduous size={24} color={COLORS.success} />
                            <Text style={styles.statValue}>{getTierName(treeTier)}</Text>
                            <Text style={styles.statLabel}>Tree Earned</Text>
                        </View>

                        {streak > 1 && (
                            <View style={styles.statCard}>
                                <Sparkles size={24} color={COLORS.warning} />
                                <Text style={styles.statValue}>{streak} days</Text>
                                <Text style={styles.statLabel}>Streak</Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* Action Buttons */}
                    <Animated.View style={[styles.buttonContainer, contentAnimatedStyle]}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onViewFocuse}
                            activeOpacity={0.8}
                        >
                            <TreeDeciduous size={20} color={COLORS.text.primary} />
                            <Text style={styles.primaryButtonText}>View FOCUSE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={onBackToDashboard}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </LinearGradient>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    checkContainer: {
        marginBottom: SPACING.xxl,
    },
    checkGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    title: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: '700',
        color: COLORS.text.white,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FONT_SIZES.lg,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: SPACING.lg,
        marginBottom: SPACING.xxxl,
    },
    statCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        alignItems: 'center',
        minWidth: (width - SPACING.xxl * 2 - SPACING.lg * 2) / 3,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statValue: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.text.white,
        marginTop: SPACING.sm,
    },
    statLabel: {
        fontSize: FONT_SIZES.sm,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: SPACING.xs,
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
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    secondaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.pill,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text.white,
    },
});
