import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getHeatmapColor } from '@/utils/heatmap-helpers';
import { BORDER_RADIUS } from '@/constants/theme';

interface HeatmapCellProps {
  value: number; // Hours of focus
  maxValue: number; // For intensity calculation
  hour: string; // "9 AM"
  day: string; // "Mon"
}

export function HeatmapCell({ value, maxValue, hour, day }: HeatmapCellProps) {
  const intensity = maxValue > 0 ? value / maxValue : 0;
  const backgroundColor = getHeatmapColor(value, intensity);

  const handlePress = () => {
    if (value > 0) {
      const formattedHours = value.toFixed(1);
      Alert.alert(
        'Focus Time',
        `${hour} on ${day}\n${formattedHours}h focused`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.cell, { backgroundColor }]}
      onPress={handlePress}
      activeOpacity={value > 0 ? 0.7 : 1}
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 32,
    height: 24,
    borderRadius: BORDER_RADIUS.xs,
  },
});
