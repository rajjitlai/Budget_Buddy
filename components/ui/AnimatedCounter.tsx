import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const displayValueRef = useRef(value);

  const applyDisplay = useCallback((next: number) => {
    displayValueRef.current = next;
    setDisplayValue(next);
  }, []);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;

    if (diff === 0) {
      applyDisplay(endValue);
      return;
    }

    let animationFrameId: number;
    let lastUpdate = 0;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      if (progress >= 1) {
        applyDisplay(endValue);
        return;
      }

      if (timestamp - lastUpdate >= 50) {
        lastUpdate = timestamp;
        applyDisplay(Math.round(startValue + diff * easeProgress));
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration, applyDisplay]);

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
