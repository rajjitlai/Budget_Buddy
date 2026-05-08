

import React, { useState } from 'react';
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
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { Account, formatCurrency } from '@/lib/types';

interface BalanceCardProps {
  account: Account;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

export function BalanceCard({ account, onPress, onEdit, onDelete }: BalanceCardProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary } = useTheme();
  const scale = useSharedValue(1);
  const [isVisible, setIsVisible] = useState(false);

  const IconComponent = iconMap[account.icon] || Wallet;

  const toggleVisibility = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsVisible(!isVisible);
  };

  const getHiddenBalance = () => {
    return 'Rs. ••••••';
  };

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

  const handleEdit = (e: any) => {
    e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onEdit?.();
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete?.();
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
        <TouchableOpacity
          onPress={toggleVisibility}
          style={styles.eyeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isVisible ? (
            <Eye size={18} color={textSecondary} />
          ) : (
            <EyeOff size={18} color={textSecondary} />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.balanceRow}>
        <Text style={[styles.balance, { color: textPrimary }]}>
          {isVisible ? formatCurrency(account.balance) : getHiddenBalance()}
        </Text>
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                onPress={handleEdit}
                style={[styles.actionButton, { backgroundColor: `${colors.primary[500]}15` }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Edit size={16} color={colors.primary[500]} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.actionButton, { backgroundColor: `${colors.error}15` }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
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
    justifyContent: 'space-between',
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
    marginRight: spacing.sm,
  },
  eyeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
  accountName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  accountType: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balance: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});

