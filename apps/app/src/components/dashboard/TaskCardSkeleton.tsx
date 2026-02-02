import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { SPACING, BORDER_RADIUS } from '@/constants/theme';

interface TaskCardSkeletonProps {
    count?: number;
}

export function TaskCardSkeleton({ count = 3 }: TaskCardSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} style={styles.card}>
                    <View style={styles.content}>
                        <View style={styles.main}>
                            {/* Icon container skeleton */}
                            <Skeleton
                                width={36}
                                height={36}
                                borderRadius={BORDER_RADIUS.sm}
                            />

                            {/* Info section skeleton */}
                            <View style={styles.info}>
                                {/* Title skeleton */}
                                <Skeleton
                                    width="80%"
                                    height={18}
                                    style={styles.titleSkeleton}
                                />

                                {/* Metadata row skeleton */}
                                <View style={styles.metaContainer}>
                                    <Skeleton width={80} height={14} />
                                    <Skeleton width={60} height={14} />
                                </View>
                            </View>
                        </View>

                        {/* Action button skeleton */}
                        <View style={styles.actions}>
                            <Skeleton
                                width={60}
                                height={32}
                                borderRadius={BORDER_RADIUS.sm}
                            />
                        </View>
                    </View>
                </Card>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        marginBottom: SPACING.md,
    },
    content: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    main: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
    },
    info: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    titleSkeleton: {
        marginBottom: 8,
    },
    metaContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
