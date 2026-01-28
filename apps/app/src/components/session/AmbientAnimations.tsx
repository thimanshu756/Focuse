/**
 * AmbientAnimations
 * Time-based background particles (leaves, fireflies, stars) using Reanimated
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    withSequence,
    Easing,
} from 'react-native-reanimated';
// Define TimeOfDay type locally (matches useTimeOfDay hook)
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface AmbientAnimationsProps {
    timeOfDay: TimeOfDay;
    enabled?: boolean;
}

const { width, height } = Dimensions.get('window');

// Particle configurations by time of day
const PARTICLE_CONFIG = {
    morning: { count: 4, type: 'leaf' as const },
    afternoon: { count: 4, type: 'leaf' as const },
    evening: { count: 5, type: 'firefly' as const },
    night: { count: 7, type: 'star' as const },
};

interface ParticleProps {
    type: 'leaf' | 'firefly' | 'star';
    index: number;
    delay: number;
}

function Particle({ type, index, delay }: ParticleProps) {
    // Random initial positions
    const startX = useMemo(() => Math.random() * width, []);
    const startY = useMemo(() => Math.random() * height * 0.6, []);

    // Animation values
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    React.useEffect(() => {
        if (type === 'leaf') {
            // Leaves: drift down and sideways
            translateY.value = withDelay(
                delay,
                withRepeat(
                    withTiming(height + 50, { duration: 8000 + Math.random() * 4000, easing: Easing.linear }),
                    -1,
                    false
                )
            );
            translateX.value = withDelay(
                delay,
                withRepeat(
                    withSequence(
                        withTiming(30, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                        withTiming(-30, { duration: 2000, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                )
            );
            opacity.value = withTiming(0.6, { duration: 500 });
        } else if (type === 'firefly') {
            // Fireflies: float and glow
            translateX.value = withDelay(
                delay,
                withRepeat(
                    withSequence(
                        withTiming(50, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
                        withTiming(-50, { duration: 3000, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                )
            );
            translateY.value = withDelay(
                delay,
                withRepeat(
                    withSequence(
                        withTiming(-30, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                        withTiming(30, { duration: 2000, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                )
            );
            opacity.value = withDelay(
                delay,
                withRepeat(
                    withSequence(
                        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                )
            );
        } else if (type === 'star') {
            // Stars: twinkle in place
            opacity.value = withDelay(
                delay,
                withRepeat(
                    withSequence(
                        withTiming(1, { duration: 1000 + Math.random() * 1000 }),
                        withTiming(0.3, { duration: 1000 + Math.random() * 1000 })
                    ),
                    -1,
                    true
                )
            );
            scale.value = withDelay(
                delay,
                withRepeat(
                    withSequence(
                        withTiming(1.3, { duration: 1500 }),
                        withTiming(0.8, { duration: 1500 })
                    ),
                    -1,
                    true
                )
            );
        }
    }, [type, delay, translateX, translateY, opacity, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    // Particle appearance based on type
    const particleStyle = useMemo(() => {
        switch (type) {
            case 'leaf':
                return {
                    width: 12,
                    height: 12,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderRadius: 6,
                };
            case 'firefly':
                return {
                    width: 8,
                    height: 8,
                    backgroundColor: '#FFE566',
                    borderRadius: 4,
                    shadowColor: '#FFE566',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                };
            case 'star':
                return {
                    width: 4,
                    height: 4,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    shadowColor: '#FFFFFF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                };
        }
    }, [type]);

    return (
        <Animated.View
            style={[
                styles.particle,
                particleStyle,
                { left: startX, top: startY },
                animatedStyle,
            ]}
        />
    );
}

export function AmbientAnimations({ timeOfDay, enabled = true }: AmbientAnimationsProps) {
    const config = PARTICLE_CONFIG[timeOfDay];

    const particles = useMemo(() => {
        if (!enabled) return [];
        return Array.from({ length: config.count }, (_, i) => ({
            key: `${config.type}-${i}`,
            type: config.type,
            index: i,
            delay: i * 500,
        }));
    }, [config, enabled]);

    if (!enabled) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            {particles.map((particle) => (
                <Particle
                    key={particle.key}
                    type={particle.type}
                    index={particle.index}
                    delay={particle.delay}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    particle: {
        position: 'absolute',
    },
});
