/**
 * TreeAnimation Component
 * SVG tree that grows with session progress
 * Matches the web version design with triangular foliage
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Ellipse, Rect, Path, Circle, Polygon, G, ClipPath, Defs } from 'react-native-svg';
import type { TreeType } from '@/types/session.types';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface TreeAnimationProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Tree complexity tier */
  treeType: TreeType;
}

// Helper to check if element should show
const shouldShow = (progress: number, minProgress: number) => progress >= minProgress;

export function TreeAnimation({ progress, treeType }: TreeAnimationProps) {
  // Animated values derived from progress
  const animatedProgress = useDerivedValue(() => {
    return withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  // Ground animation - appears first (0-5%)
  const groundProps = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [0, 5], [0, 1], 'clamp');
    const opacity = interpolate(animatedProgress.value, [0, 5], [0, 1], 'clamp');
    return {
      opacity,
      rx: String(45 * scale),
      ry: String(12 * scale),
    };
  });

  const darkSoilProps = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [0, 5], [0, 1], 'clamp');
    const opacity = interpolate(animatedProgress.value, [0, 5], [0, 0.8], 'clamp');
    return {
      opacity,
      rx: String(38 * scale),
      ry: String(8 * scale),
    };
  });

  // Grass props - simple opacity fade
  const grassOpacity = useMemo(() => {
    return shouldShow(progress, 3) ? 1 : 0;
  }, [progress]);

  // Seed animation (5-10%)
  const seedProps = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [5, 10], [0, 1], 'clamp');
    return {
      rx: String(6 * scale),
      ry: String(8 * scale),
    };
  });

  // Trunk grows from bottom to top (15-50%)
  // We use a Rect with animated height instead of Line with strokeDasharray
  const trunkProps = useAnimatedProps(() => {
    const growthProgress = interpolate(animatedProgress.value, [15, 50], [0, 1], 'clamp');
    const height = 150 * growthProgress; // Full height is 150 (from y=270 to y=120)
    return {
      height: height,
      y: 270 - height, // Grow upward from bottom
    };
  });

  // Foliage helper - creates animated props for each tier
  const createFoliageOpacity = (startProgress: number) => {
    return shouldShow(progress, startProgress) ? 1 : 0;
  };

  const createFoliageScale = (startProgress: number): SharedValue<number> => {
    return useDerivedValue(() => {
      return interpolate(animatedProgress.value, [startProgress, startProgress + 5], [0, 1], 'clamp');
    }, [startProgress]);
  };

  // Pre-create all foliage scales
  const foliage70Scale = createFoliageScale(70);
  const foliage74Scale = createFoliageScale(74);
  const foliage78Scale = createFoliageScale(78);
  const foliage82Scale = createFoliageScale(82);
  const blossom85Scale = createFoliageScale(85);
  const blossom87Scale = createFoliageScale(87);
  const blossom89Scale = createFoliageScale(89);
  const blossom91Scale = createFoliageScale(91);

  // Animated group props for foliage tiers (scale from center)
  const foliage70Props = useAnimatedProps(() => ({
    opacity: interpolate(animatedProgress.value, [70, 72], [0, 1], 'clamp'),
  }));

  const foliage74Props = useAnimatedProps(() => ({
    opacity: interpolate(animatedProgress.value, [74, 76], [0, 1], 'clamp'),
  }));

  const foliage78Props = useAnimatedProps(() => ({
    opacity: interpolate(animatedProgress.value, [78, 80], [0, 1], 'clamp'),
  }));

  const foliage82Props = useAnimatedProps(() => ({
    opacity: interpolate(animatedProgress.value, [82, 84], [0, 1], 'clamp'),
  }));

  // Blossom props
  const blossom85Props = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [85, 88], [0, 1], 'clamp');
    return { r: String(6 * scale) };
  });

  const blossom87Props = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [87, 90], [0, 1], 'clamp');
    return { r: String(5 * scale) };
  });

  const blossom89Props = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [89, 92], [0, 1], 'clamp');
    return { r: String(4 * scale) };
  });

  const blossom91Props = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [91, 94], [0, 1], 'clamp');
    return { r: String(4 * scale) };
  });

  // Elite blossom props (larger)
  const eliteBlossom85Props = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [85, 88], [0, 1], 'clamp');
    return { r: String(7 * scale) };
  });

  const eliteBlossom87Props = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [87, 90], [0, 1], 'clamp');
    return { r: String(6 * scale) };
  });

  const eliteBlossom89Props = useAnimatedProps(() => {
    const scale = interpolate(animatedProgress.value, [89, 92], [0, 1], 'clamp');
    return { r: String(5 * scale) };
  });

  // Sparkle props for completion
  const sparkleProps = useAnimatedProps(() => {
    const scale = progress >= 100 ? 1 : 0;
    return {
      r: String(6 * scale),
      opacity: scale,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={320} height={280} viewBox="0 0 200 300">
        {/* Ground/Soil base - grows from center */}
        <AnimatedEllipse
          cx="100"
          cy="275"
          fill="#8B7355"
          animatedProps={groundProps}
        />

        {/* Darker soil layer */}
        <AnimatedEllipse
          cx="100"
          cy="273"
          fill="#6B5344"
          animatedProps={darkSoilProps}
        />

        {/* Grass blades - left side (simple fade in) */}
        <G opacity={grassOpacity}>
          <Path
            d="M 65 275 Q 63 268 61 265"
            stroke="#7CB342"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 70 276 Q 69 270 68 266"
            stroke="#8BC34A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 75 277 Q 73 271 71 267"
            stroke="#9CCC65"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Grass blades - right side */}
          <Path
            d="M 125 277 Q 127 271 129 267"
            stroke="#9CCC65"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 130 276 Q 131 270 132 266"
            stroke="#8BC34A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 135 275 Q 137 268 139 265"
            stroke="#7CB342"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </G>

        {/* Seed - grows from center */}
        <AnimatedEllipse
          cx="100"
          cy="274"
          fill="#6B5344"
          animatedProps={seedProps}
        />

        {/* Main trunk - grows upward from bottom using animated Rect */}
        <AnimatedRect
          x="93"
          width="14"
          fill="#A0826D"
          rx="7"
          animatedProps={trunkProps}
        />

        {/* BASIC TREE (0-15 mins) - Simple green triangles */}
        {treeType === 'basic' && (
          <G>
            {/* BOTTOM TIER */}
            <AnimatedG animatedProps={foliage70Props}>
              <Polygon points="45,180 100,95 100,180" fill="#2E7D32" />
              <Polygon points="100,95 155,180 100,180" fill="#66BB6A" />
            </AnimatedG>

            {/* SECOND TIER */}
            <AnimatedG animatedProps={foliage74Props}>
              <Polygon points="58,130 100,55 100,130" fill="#388E3C" />
              <Polygon points="100,55 142,130 100,130" fill="#81C784" />
            </AnimatedG>

            {/* THIRD TIER */}
            <AnimatedG animatedProps={foliage78Props}>
              <Polygon points="70,85 100,25 100,85" fill="#43A047" />
              <Polygon points="100,25 130,85 100,85" fill="#9CCC65" />
            </AnimatedG>

            {/* TOP PEAK */}
            <AnimatedG animatedProps={foliage82Props}>
              <Polygon points="82,50 100,10 118,50" fill="#AED581" />
            </AnimatedG>
          </G>
        )}

        {/* PREMIUM TREE (15-45 mins) - Vibrant with pink blossoms */}
        {treeType === 'premium' && (
          <G>
            {/* BOTTOM TIER - Richer greens */}
            <AnimatedG animatedProps={foliage70Props}>
              <Polygon points="45,180 100,95 100,180" fill="#1B5E20" />
              <Polygon points="100,95 155,180 100,180" fill="#4CAF50" />
            </AnimatedG>

            {/* SECOND TIER - Vibrant */}
            <AnimatedG animatedProps={foliage74Props}>
              <Polygon points="58,130 100,55 100,130" fill="#2E7D32" />
              <Polygon points="100,55 142,130 100,130" fill="#66BB6A" />
            </AnimatedG>

            {/* THIRD TIER - Bright */}
            <AnimatedG animatedProps={foliage78Props}>
              <Polygon points="70,85 100,25 100,85" fill="#388E3C" />
              <Polygon points="100,25 130,85 100,85" fill="#81C784" />
            </AnimatedG>

            {/* TOP PEAK - Light green */}
            <AnimatedG animatedProps={foliage82Props}>
              <Polygon points="82,50 100,10 118,50" fill="#9CCC65" />
            </AnimatedG>

            {/* PINK BLOSSOMS - Premium feature */}
            <AnimatedCircle cx="65" cy="160" fill="#FF4081" animatedProps={blossom85Props} />
            <AnimatedCircle cx="135" cy="160" fill="#FF80AB" animatedProps={blossom85Props} />
            <AnimatedCircle cx="75" cy="110" fill="#FF4081" animatedProps={blossom87Props} />
            <AnimatedCircle cx="125" cy="110" fill="#FF80AB" animatedProps={blossom87Props} />
            <AnimatedCircle cx="85" cy="70" fill="#F48FB1" animatedProps={blossom89Props} />
            <AnimatedCircle cx="115" cy="70" fill="#FF80AB" animatedProps={blossom89Props} />
          </G>
        )}

        {/* ELITE TREE (45+ mins) - Golden/Cherry Blossom Premium */}
        {treeType === 'elite' && (
          <G>
            {/* BOTTOM TIER - Deep rich blue */}
            <AnimatedG animatedProps={foliage70Props}>
              <Polygon points="45,180 100,95 100,180" fill="#0D47A1" />
              <Polygon points="100,95 155,180 100,180" fill="#1976D2" />
            </AnimatedG>

            {/* SECOND TIER - Blue-green gradient effect */}
            <AnimatedG animatedProps={foliage74Props}>
              <Polygon points="58,130 100,55 100,130" fill="#1565C0" />
              <Polygon points="100,55 142,130 100,130" fill="#42A5F5" />
            </AnimatedG>

            {/* THIRD TIER - Cyan tones */}
            <AnimatedG animatedProps={foliage78Props}>
              <Polygon points="70,85 100,25 100,85" fill="#0288D1" />
              <Polygon points="100,25 130,85 100,85" fill="#29B6F6" />
            </AnimatedG>

            {/* TOP PEAK - Light cyan/white */}
            <AnimatedG animatedProps={foliage82Props}>
              <Polygon points="82,50 100,10 118,50" fill="#81D4FA" />
            </AnimatedG>

            {/* GOLDEN BLOSSOMS - Elite feature */}
            <AnimatedCircle cx="60" cy="165" fill="#FFD700" animatedProps={eliteBlossom85Props} />
            <AnimatedCircle cx="140" cy="165" fill="#FFC107" animatedProps={eliteBlossom85Props} />
            <AnimatedCircle cx="70" cy="115" fill="#FFD700" animatedProps={eliteBlossom87Props} />
            <AnimatedCircle cx="130" cy="115" fill="#FFC107" animatedProps={eliteBlossom87Props} />
            <AnimatedCircle cx="80" cy="75" fill="#FFEB3B" animatedProps={eliteBlossom89Props} />
            <AnimatedCircle cx="120" cy="75" fill="#FFC107" animatedProps={eliteBlossom89Props} />
            <AnimatedCircle cx="95" cy="40" fill="#FFD700" animatedProps={blossom91Props} />
            <AnimatedCircle cx="105" cy="40" fill="#FFEB3B" animatedProps={blossom91Props} />
          </G>
        )}

        {/* Completion sparkle effect */}
        {progress >= 100 && (
          <AnimatedCircle
            cx="100"
            cy="95"
            fill="#D7F50A"
            animatedProps={sparkleProps}
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
