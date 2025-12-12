

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TrendingUp, Wallet, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { formatCurrency } from '@/lib/mockData';

interface NetWorthCardProps {
  totalBalance: number;
  changePercent?: number | null;
}

export function NetWorthCard({ totalBalance, changePercent = null }: NetWorthCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsVisible(!isVisible);
  };

  const getHiddenBalance = () => {
    // Show "Rs. ••••••" when hidden
    return 'Rs. ••••••';
  };

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
              <TouchableOpacity
                onPress={toggleVisibility}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isVisible ? (
                  <Eye size={20} color="rgba(255, 255, 255, 0.9)" />
                ) : (
                  <EyeOff size={20} color="rgba(255, 255, 255, 0.9)" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.balance}>
              {isVisible ? formatCurrency(totalBalance) : getHiddenBalance()}
            </Text>
            {typeof changePercent === 'number' && isVisible && (
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
    justifyContent: 'space-between',
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
    marginLeft: spacing.xs,
    flex: 1,
  },
  eyeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  balance: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    color: '#ffffff',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  changeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary[200],
    fontWeight: typography.fontWeights.medium,
    marginLeft: spacing.xs,
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


