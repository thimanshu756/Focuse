import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { Crown, Check, Star } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { User } from '@/types/api.types';

interface SubscriptionCardProps {
    user: User;
    onUpgrade: () => void;
}

export const SubscriptionCard = ({ user, onUpgrade }: SubscriptionCardProps) => {
    const isPro = user.subscriptionTier === 'PRO';

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Crown size={24} color={isPro ? "#EAB308" : COLORS.text.secondary} />
                <Text style={styles.title}>Subscription</Text>
            </View>

            <View style={styles.planContainer}>
                <Text style={styles.planLabel}>Current Plan</Text>
                <View style={styles.planBadge}>
                    <Text style={styles.planText}>{isPro ? 'PRO PLAN' : 'FREE PLAN'}</Text>
                    {isPro && <Star size={16} color="#EAB308" fill="#EAB308" />}
                </View>
            </View>

            {isPro ? (
                <View style={styles.activeContainer}>
                    <Text style={styles.activeText}>
                        <Check size={16} color="#15803d" /> You are on the PRO plan
                    </Text>
                </View>
            ) : (
                <View style={styles.featuresList}>
                    <Text style={styles.featuresTitle}>Upgrade to unlock:</Text>
                    <View style={styles.featureRow}>
                        <Star size={14} color="#EAB308" />
                        <Text style={styles.featureText}>AI Task Breakdown</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Star size={14} color="#EAB308" />
                        <Text style={styles.featureText}>Advanced Analytics</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Star size={14} color="#EAB308" />
                        <Text style={styles.featureText}>Priority Support</Text>
                    </View>

                    <Button
                        title="Upgrade to Pro"
                        onPress={onUpgrade}
                        variant="primary"
                        style={{ marginTop: SPACING.md }}
                    // Add icon if button component supports/allows
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.background.card,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.text.muted,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    planContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingBottom: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    planLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.pill,
    },
    planText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    activeContainer: {
        backgroundColor: '#F0FDF4',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    activeText: {
        color: '#15803d',
        fontWeight: '600',
        textAlign: 'center',
    },
    featuresList: {
        gap: SPACING.xs,
    },
    featuresTitle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    featureText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    }
});
