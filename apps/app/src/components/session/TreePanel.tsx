/**
 * TreePanel Component
 * Container for tree visualization with gradient background and animations
 */

import React, { useState, useImperativeHandle, forwardRef, ReactNode } from 'react';
import { View, StyleSheet, useWindowDimensions, Text } from 'react-native';
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
  isWithering?: boolean;
  isCelebrating?: boolean;
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
      isWithering = false,
      isCelebrating = false,
      orientation = 'portrait',
      isMobile = true,
    },
    ref
  ) => {
    const { width, height } = useWindowDimensions();
    const [pulseKey, setPulseKey] = useState(0);
    const [glowKey, setGlowKey] = useState(0);
    const [witherKey, setWitherKey] = useState(0);

    // Shared values for animations
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const brightness = useSharedValue(1);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      pulse: () => {
        // Scale pulse animation for milestones
        scale.value = withSequence(
          withTiming(1.1, { duration: 250, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) })
        );
        setPulseKey((prev) => prev + 1);
      },
      glow: () => {
        // Glow animation for completion (brightness increase)
        brightness.value = withSequence(
          withTiming(1.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        );
        setGlowKey((prev) => prev + 1);
      },
      wither: () => {
        // Wither animation for give up (fade and darken)
        opacity.value = withTiming(0.5, {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        });
        brightness.value = withTiming(0.3, {
          duration: 1000,
          easing: Easing.out(Easing.cubic),
        });
        setWitherKey((prev) => prev + 1);
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
        <Text style={{ color: 'white' }}>TimerPanel</Text>
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
