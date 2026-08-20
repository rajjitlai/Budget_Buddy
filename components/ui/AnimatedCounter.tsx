import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { formatCurrency } from '@/lib/types';
import { typography } from '@/lib/theme';

export interface AnimatedCounterProps {
  value: number;
  currency?: string;
  duration?: number;
  style?: TextStyle | TextStyle[];
  formatter?: (val: number) => string;
}

export function AnimatedCounter({
  value,
  currency,
  duration = 800,
  style,
  formatter,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    const diff = endValue - startValue;

    if (diff === 0) {
      setDisplayValue(endValue);
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  const formattedText = formatter
    ? formatter(displayValue)
    : formatCurrency(displayValue, currency);

  return <Text style={[styles.text, style]}>{formattedText}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
  },
});
