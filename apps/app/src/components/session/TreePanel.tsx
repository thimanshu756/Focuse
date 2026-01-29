/**
 * TreePanel Component
 * Container for tree visualization with gradient background and animations
 * Premium design with subtle glow effects
 */

import React, { useImperativeHandle, forwardRef, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { TreeAnimation } from './TreeAnimation';
import type { TreeType } from '@/types/session.types';
import { COLORS } from '@/constants/theme';

interface TreePanelProps {
  children?: ReactNode;
  backgroundGradient: { colors: string[]; locations?: number[] };
  progress?: number;
  treeType?: TreeType;
  orientation?: 'portrait' | 'landscape';
  isMobile?: boolean;
}

export interface TreePanelRef {
  pulse: () => void;
  glow: () => void;
  wither: () => void;
}

/**
 * Tree panel container with gradient background and tree animation
 * Exposes imperative methods for animations (pulse, glow, wither)
 */
export const TreePanel = forwardRef<TreePanelRef, TreePanelProps>(
  (
    {
      children,
      backgroundGradient,
      progress = 0,
      treeType = 'basic',
      orientation = 'portrait',
      isMobile = true,
    },
    ref
  ) => {
    // Shared values for animations
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);

    // Subtle breathing animation for ambient glow
    React.useEffect(() => {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, []);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      pulse: () => {
        scale.value = withSequence(
          withTiming(1.08, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
        );
      },
      glow: () => {
        scale.value = withSequence(
          withTiming(1.12, { duration: 400, easing: Easing.out(Easing.cubic) }),
          withTiming(1.05, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.08, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
        );
      },
      wither: () => {
        opacity.value = withTiming(0.3, {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(0.85, {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        });
      },
    }));

    // Animated style for tree container
    const treeAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    // Animated glow effect
    const glowStyle = useAnimatedStyle(() => ({
      opacity: interpolate(progress, [0, 50, 100], [0.2, 0.4, 0.6]) * glowOpacity.value,
    }));

    // Container dimensions based on orientation
    const containerStyle = isMobile
      ? orientation === 'landscape'
        ? styles.landscapeContainer
        : styles.portraitContainer
      : styles.desktopContainer;

    // Tree scale based on screen size and orientation
    const treeScale = isMobile
      ? orientation === 'landscape'
        ? 0.75
        : 0.85
      : 1.5;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Gradient Background */}
        <LinearGradient
          colors={backgroundGradient.colors}
          locations={backgroundGradient.locations}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Subtle overlay for depth */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.15)']}
          locations={[0.6, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Ambient glow behind tree */}
        <Animated.View style={[styles.glowContainer, glowStyle]}>
          <View style={styles.glowInner} />
        </Animated.View>

        {/* Ambient Animations Layer (behind tree) */}
        {children && (
          <View style={styles.ambientLayer} pointerEvents="none">
            {children}
          </View>
        )}

        {/* Tree Animation Layer - with padding to prevent clipping */}
        <View style={styles.treeLayer}>
          <Animated.View style={[styles.treeContainer, treeAnimatedStyle]}>
            <View style={{ transform: [{ scale: treeScale }], paddingVertical: 20 }}>
              <TreeAnimation progress={progress} treeType={treeType} />
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }
);

TreePanel.displayName = 'TreePanel';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  desktopContainer: {
    width: '40%',
    height: '100%',
  },
  portraitContainer: {
    width: '100%',
    flex: 1,
    paddingVertical: 10, // Extra padding to prevent tree clipping
  },
  landscapeContainer: {
    width: '50%',
    height: '100%',
    paddingVertical: 10,
  },
  glowContainer: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowInner: {
    width: '80%',
    height: '80%',
    borderRadius: 200,
    backgroundColor: COLORS.primary.accent,
    // Soft blur effect using shadow
    shadowColor: COLORS.primary.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
    elevation: 0,
  },
  ambientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  treeLayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
