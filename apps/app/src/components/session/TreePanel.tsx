/**
 * TreePanel Component
 * Container for tree visualization with gradient background and animations
 */

import React, { useImperativeHandle, forwardRef, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { TreeAnimation } from './TreeAnimation';
import type { TreeType } from '@/types/session.types';

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

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      pulse: () => {
        // Scale pulse animation for milestones
        scale.value = withSequence(
          withTiming(1.1, { duration: 250, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) })
        );
      },
      glow: () => {
        // Glow animation for completion (scale bounce)
        scale.value = withSequence(
          withTiming(1.15, { duration: 400, easing: Easing.out(Easing.cubic) }),
          withTiming(1.05, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.1, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
        );
      },
      wither: () => {
        // Wither animation for give up (fade out)
        opacity.value = withTiming(0.3, {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(0.9, {
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

    // Container dimensions based on orientation
    const containerStyle = isMobile
      ? orientation === 'landscape'
        ? styles.landscapeContainer
        : styles.portraitContainer
      : styles.desktopContainer;

    // Tree scale based on screen size and orientation
    const treeScale = isMobile
      ? orientation === 'landscape'
        ? 0.9
        : 0.95
      : 1.5;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Gradient Background */}
        <LinearGradient
          colors={backgroundGradient.colors}
          locations={backgroundGradient.locations}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Ambient Animations Layer (behind tree) */}
        {children && (
          <View style={styles.ambientLayer} pointerEvents="none">
            {children}
          </View>
        )}

        {/* Tree Animation Layer */}
        <View style={styles.treeLayer}>
          <Animated.View style={[styles.treeContainer, treeAnimatedStyle]}>
            <View style={{ transform: [{ scale: treeScale }] }}>
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
  },
  landscapeContainer: {
    width: '50%',
    height: '100%',
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
