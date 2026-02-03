import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Session } from '@/types/api.types';
import { getTreeType } from '@/utils/tree.utils';
import { COLORS } from '@/constants/theme';
import { TreeAnimation } from './TreeAnimation';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
} from 'react-native-reanimated';

interface TreeItemProps {
    session: Session;
    onPress: (session: Session) => void;
    size?: number;
    index?: number;
    animationTrigger?: number;
}


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Only animate the first N trees for performance - beyond this threshold, trees appear instantly
const ANIMATION_THRESHOLD = 16;

export const TreeItem = React.memo(function TreeItem({ session, onPress, size = 80, index = 0, animationTrigger = 0 }: TreeItemProps) {
    const type = getTreeType(session.duration, session.status);
    const isDead = type === 'dead';

    // Skip animation for items beyond threshold
    const shouldAnimate = index < ANIMATION_THRESHOLD;

    // Entrance animation - start at final values if not animating
    const opacity = useSharedValue(shouldAnimate ? 0 : 1);
    const translateY = useSharedValue(shouldAnimate ? 20 : 0);
    const scale = useSharedValue(shouldAnimate ? 0.8 : 1);

    useEffect(() => {
        // Skip animation for items beyond threshold
        if (!shouldAnimate) {
            opacity.value = 1;
            translateY.value = 0;
            scale.value = 1;
            return;
        }

        // Reset animation
        opacity.value = 0;
        translateY.value = 20;
        scale.value = 0.8;

        // Trigger entrance with stagger (only for visible items)
        const delay = index * 30;
        opacity.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 100 }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
        scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 100 }));
    }, [index, animationTrigger, shouldAnimate]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <AnimatedPressable
            onPress={() => onPress(session)}
            style={[
                styles.container,
                { width: size },
                animatedStyle,
            ]}
        >
            <View style={[styles.treeContainer, { height: size + 20 }]}>
                <TreeAnimation treeType={type} isDead={isDead} />
            </View>
            {/* <Text style={styles.time} numberOfLines={1}>
                {format(new Date(session.startTime), 'HH:mm')}
            </Text> */}
        </AnimatedPressable>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        margin: 8,
    },
    treeContainer: {
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        // overflow: 'hidden', // Don't clip animations
    },
    time: {
        marginTop: -4,
        fontSize: 10,
        color: COLORS.text.secondary,
        textAlign: 'center',
        fontWeight: '500',
    },
});
