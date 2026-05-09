

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  value?: string;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = colors.primary[500],
  label,
  value,
}: CircularProgressProps) {
  const { isDarkMode, textPrimary, textSecondary } = useTheme();
  
  const safePercentage = isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;
  const center = size / 2;
  const rotation = `rotate(-90, ${center}, ${center})`;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G transform={rotation}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={isDarkMode ? colors.slate[700] : colors.slate[200]}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={[styles.centerContent, { width: size, height: size }]}>
        {value && (
          <Text style={[styles.value, { color: textPrimary }]}>{value}</Text>
        )}
        {label && (
          <Text style={[styles.label, { color: textSecondary }]}>{label}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  label: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
});


