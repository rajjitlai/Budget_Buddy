import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency } from '@/lib/types';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface MilestoneBannerProps {
  savingsRate: number;
  surplus: number;
  currency?: string;
  onPress?: () => void;
}

export function MilestoneBanner({
  savingsRate,
  surplus,
  currency,
  onPress,
}: MilestoneBannerProps) {
  const { isDarkMode } = useTheme();

  if (savingsRate < 20 && surplus <= 0) {
    return null;
  }

  const isExcellent = savingsRate >= 30;
  const isHealthy = savingsRate >= 20;

  const gradientColors = isExcellent
    ? ['#065F46', '#059669', '#10B981']
    : isHealthy
    ? ['#0F766E', '#0D9488', '#14B8A6']
    : ['#1E293B', '#334155', '#475569'];

  const title = isExcellent
    ? 'Elite Savings Rate!'
    : isHealthy
    ? 'Target Savings Achieved'
    : 'Positive Monthly Cash Flow';

  const subtitle = isExcellent
    ? `You're saving ${savingsRate}% of income (${formatCurrency(surplus, currency)} surplus). Outstanding wealth velocity!`
    : isHealthy
    ? `Saving ${savingsRate}% (${formatCurrency(surplus, currency)} surplus), beating the 20% benchmark.`
    : `Surplus of ${formatCurrency(surplus, currency)} available this month.`;

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        disabled={!onPress}
      >
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.left}>
            <View style={styles.iconRing}>
              {isHealthy ? (
                <ShieldCheck size={20} color="#ffffff" />
              ) : (
                <TrendingUp size={20} color="#ffffff" />
              )}
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateBadgeText}>{savingsRate}%</Text>
                </View>
              </View>
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            </View>
          </View>
          {onPress && (
            <View style={styles.arrowContainer}>
              <ArrowRight size={18} color="rgba(255, 255, 255, 0.85)" />
            </View>
          )}

          {/* Subtle ambient circle */}
          <View style={styles.ambientCircle} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...shadows.md,
  },
  gradient: {
    padding: spacing.md,
    paddingVertical: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconRing: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: '#ffffff',
  },
  rateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  rateBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 16,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
