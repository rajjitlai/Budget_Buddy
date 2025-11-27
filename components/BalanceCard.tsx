

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Wallet,
  CreditCard,
  Coins,
  PiggyBank,
  Landmark,
  Folder,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { Account, formatCurrency } from '@/lib/mockData';

interface BalanceCardProps {
  account: Account;
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
  const scale = useSharedValue(1);

  const IconComponent = iconMap[account.icon] || Wallet;

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.container,
        { backgroundColor: cardBackground },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${account.color}15` },
          ]}
        >
          <IconComponent size={20} color={account.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.accountName, { color: textPrimary }]}>
            {account.name}
          </Text>
          <Text style={[styles.accountType, { color: textSecondary }]}>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={[styles.balance, { color: textPrimary }]}>
        {formatCurrency(account.balance)}
      </Text>
      <View style={[styles.accentBar, { backgroundColor: account.color }]} />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.md,
    overflow: 'hidden',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  accountName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  accountType: {
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
  },
  balance: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});

