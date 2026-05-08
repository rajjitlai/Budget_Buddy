

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Wallet, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { formatCurrency } from '@/lib/types';

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
    return 'Rs. ••••••';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradients.emerald as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <View style={styles.iconContainer}>
                <Wallet size={22} color="#ffffff" />
              </View>
              <Text style={styles.label}>Total Net Worth</Text>
            </View>
            <TouchableOpacity
              onPress={toggleVisibility}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isVisible ? (
                <Eye size={20} color="#ffffff" />
              ) : (
                <EyeOff size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.balance}>
            {isVisible ? formatCurrency(totalBalance) : getHiddenBalance()}
          </Text>
          
          {typeof changePercent === 'number' && isVisible && (
            <View style={styles.changeContainer}>
              <View style={styles.badge}>
                <TrendingUp size={14} color="#ffffff" />
                <Text style={styles.changeText}>
                  {changePercent >= 0 ? '+' : ''}
                  {changePercent}%
                </Text>
              </View>
              <Text style={styles.sinceText}>Since last month</Text>
            </View>
          )}
        </View>
        
        {/* Decorative mesh pattern elements */}
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
        <View style={[styles.decorativeCircle, styles.circle3]} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius['3xl'],
    ...shadows.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.xl,
    paddingVertical: spacing['2xl'],
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  eyeButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  changeText: {
    fontSize: typography.fontSizes.sm,
    color: '#ffffff',
    fontWeight: typography.fontWeights.bold,
  },
  sinceText: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: typography.fontWeights.medium,
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
  },
  circle1: {
    top: -50,
    right: -50,
    width: 180,
    height: 180,
  },
  circle2: {
    bottom: -40,
    left: -20,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle3: {
    top: 20,
    right: 40,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});



