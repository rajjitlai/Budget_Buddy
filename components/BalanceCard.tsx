import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  CreditCard,
  Coins,
  PiggyBank,
  Landmark,
  Folder,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { Account } from '@/lib/types';
import { AnimatedScale } from './ui/AnimatedScale';
import { AnimatedCounter } from './ui/AnimatedCounter';

interface BalanceCardProps {
  account: Account;
  onPress?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Wallet,
  CreditCard,
  Coins,
  PiggyBank,
  Landmark,
  Folder,
};

export function BalanceCard({ account, onPress }: BalanceCardProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary } = useTheme();
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(true);

  const IconComponent = iconMap[account.icon] || Wallet;

  const toggleVisibility = (e: any) => {
    e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsVisible(!isVisible);
  };

  const getHiddenBalance = () => {
    const symbol = user?.currency || 'Rs.';
    return `${symbol} ••••••`;
  };

  const accountColor = account.color || colors.primary[500];

  return (
    <AnimatedScale
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: cardBackground,
          borderColor: isDarkMode ? `${accountColor}30` : `${accountColor}20`,
        },
      ]}
    >
      {/* Subtle top-corner gradient ambient glow */}
      <LinearGradient
        colors={[`${accountColor}15`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${accountColor}18`, borderColor: `${accountColor}35` },
          ]}
        >
          {iconMap[account.icon] ? (
            <IconComponent size={22} color={accountColor} />
          ) : (
            <Text style={{ fontSize: 20 }}>{account.icon || '🏦'}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={toggleVisibility}
          style={[styles.eyeButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          {isVisible ? (
            <Eye size={16} color={textSecondary} />
          ) : (
            <EyeOff size={16} color={textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.accountName, { color: textPrimary }]} numberOfLines={1}>
          {account.name}
        </Text>
        <Text style={[styles.accountType, { color: textSecondary }]}>
          {account.type}
        </Text>

        {isVisible ? (
          <AnimatedCounter
            value={account.balance}
            currency={user?.currency}
            style={[styles.balance, { color: textPrimary }]}
          />
        ) : (
          <Text style={[styles.balance, { color: textPrimary }]} numberOfLines={1}>
            {getHiddenBalance()}
          </Text>
        )}
      </View>

      <View style={[styles.accentBar, { backgroundColor: accountColor }]} />
    </AnimatedScale>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 205,
    height: 185,
    borderRadius: borderRadius['3xl'],
    padding: spacing.lg,
    marginRight: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  accountName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 2,
  },
  accountType: {
    fontSize: typography.fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: typography.fontWeights.semibold,
    opacity: 0.65,
    marginBottom: spacing.xs + 2,
  },
  balance: {
    fontSize: typography.fontSizes.xl + 1,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: -0.4,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    opacity: 0.85,
  },
});
