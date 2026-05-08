import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
import { Account, formatCurrency } from '@/lib/types';
import { AnimatedScale } from './ui/AnimatedScale';

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
    return 'Rs. ••••••';
  };

  return (
    <AnimatedScale
      onPress={onPress}
      style={[
        styles.container,
        { 
          backgroundColor: cardBackground,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.04)',
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${account.color}15`, borderColor: `${account.color}25` },
          ]}
        >
          {iconMap[account.icon] ? (
            <IconComponent size={24} color={account.color} />
          ) : (
            <Text style={{ fontSize: 22 }}>{account.icon || '🏦'}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={toggleVisibility}
          style={styles.eyeButton}
        >
          {isVisible ? (
            <Eye size={18} color={textSecondary} />
          ) : (
            <EyeOff size={18} color={textSecondary} />
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
        
        <Text style={[styles.balance, { color: textPrimary }]} numberOfLines={1}>
          {isVisible ? formatCurrency(account.balance, user?.currency) : getHiddenBalance()}
        </Text>
      </View>
      
      <View style={[styles.accentBar, { backgroundColor: account.color }]} />
    </AnimatedScale>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 180,
    borderRadius: borderRadius['3xl'],
    padding: spacing.lg,
    marginRight: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  eyeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
  },
  content: {
    flex: 1,
  },
  accountName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 2,
  },
  accountType: {
    fontSize: typography.fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: typography.fontWeights.semibold,
    opacity: 0.6,
    marginBottom: spacing.sm,
  },
  balance: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: -0.5,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    opacity: 0.8,
  },
});
