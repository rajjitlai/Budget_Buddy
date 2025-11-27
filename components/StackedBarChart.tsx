

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { colors, borderRadius, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface BarSegment {
  value: number;
  color: string;
  label: string;
}

interface StackedBarChartProps {
  segments: BarSegment[];
  height?: number;
  showLegend?: boolean;
}

export function StackedBarChart({
  segments,
  height = 24,
  showLegend = true,
}: StackedBarChartProps) {
  const { isDarkMode, textPrimary, textSecondary, cardBackground } = useTheme();
  
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  
  let currentX = 0;
  const barSegments = segments.map((segment, index) => {
    const width = (segment.value / total) * 100;
    const x = currentX;
    currentX += width;
    
    return {
      ...segment,
      x,
      width,
      isFirst: index === 0,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.barContainer,
          {
            height,
            backgroundColor: isDarkMode ? colors.slate[700] : colors.slate[200],
          },
        ]}
      >
        {barSegments.map((segment, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              {
                width: `${segment.width}%`,
                backgroundColor: segment.color,
                borderTopLeftRadius: segment.isFirst ? borderRadius.full : 0,
                borderBottomLeftRadius: segment.isFirst ? borderRadius.full : 0,
                borderTopRightRadius: segment.isLast ? borderRadius.full : 0,
                borderBottomRightRadius: segment.isLast ? borderRadius.full : 0,
              },
            ]}
          />
        ))}
      </View>
      
      {showLegend && (
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <View key={index} sty
le={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: segment.color }]}
              />
              <Text style={[styles.legendLabel, { color: textSecondary }]}>
                {segment.label}
              </Text>
              <Text style={[styles.legendValue, { color: textPrimary }]}>
                {Math.round((segment.value / total) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  legend: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendLabel: {
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  legendValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
});


