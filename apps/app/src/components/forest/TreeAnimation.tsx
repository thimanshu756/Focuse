import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, Ellipse, Line, Circle, Polygon, Rect } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    withSpring,
    Easing,
    interpolate,
    useDerivedValue
} from 'react-native-reanimated';
import { TreeType } from '@/utils/tree.utils';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface TreeAnimationProps {
    treeType: TreeType;
    progress?: number;
    isDead?: boolean;
}

export function TreeAnimation({ treeType, progress = 100, isDead = false }: TreeAnimationProps) {
    const growth = useSharedValue(0);

    useEffect(() => {
        // Animate growth from 0 to 1 on mount
        growth.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    }, [isDead]);

    // Helper to determine derived values for elements
    // We map the global 'growth' (0-1) to specific start times for elements
    // Mimics: const shouldShow = (minProgress: number) => progress >= minProgress;
    // Since we animate growth 0->1, we can use interpolate to check threshold

    const getScale = (threshold: number) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useDerivedValue(() => {
            // If growth > threshold, scale is 1. Else 0.
            // We add a small transition window for smoothness
            return interpolate(growth.value, [threshold - 0.1, threshold], [0, 1], 'clamp');
        });
    };


    if (isDead) {
        return (
            <Svg viewBox="0 0 200 300" style={{ width: '100%', height: '100%', opacity: 0.8 }}>
                {/* Ground */}
                <Ellipse cx="100" cy="275" rx="45" ry="12" fill="#4B5563" opacity={0.5} />

                {/* Dead Leaves on ground */}
                <Circle cx="70" cy="273" r="3" fill="#78716C" />
                <Circle cx="80" cy="275" r="2.5" fill="#78716C" />
                <Circle cx="120" cy="274" r="3" fill="#78716C" />
                <Circle cx="130" cy="276" r="2" fill="#78716C" />

                {/* Small gravestone */}
                <Rect x="85" y="255" width="30" height="15" rx="2" fill="#6B7280" opacity={0.7} />
                <Circle cx="100" cy="255" r="5" fill="#6B7280" opacity={0.7} />

                {/* Dead trunk */}
                <Line x1="100" y1="270" x2="100" y2="140" stroke="#57534E" strokeWidth="12" strokeLinecap="round" />

                {/* Broken Top */}
                <AnimatedLine
                    x1="100" y1="140" x2="95" y2="125" stroke="#57534E" strokeWidth="8" strokeLinecap="round"
                    animatedProps={useAnimatedProps(() => ({ strokeOpacity: growth.value }))}
                />

                {/* Broken branches */}
                <Line x1="100" y1="180" x2="70" y2="165" stroke="#57534E" strokeWidth="6" strokeLinecap="round" />
                <Line x1="100" y1="200" x2="130" y2="190" stroke="#57534E" strokeWidth="5" strokeLinecap="round" />
            </Svg>
        );
    }

    // Trunk growth
    const trunkProps = useAnimatedProps(() => ({
        y2: interpolate(growth.value, [0.15, 0.5], [270, 120], 'clamp'),
    }));

    // Reusable component for scaled items
    const ScaledEl = ({ children, threshold }: { children: any, threshold: number }) => {
        const scale = getScale(threshold);
        const style = useAnimatedProps(() => ({
            transform: [{ scale: scale.value }],
            opacity: scale.value
        }));
        // Clone child to attach animated props
        return React.cloneElement(children, { animatedProps: style });
    };

    // Helper for foliage that needs scale (sway removed)
    const AnimatedFoliage = ({ component: Component, threshold, ...props }: any) => {
        const scaleVal = getScale(threshold);

        const combinedProps = useAnimatedProps(() => {
            const scale = scaleVal.value;
            return {
                transform: [
                    { scale: scale },
                ],
                opacity: scale
            };
        });

        return <Component origin={props.origin || "100, 150"} {...props} animatedProps={combinedProps} />;
    };


    return (
        <Svg viewBox="0 0 200 300" style={{ width: '100%', height: '100%' }}>
            {/* Ground Layer 1 */}
            <AnimatedEllipse
                cx="100" cy="275" rx="45" ry="12" fill="#8B7355"
                animatedProps={useAnimatedProps(() => ({ transform: [{ scale: interpolate(growth.value, [0, 0.2], [0, 1], 'clamp') }] }))}
            />
            {/* Darker Soil */}
            <AnimatedEllipse
                cx="100" cy="273" rx="38" ry="8" fill="#6B5344"
                animatedProps={useAnimatedProps(() => ({ transform: [{ scale: interpolate(growth.value, [0.1, 0.3], [0, 1], 'clamp') }] }))}
            />

            {/* Grass Blades Left */}
            <AnimatedPath d="M 65 275 Q 63 268 61 265" stroke="#7CB342" strokeWidth="2" strokeLinecap="round" fill="none"
                animatedProps={useAnimatedProps(() => ({ opacity: interpolate(growth.value, [0.2, 0.3], [0, 1], 'clamp') }))} />
            <AnimatedPath d="M 70 276 Q 69 270 68 266" stroke="#8BC34A" strokeWidth="2" strokeLinecap="round" fill="none"
                animatedProps={useAnimatedProps(() => ({ opacity: interpolate(growth.value, [0.25, 0.35], [0, 1], 'clamp') }))} />

            {/* Grass Blades Right */}
            <AnimatedPath d="M 125 277 Q 127 271 129 267" stroke="#9CCC65" strokeWidth="2" strokeLinecap="round" fill="none"
                animatedProps={useAnimatedProps(() => ({ opacity: interpolate(growth.value, [0.3, 0.4], [0, 1], 'clamp') }))} />
            <AnimatedPath d="M 130 276 Q 131 270 132 266" stroke="#8BC34A" strokeWidth="2" strokeLinecap="round" fill="none"
                animatedProps={useAnimatedProps(() => ({ opacity: interpolate(growth.value, [0.35, 0.45], [0, 1], 'clamp') }))} />

            {/* Trunk */}
            <AnimatedLine
                x1="100" y1="270" x2="100" y2="120" stroke="#A0826D" strokeWidth="14" strokeLinecap="round"
                animatedProps={trunkProps}
            />

            {/* BASIC TREE FOLIAGE */}
            {treeType === 'basic' && (
                <>
                    {/* Bottom Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.7} points="45,180 100,95 100,180" fill="#2E7D32" origin="100, 180" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.70} points="100,95 155,180 100,180" fill="#66BB6A" origin="100, 180" />

                    {/* Second Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.74} points="58,130 100,55 100,130" fill="#388E3C" origin="100, 130" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.74} points="100,55 142,130 100,130" fill="#81C784" origin="100, 130" />

                    {/* Third Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.78} points="70,85 100,25 100,85" fill="#43A047" origin="100, 85" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.78} points="100,25 130,85 100,85" fill="#9CCC65" origin="100, 85" />

                    {/* Top Peak */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.82} points="82,50 100,10 118,50" fill="#AED581" origin="100, 50" />
                </>
            )}

            {/* PREMIUM TREE FOLIAGE */}
            {treeType === 'premium' && (
                <>
                    {/* Bottom Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.7} points="45,180 100,95 100,180" fill="#1B5E20" origin="100, 180" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.7} points="100,95 155,180 100,180" fill="#4CAF50" origin="100, 180" />

                    {/* Second Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.74} points="58,130 100,55 100,130" fill="#2E7D32" origin="100, 130" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.74} points="100,55 142,130 100,130" fill="#66BB6A" origin="100, 130" />

                    {/* Third Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.78} points="70,85 100,25 100,85" fill="#388E3C" origin="100, 85" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.78} points="100,25 130,85 100,85" fill="#81C784" origin="100, 85" />

                    {/* Top Peak */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.82} points="82,50 100,10 118,50" fill="#9CCC65" origin="100, 50" />

                    {/* Pink Blossoms */}
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.85} cx="65" cy="160" r="6" fill="#FF4081" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.85} cx="135" cy="160" r="6" fill="#FF80AB" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.87} cx="75" cy="110" r="5" fill="#FF4081" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.87} cx="125" cy="110" r="5" fill="#FF80AB" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.89} cx="85" cy="70" r="4" fill="#F48FB1" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.89} cx="115" cy="70" r="4" fill="#FF80AB" origin="100, 150" />
                </>
            )}

            {/* ELITE TREE FOLIAGE */}
            {treeType === 'elite' && (
                <>
                    {/* Bottom Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.7} points="45,180 100,95 100,180" fill="#0D47A1" origin="100, 180" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.7} points="100,95 155,180 100,180" fill="#1976D2" origin="100, 180" />

                    {/* Second Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.74} points="58,130 100,55 100,130" fill="#1565C0" origin="100, 130" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.74} points="100,55 142,130 100,130" fill="#42A5F5" origin="100, 130" />

                    {/* Third Tier */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.78} points="70,85 100,25 100,85" fill="#0288D1" origin="100, 85" />
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.78} points="100,25 130,85 100,85" fill="#29B6F6" origin="100, 85" />

                    {/* Top Peak */}
                    <AnimatedFoliage component={AnimatedPolygon} threshold={0.82} points="82,50 100,10 118,50" fill="#81D4FA" origin="100, 50" />

                    {/* Golden Blossoms */}
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.85} cx="60" cy="165" r="7" fill="#FFD700" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.85} cx="140" cy="165" r="7" fill="#FFC107" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.87} cx="70" cy="115" r="6" fill="#FFD700" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.87} cx="130" cy="115" r="6" fill="#FFC107" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.89} cx="80" cy="75" r="5" fill="#FFEB3B" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.89} cx="120" cy="75" r="5" fill="#FFC107" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.91} cx="95" cy="40" r="4" fill="#FFD700" origin="100, 150" />
                    <AnimatedFoliage component={AnimatedCircle} threshold={0.91} cx="105" cy="40" r="4" fill="#FFEB3B" origin="100, 150" />
                </>
            )}

        </Svg>
    );
}
