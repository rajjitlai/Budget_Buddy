import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Wallet, Eye, EyeOff, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useUser } from '@/lib/UserContext';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface NetWorthCardProps {
  totalBalance: number;
  changePercent?: number | null;
}

export function NetWorthCard({ totalBalance, changePercent = null }: NetWorthCardProps) {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsVisible(!isVisible);
  };

  const getHiddenBalance = () => {
    const symbol = user?.currency || 'Rs.';
    return `${symbol} ••••••`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F766E', '#14B8A6', '#0D9488']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <View style={styles.iconContainer}>
                <Wallet size={20} color="#ffffff" />
              </View>
              <Text style={styles.label}>Total Net Worth</Text>
            </View>
            <TouchableOpacity
              onPress={toggleVisibility}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              {isVisible ? (
                <Eye size={18} color="#ffffff" />
              ) : (
                <EyeOff size={18} color="rgba(255, 255, 255, 0.7)" />
              )}
            </TouchableOpacity>
          </View>

          {isVisible ? (
            <AnimatedCounter
              value={totalBalance}
              currency={user?.currency}
              style={styles.balance}
            />
          ) : (
            <Text style={styles.balance}>{getHiddenBalance()}</Text>
          )}

          {typeof changePercent === 'number' && isVisible && (
            <View style={styles.changeContainer}>
              <View style={styles.badge}>
                <TrendingUp size={13} color="#ffffff" />
                <Text style={styles.changeText}>
                  {changePercent >= 0 ? '+' : ''}
                  {changePercent}%
                </Text>
              </View>
              <Text style={styles.sinceText}>Since last month</Text>
            </View>
          )}
        </View>

        {/* Ambient radial mesh decorations */}
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    width: 36,
    height: 36,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.medium,
    color: 'rgba(255, 255, 255, 0.92)',
    letterSpacing: 0.3,
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    color: '#ffffff',
    letterSpacing: -0.6,
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
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  changeText: {
    fontSize: typography.fontSizes.xs + 1,
    color: '#ffffff',
    fontWeight: typography.fontWeights.bold,
  },
  sinceText: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.82)',
    fontWeight: typography.fontWeights.medium,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    top: -60,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    bottom: -50,
    left: -30,
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle3: {
    top: 30,
    right: 60,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
