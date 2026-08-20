import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency } from '@/lib/types';
import { getCategoryColor } from '@/lib/utils/categorizer';

export interface PieChartItem {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface PieChartProps {
  data: PieChartItem[];
  size?: number;
  donut?: boolean;
  currency?: string;
  centerTitle?: string;
  showLegend?: boolean;
  onSelectCategory?: (item: PieChartItem) => void;
}

interface SliceData {
  item: PieChartItem;
  path: string;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

export function PieChart({
  data,
  size = 200,
  donut = true,
  currency,
  centerTitle,
  showLegend = true,
  onSelectCategory,
}: PieChartProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary, borderColor } = useTheme();
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  const radius = size / 2;
  const innerRadius = donut ? radius * 0.62 : 0;
  const total = data.reduce((sum, item) => sum + (item.value > 0 ? item.value : 0), 0);

  // If total is 0 or data is empty, render empty state
  if (total === 0 || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius - 8}
            fill="none"
            stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
            strokeWidth={donut ? 18 : 2}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFillObject, styles.centerTextContainer]}>
          <Text style={[styles.emptyText, { color: textSecondary }]}>No spending data</Text>
        </View>
      </View>
    );
  }

  // Calculate slices with angles and SVG path definitions
  let currentAngle = -Math.PI / 2; // Start from 12 o'clock
  const slices: SliceData[] = data
    .filter((d) => d.value > 0)
    .map((item) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * (Math.PI * 2);
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const color = item.color || getCategoryColor(item.label);

      // SVG Arc Path coordinates
      const isSelected = selectedSlice === item.label;
      const effectiveRadius = isSelected ? radius : radius - 4;
      const effectiveInnerRadius = innerRadius > 0 ? (isSelected ? innerRadius - 2 : innerRadius) : 0;

      const x1 = radius + effectiveRadius * Math.cos(startAngle);
      const y1 = radius + effectiveRadius * Math.sin(startAngle);
      const x2 = radius + effectiveRadius * Math.cos(endAngle);
      const y2 = radius + effectiveRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      let path: string;
      if (donut && effectiveInnerRadius > 0) {
        const ix1 = radius + effectiveInnerRadius * Math.cos(endAngle);
        const iy1 = radius + effectiveInnerRadius * Math.sin(endAngle);
        const ix2 = radius + effectiveInnerRadius * Math.cos(startAngle);
        const iy2 = radius + effectiveInnerRadius * Math.sin(startAngle);

        path = [
          `M ${x1} ${y1}`,
          `A ${effectiveRadius} ${effectiveRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${ix1} ${iy1}`,
          `A ${effectiveInnerRadius} ${effectiveInnerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
          'Z',
        ].join(' ');
      } else {
        path = [
          `M ${radius} ${radius}`,
          `L ${x1} ${y1}`,
          `A ${effectiveRadius} ${effectiveRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');
      }

      return {
        item: { ...item, percentage },
        path,
        percentage,
        color,
        startAngle,
        endAngle,
      };
    });

  const activeItem = data.find((d) => d.label === selectedSlice) || null;

  const handleSlicePress = (label: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newSelection = selectedSlice === label ? null : label;
    setSelectedSlice(newSelection);
    const item = data.find((d) => d.label === label);
    if (item && onSelectCategory) {
      onSelectCategory(item);
    }
  };

  return (
    <View style={styles.container}>
      {/* Chart Center Area */}
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size}>
          <G>
            {slices.map((slice) => (
              <Path
                key={slice.item.label}
                d={slice.path}
                fill={slice.color}
                opacity={selectedSlice === null || selectedSlice === slice.item.label ? 1 : 0.4}
                onPress={() => handleSlicePress(slice.item.label)}
              />
            ))}
          </G>
        </Svg>

        {/* Center Donut Label */}
        {donut && (
          <View style={[StyleSheet.absoluteFillObject, styles.centerTextContainer]} pointerEvents="none">
            <Text style={[styles.centerSub, { color: textSecondary }]}>
              {activeItem ? activeItem.label : (centerTitle || 'Total')}
            </Text>
            <Text style={[styles.centerVal, { color: textPrimary }]}>
              {formatCurrency(activeItem ? activeItem.value : total, currency)}
            </Text>
            {activeItem && (
              <Text style={[styles.centerPct, { color: activeItem.color || getCategoryColor(activeItem.label) }]}>
                {((activeItem.value / total) * 100).toFixed(1)}%
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Dynamic Category Legend */}
      {showLegend && (
        <View style={styles.legendContainer}>
          {slices.map((slice) => {
            const isSelected = selectedSlice === slice.item.label;
            return (
              <TouchableOpacity
                key={slice.item.label}
                onPress={() => handleSlicePress(slice.item.label)}
                activeOpacity={0.7}
                style={[
                  styles.legendItem,
                  {
                    backgroundColor: isSelected ? `${slice.color}18` : 'transparent',
                    borderColor: isSelected ? slice.color : borderColor,
                  },
                ]}
              >
                <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                <Text style={[styles.legendLabel, { color: textPrimary }]} numberOfLines={1}>
                  {slice.item.label}
                </Text>
                <Text style={[styles.legendPct, { color: textSecondary }]}>
                  {slice.percentage.toFixed(1)}%
                </Text>
                <Text style={[styles.legendAmount, { color: textPrimary }]}>
                  {formatCurrency(slice.item.value, currency)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: spacing.sm,
  },
  centerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  centerSub: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerVal: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
  },
  centerPct: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
  },
  legendContainer: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  legendPct: {
    fontSize: typography.fontSizes.xs,
    marginRight: spacing.md,
  },
  legendAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
});
