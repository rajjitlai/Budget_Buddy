import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line, G, Text as SvgText, Polygon, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { colors, borderRadius, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { formatCurrency } from '@/lib/types';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showDots?: boolean;
  title?: string;
}

export function LineChart({
  data,
  height = 200,
  color = colors.primary[500],
  showGrid = true,
  showDots = true,
  title,
}: LineChartProps) {
  const { isDarkMode, textPrimary, textSecondary, borderColor } = useTheme();
  const { user } = useUser();

  const displayCurrency = (amount: number) => formatCurrency(amount, user?.currency);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: textSecondary }]}>
          No data available
        </Text>
      </View>
    );
  }

  const padding = 36;
  const chartWidth = 310;
  const chartHeight = height;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  // Calculate points
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * innerWidth;
    const y =
      padding +
      innerHeight -
      ((point.value - minValue) / valueRange) * innerHeight;
    return { x, y, value: point.value, label: point.label };
  });

  // Create path for the line
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  // Create area polygon points with smooth bottom closing
  const areaPoints = [
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padding + innerHeight}`,
    `${points[0].x},${padding + innerHeight}`,
  ].join(' ');

  // Grid lines
  const gridLines = 4;
  const gridLineYPositions = Array.from({ length: gridLines }, (_, i) => {
    return padding + (i / (gridLines - 1)) * innerHeight;
  });

  // Determine trend
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'neutral';
  const trendPercentage =
    firstValue > 0
      ? Math.abs(((lastValue - firstValue) / firstValue) * 100).toFixed(1)
      : '0';

  const gradientId = `area-gradient-${Math.random().toString(36).substring(2, 8)}`;

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
          <View style={styles.trendContainer}>
            {trend === 'up' && (
              <View style={[styles.trendBadge, { backgroundColor: `${colors.success}18` }]}>
                <Text style={[styles.trendText, { color: colors.success }]}>
                  ↑ +{trendPercentage}%
                </Text>
              </View>
            )}
            {trend === 'down' && (
              <View style={[styles.trendBadge, { backgroundColor: `${colors.error}18` }]}>
                <Text style={[styles.trendText, { color: colors.error }]}>
                  ↓ -{trendPercentage}%
                </Text>
              </View>
            )}
            {trend === 'neutral' && (
              <View style={[styles.trendBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.trendText, { color: textSecondary }]}>
                  → 0%
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <SvgGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <Stop offset="80%" stopColor={color} stopOpacity="0.05" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </SvgGradient>
          </Defs>

          {/* Grid lines */}
          {showGrid &&
            gridLineYPositions.map((y, index) => (
              <Line
                key={`grid-${index}`}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            ))}

          {/* Glowing Area Fill */}
          <Polygon
            points={areaPoints}
            fill={`url(#${gradientId})`}
            stroke="none"
          />

          {/* Main Line with Stroke Glow */}
          <Polyline
            points={linePoints}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {showDots &&
            points.map((point, index) => (
              <G key={`point-${index}`}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill={color}
                  stroke={isDarkMode ? '#0F172A' : '#FFFFFF'}
                  strokeWidth={2}
                />
              </G>
            ))}

          {/* X-axis labels */}
          {points.map((point, index) => {
            if (
              index === 0 ||
              index === points.length - 1 ||
              index % Math.ceil(points.length / 4) === 0
            ) {
              return (
                <SvgText
                  key={`label-${index}`}
                  x={point.x}
                  y={chartHeight - 8}
                  fontSize={10}
                  fill={textSecondary}
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {point.label}
                </SvgText>
              );
            }
            return null;
          })}
        </Svg>
      </View>

      {/* Value Labels Summary */}
      <View style={[styles.valueContainer, { borderTopColor: borderColor }]}>
        <View style={styles.valueItem}>
          <View style={[styles.valueDot, { backgroundColor: color }]} />
          <Text style={[styles.valueLabel, { color: textSecondary }]}>Start</Text>
          <Text style={[styles.valueText, { color: textPrimary }]}>
            {displayCurrency(firstValue)}
          </Text>
        </View>
        <View style={styles.valueItem}>
          <View style={[styles.valueDot, { backgroundColor: color }]} />
          <Text style={[styles.valueLabel, { color: textSecondary }]}>Current</Text>
          <Text style={[styles.valueText, { color: textPrimary }]}>
            {displayCurrency(lastValue)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.md + 1,
    fontWeight: typography.fontWeights.bold,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  trendText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  valueItem: {
    alignItems: 'center',
    gap: 2,
  },
  valueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  valueLabel: {
    fontSize: typography.fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
});
