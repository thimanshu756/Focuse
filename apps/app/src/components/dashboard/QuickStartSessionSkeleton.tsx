import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { SPACING, BORDER_RADIUS } from '@/constants/theme';

export function QuickStartSessionSkeleton() {
    return (
        <Card style={styles.card}>
            {/* Header skeleton */}
            <View style={styles.iconHeader}>
                <Skeleton
                    width={35}
                    height={35}
                    borderRadius={BORDER_RADIUS.md}
                />
                <Skeleton
                    width={200}
                    height={20}
                    style={styles.headerTitleSkeleton}
                />
            </View>

            {/* Task Selection Section */}
            <View style={styles.section}>
                <Skeleton width={140} height={16} style={styles.labelSkeleton} />
                <Skeleton
                    width="100%"
                    height={48}
                    borderRadius={BORDER_RADIUS.sm}
                    style={styles.selectorSkeleton}
                />
            </View>

            {/* Duration Section */}
            <View style={styles.section}>
                <Skeleton width={80} height={16} style={styles.labelSkeleton} />

                {/* Duration buttons row */}
                <View style={styles.durationRow}>
                    <Skeleton
                        width="22%"
                        height={48}
                        borderRadius={BORDER_RADIUS.sm}
                    />
                    <Skeleton
                        width="22%"
                        height={48}
                        borderRadius={BORDER_RADIUS.sm}
                    />
                    <Skeleton
                        width="22%"
                        height={48}
                        borderRadius={BORDER_RADIUS.sm}
                    />
                    <Skeleton
                        width="22%"
                        height={48}
                        borderRadius={BORDER_RADIUS.sm}
                    />
                </View>
            </View>

            {/* Start Button skeleton */}
            <Skeleton
                width="100%"
                height={48}
                borderRadius={BORDER_RADIUS.sm}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: SPACING.lg,
    },
    iconHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: SPACING.lg,
    },
    headerTitleSkeleton: {
        marginLeft: SPACING.md,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    labelSkeleton: {
        marginBottom: SPACING.xs,
    },
    selectorSkeleton: {
        marginTop: SPACING.xs,
    },
    durationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
        gap: SPACING.sm,
    },
});
