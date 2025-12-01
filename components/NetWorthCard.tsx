

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Wallet } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { formatCurrency } from '@/lib/mockData';

interface NetWorthCardProps {
  totalBalance: number;
  changePercent?: number | null;
}

export function NetWorthCard({ totalBalance, changePercent = null }: NetWorthCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.gradientContainer}>
        <View style={[styles.gradient, { backgroundColor: colors.primary[600] }]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Wallet size={24} color="#ffffff" />
              </View>
              <Text style={styles.label}>Total Net Worth</Text>
            </View>
            <Text style={styles.balance}>{formatCurrency(totalBalance)}</Text>
            {typeof changePercent === 'number' && (
              <View style={styles.changeContainer}>
                <TrendingUp size={16} color={colors.primary[200]} />
                <Text style={styles.changeText}>
                  {changePercent >= 0 ? '+' : ''}
                  {changePercent}% from last month
                </Text>
              </View>
            )}
          </View>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradientContainer: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  balance: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    color: '#ffffff',
    marginBottom: spacing.md,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary[200],
    fontWeight: typography.fontWeights.medium,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});


