import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line, G, Text as SvgText, Polygon } from 'react-native-svg';
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
  const { textPrimary, textSecondary } = useTheme();
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

  const padding = 40;
  const chartWidth = 300;
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

  // Create path for the line using Polyline format (x,y pairs)
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  // Create area polygon points (for gradient effect) - closed shape
  const areaPoints = [
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padding + innerHeight}`,
    `${points[0].x},${padding + innerHeight}`,
  ].join(' ');

  // Grid lines
  const gridLines = 5;
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

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
          <View style={styles.trendContainer}>
            {trend === 'up' && (
              <Text style={[styles.trendText, { color: colors.success }]}>
                ↑ +{trendPercentage}%
              </Text>
            )}
            {trend === 'down' && (
              <Text style={[styles.trendText, { color: colors.error }]}>
                ↓ -{trendPercentage}%
              </Text>
            )}
            {trend === 'neutral' && (
              <Text style={[styles.trendText, { color: textSecondary }]}>
                → 0%
              </Text>
            )}
          </View>
        </View>
      )}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {showGrid &&
            gridLineYPositions.map((y, index) => (
              <Line
                key={`grid-${index}`}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke={colors.slate[200]}
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.3}
              />
            ))}

          {/* Area fill (gradient effect) */}
          <Polygon
            points={areaPoints}
            fill={color}
            fillOpacity={0.1}
            stroke="none"
          />

          {/* Main line */}
          <Polyline
            points={linePoints}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {showDots &&
            points.map((point, index) => (
              <Circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r={5}
                fill={color}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}

          {/* X-axis labels */}
          {points.map((point, index) => {
            // Show every other label or first/last
            if (
              index === 0 ||
              index === points.length - 1 ||
              index % Math.ceil(points.length / 4) === 0
            ) {
              return (
                <SvgText
                  key={`label-${index}`}
                  x={point.x}
                  y={chartHeight - 10}
                  fontSize={10}
                  fill={textSecondary}
                  textAnchor="middle"
                >
                  {point.label}
                </SvgText>
              );
            }
            return null;
          })}
        </Svg>
      </View>

      {/* Value labels */}
      <View style={styles.valueContainer}>
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
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
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
    borderTopColor: colors.slate[200],
  },
  valueItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  valueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  valueLabel: {
    fontSize: typography.fontSizes.xs,
  },
  valueText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
});

