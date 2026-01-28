/**
 * TreeAnimation Component
 * SVG tree that grows with session progress
 * Matches the web version design with triangular foliage
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Ellipse, Line, Path, Circle, Polygon, G } from 'react-native-svg';
import type { TreeType } from '@/types/session.types';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TreeAnimationProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Tree complexity tier */
  treeType: TreeType;
}

export function TreeAnimation({ progress, treeType }: TreeAnimationProps) {
  // Shared values for animations
  const animatedProgress = useSharedValue(0);

  // Update progress with smooth animation
  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  // Ground/Soil base animated props
  const groundAnimatedProps = useAnimatedProps(() => {
    const scale = interpolate(
      animatedProgress.value,
      [0, 5],
      [0, 1],
      'clamp'
    );
    const opacity = interpolate(
      animatedProgress.value,
      [0, 5],
      [0, 1],
      'clamp'
    );
    return { opacity, transform: [{ scale }] };
  });

  const darkSoilAnimatedProps = useAnimatedProps(() => {
    const scale = interpolate(
      animatedProgress.value,
      [0, 5],
      [0, 1],
      'clamp'
    );
    const opacity = interpolate(
      animatedProgress.value,
      [0, 5],
      [0, 0.8],
      'clamp'
    );
    return { opacity, transform: [{ scale }] };
  });

  // Grass blades animated props
  const createGrassProps = (startProgress: number) =>
    useAnimatedProps(() => {
      const pathLength = interpolate(
        animatedProgress.value,
        [startProgress, startProgress + 5],
        [0, 1],
        'clamp'
      );
      const opacity = interpolate(
        animatedProgress.value,
        [startProgress, startProgress + 3],
        [0, 1],
        'clamp'
      );
      return { strokeDashoffset: 1 - pathLength, opacity };
    });

  // Seed animated props
  const seedAnimatedProps = useAnimatedProps(() => {
    const scale = interpolate(
      animatedProgress.value,
      [5, 10],
      [0, 1],
      'clamp'
    );
    return { transform: [{ scale }] };
  });

  // Trunk animated props
  const trunkAnimatedProps = useAnimatedProps(() => {
    const pathLength = interpolate(
      animatedProgress.value,
      [15, 50],
      [0, 1],
      'clamp'
    );
    return { strokeDashoffset: 1 - pathLength };
  });

  // Foliage tiers animated props
  const createFoliageProps = (startProgress: number) =>
    useAnimatedProps(() => {
      const scale = interpolate(
        animatedProgress.value,
        [startProgress, startProgress + 3],
        [0, 1],
        'clamp'
      );
      const opacity = interpolate(
        animatedProgress.value,
        [startProgress, startProgress + 2],
        [0, 1],
        'clamp'
      );
      return { opacity, transform: [{ scale }] };
    });

  // Blossoms animated props (premium/elite)
  const createBlossomProps = (startProgress: number) =>
    useAnimatedProps(() => {
      const scale = interpolate(
        animatedProgress.value,
        [startProgress, startProgress + 3],
        [0, 1],
        'clamp'
      );
      return { transform: [{ scale }] };
    });

  // Completion sparkle animated props
  const sparkleAnimatedProps = useAnimatedProps(() => {
    if (progress < 100) return { opacity: 0, transform: [{ scale: 0 }] };

    // Infinite pulsing animation
    return {
      opacity: 1,
      transform: [{ scale: 1 }],
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={320} height={280} viewBox="0 0 200 300">
        {/* Ground/Soil base */}
        <AnimatedEllipse
          cx="100"
          cy="275"
          rx="45"
          ry="12"
          fill="#8B7355"
          animatedProps={groundAnimatedProps}
        />

        {/* Darker soil layer */}
        <AnimatedEllipse
          cx="100"
          cy="273"
          rx="38"
          ry="8"
          fill="#6B5344"
          animatedProps={darkSoilAnimatedProps}
        />

        {/* Grass blades - left side */}
        <AnimatedPath
          d="M 65 275 Q 63 268 61 265"
          stroke="#7CB342"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="1"
          animatedProps={createGrassProps(3)}
        />
        <AnimatedPath
          d="M 70 276 Q 69 270 68 266"
          stroke="#8BC34A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="1"
          animatedProps={createGrassProps(3)}
        />
        <AnimatedPath
          d="M 75 277 Q 73 271 71 267"
          stroke="#9CCC65"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="1"
          animatedProps={createGrassProps(3)}
        />

        {/* Grass blades - right side */}
        <AnimatedPath
          d="M 125 277 Q 127 271 129 267"
          stroke="#9CCC65"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="1"
          animatedProps={createGrassProps(3)}
        />
        <AnimatedPath
          d="M 130 276 Q 131 270 132 266"
          stroke="#8BC34A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="1"
          animatedProps={createGrassProps(3)}
        />
        <AnimatedPath
          d="M 135 275 Q 137 268 139 265"
          stroke="#7CB342"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="1"
          animatedProps={createGrassProps(3)}
        />

        {/* Seed */}
        <AnimatedEllipse
          cx="100"
          cy="274"
          rx="6"
          ry="8"
          fill="#6B5344"
          animatedProps={seedAnimatedProps}
        />

        {/* Main trunk */}
        <AnimatedLine
          x1="100"
          y1="270"
          x2="100"
          y2="120"
          stroke="#A0826D"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="1"
          animatedProps={trunkAnimatedProps}
        />

        {/* BASIC TREE (0-15 mins) - Simple green triangles */}
        {treeType === 'basic' && (
          <G>
            {/* BOTTOM TIER */}
            <AnimatedPolygon
              points="45,180 100,95 100,180"
              fill="#2E7D32"
              origin="75,137.5"
              animatedProps={createFoliageProps(70)}
            />
            <AnimatedPolygon
              points="100,95 155,180 100,180"
              fill="#66BB6A"
              origin="127.5,137.5"
              animatedProps={createFoliageProps(70)}
            />

            {/* SECOND TIER */}
            <AnimatedPolygon
              points="58,130 100,55 100,130"
              fill="#388E3C"
              origin="79,92.5"
              animatedProps={createFoliageProps(74)}
            />
            <AnimatedPolygon
              points="100,55 142,130 100,130"
              fill="#81C784"
              origin="121,92.5"
              animatedProps={createFoliageProps(74)}
            />

            {/* THIRD TIER */}
            <AnimatedPolygon
              points="70,85 100,25 100,85"
              fill="#43A047"
              origin="85,55"
              animatedProps={createFoliageProps(78)}
            />
            <AnimatedPolygon
              points="100,25 130,85 100,85"
              fill="#9CCC65"
              origin="115,55"
              animatedProps={createFoliageProps(78)}
            />

            {/* TOP PEAK */}
            <AnimatedPolygon
              points="82,50 100,10 118,50"
              fill="#AED581"
              origin="100,30"
              animatedProps={createFoliageProps(82)}
            />
          </G>
        )}

        {/* PREMIUM TREE (15-45 mins) - Vibrant with pink blossoms */}
        {treeType === 'premium' && (
          <G>
            {/* BOTTOM TIER - Richer greens */}
            <AnimatedPolygon
              points="45,180 100,95 100,180"
              fill="#1B5E20"
              origin="75,137.5"
              animatedProps={createFoliageProps(70)}
            />
            <AnimatedPolygon
              points="100,95 155,180 100,180"
              fill="#4CAF50"
              origin="127.5,137.5"
              animatedProps={createFoliageProps(70)}
            />

            {/* SECOND TIER - Vibrant */}
            <AnimatedPolygon
              points="58,130 100,55 100,130"
              fill="#2E7D32"
              origin="79,92.5"
              animatedProps={createFoliageProps(74)}
            />
            <AnimatedPolygon
              points="100,55 142,130 100,130"
              fill="#66BB6A"
              origin="121,92.5"
              animatedProps={createFoliageProps(74)}
            />

            {/* THIRD TIER - Bright */}
            <AnimatedPolygon
              points="70,85 100,25 100,85"
              fill="#388E3C"
              origin="85,55"
              animatedProps={createFoliageProps(78)}
            />
            <AnimatedPolygon
              points="100,25 130,85 100,85"
              fill="#81C784"
              origin="115,55"
              animatedProps={createFoliageProps(78)}
            />

            {/* TOP PEAK - Light green */}
            <AnimatedPolygon
              points="82,50 100,10 118,50"
              fill="#9CCC65"
              origin="100,30"
              animatedProps={createFoliageProps(82)}
            />

            {/* PINK BLOSSOMS - Premium feature */}
            <AnimatedCircle
              cx="65"
              cy="160"
              r="6"
              fill="#FF4081"
              origin="65,160"
              animatedProps={createBlossomProps(85)}
            />
            <AnimatedCircle
              cx="135"
              cy="160"
              r="6"
              fill="#FF80AB"
              origin="135,160"
              animatedProps={createBlossomProps(85)}
            />
            <AnimatedCircle
              cx="75"
              cy="110"
              r="5"
              fill="#FF4081"
              origin="75,110"
              animatedProps={createBlossomProps(87)}
            />
            <AnimatedCircle
              cx="125"
              cy="110"
              r="5"
              fill="#FF80AB"
              origin="125,110"
              animatedProps={createBlossomProps(87)}
            />
            <AnimatedCircle
              cx="85"
              cy="70"
              r="4"
              fill="#F48FB1"
              origin="85,70"
              animatedProps={createBlossomProps(89)}
            />
            <AnimatedCircle
              cx="115"
              cy="70"
              r="4"
              fill="#FF80AB"
              origin="115,70"
              animatedProps={createBlossomProps(89)}
            />
          </G>
        )}

        {/* ELITE TREE (45+ mins) - Golden/Cherry Blossom Premium */}
        {treeType === 'elite' && (
          <G>
            {/* BOTTOM TIER - Deep rich blue */}
            <AnimatedPolygon
              points="45,180 100,95 100,180"
              fill="#0D47A1"
              origin="75,137.5"
              animatedProps={createFoliageProps(70)}
            />
            <AnimatedPolygon
              points="100,95 155,180 100,180"
              fill="#1976D2"
              origin="127.5,137.5"
              animatedProps={createFoliageProps(70)}
            />

            {/* SECOND TIER - Blue-green gradient effect */}
            <AnimatedPolygon
              points="58,130 100,55 100,130"
              fill="#1565C0"
              origin="79,92.5"
              animatedProps={createFoliageProps(74)}
            />
            <AnimatedPolygon
              points="100,55 142,130 100,130"
              fill="#42A5F5"
              origin="121,92.5"
              animatedProps={createFoliageProps(74)}
            />

            {/* THIRD TIER - Cyan tones */}
            <AnimatedPolygon
              points="70,85 100,25 100,85"
              fill="#0288D1"
              origin="85,55"
              animatedProps={createFoliageProps(78)}
            />
            <AnimatedPolygon
              points="100,25 130,85 100,85"
              fill="#29B6F6"
              origin="115,55"
              animatedProps={createFoliageProps(78)}
            />

            {/* TOP PEAK - Light cyan/white */}
            <AnimatedPolygon
              points="82,50 100,10 118,50"
              fill="#81D4FA"
              origin="100,30"
              animatedProps={createFoliageProps(82)}
            />

            {/* GOLDEN BLOSSOMS - Elite feature */}
            <AnimatedCircle
              cx="60"
              cy="165"
              r="7"
              fill="#FFD700"
              origin="60,165"
              animatedProps={createBlossomProps(85)}
            />
            <AnimatedCircle
              cx="140"
              cy="165"
              r="7"
              fill="#FFC107"
              origin="140,165"
              animatedProps={createBlossomProps(85)}
            />
            <AnimatedCircle
              cx="70"
              cy="115"
              r="6"
              fill="#FFD700"
              origin="70,115"
              animatedProps={createBlossomProps(87)}
            />
            <AnimatedCircle
              cx="130"
              cy="115"
              r="6"
              fill="#FFC107"
              origin="130,115"
              animatedProps={createBlossomProps(87)}
            />
            <AnimatedCircle
              cx="80"
              cy="75"
              r="5"
              fill="#FFEB3B"
              origin="80,75"
              animatedProps={createBlossomProps(89)}
            />
            <AnimatedCircle
              cx="120"
              cy="75"
              r="5"
              fill="#FFC107"
              origin="120,75"
              animatedProps={createBlossomProps(89)}
            />
            <AnimatedCircle
              cx="95"
              cy="40"
              r="4"
              fill="#FFD700"
              origin="95,40"
              animatedProps={createBlossomProps(91)}
            />
            <AnimatedCircle
              cx="105"
              cy="40"
              r="4"
              fill="#FFEB3B"
              origin="105,40"
              animatedProps={createBlossomProps(91)}
            />
          </G>
        )}

        {/* Completion sparkle effect */}
        {progress === 100 && (
          <G>
            {/* Center sparkle */}
            <AnimatedCircle
              cx="100"
              cy="95"
              r="6"
              fill="#D7F50A"
              animatedProps={sparkleAnimatedProps}
            />
          </G>
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
