import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Edit,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { formatCurrency, Transaction, Account } from '@/lib/types';
import { getCategoryColor } from '@/lib/utils/categorizer';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface TransactionItemProps {
  transaction: Transaction;
  sourceAccount?: Account;
  destinationAccount?: Account;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionItem({
  transaction,
  sourceAccount,
  destinationAccount,
  onPress,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary, borderColor } = useTheme();
  const { user } = useUser();
  const scale = useSharedValue(1);

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'income':
        return ArrowDownLeft;
      case 'expense':
        return ArrowUpRight;
      case 'transfer':
      default:
        return ArrowLeftRight;
    }
  };

  const getTypeColor = () => {
    switch (transaction.type) {
      case 'income':
        return colors.success;
      case 'expense':
        return colors.error;
      case 'transfer':
        return colors.info;
    }
  };

  const categoryColor = getCategoryColor(transaction.category);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
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

  const Icon = getTypeIcon();
  const typeColor = getTypeColor();
  const cleanCategory = transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1);

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: cardBackground,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
          ...shadows.sm,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        {/* Category-tinted glowing icon ring */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${categoryColor}16`,
              borderColor: `${categoryColor}30`,
            },
          ]}
        >
          <Icon size={18} color={categoryColor} />
        </View>

        <View style={styles.details}>
          <View style={styles.headerRow}>
            <Text style={[styles.category, { color: textPrimary }]} numberOfLines={1}>
              {transaction.type === 'transfer'
                ? `${sourceAccount?.name || 'Account'} → ${destinationAccount?.name || 'Account'}`
                : cleanCategory}
            </Text>
            <Text style={[styles.amount, { color: typeColor }]}>
              {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
              {formatCurrency(transaction.amount, user?.currency)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.account, { color: textSecondary }]} numberOfLines={1}>
              {transaction.type === 'transfer'
                ? 'Transfer'
                : sourceAccount?.name || 'Account'}
            </Text>
            <Text style={[styles.date, { color: textSecondary }]}>
              {formatDate(transaction.date)}
            </Text>
          </View>

          {transaction.notes && transaction.notes.trim().length > 0 && (
            <Text style={[styles.notes, { color: textSecondary }]} numberOfLines={1}>
              {transaction.notes}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity
            onPress={handleEdit}
            style={[styles.actionButton, { backgroundColor: `${colors.primary[500]}15` }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Edit size={15} color={colors.primary[500]} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, { backgroundColor: `${colors.error}15` }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Trash2 size={15} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius['2xl'],
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
  },
  details: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  category: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    flex: 1,
    marginRight: spacing.sm,
  },
  amount: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  account: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
    opacity: 0.8,
  },
  date: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    opacity: 0.8,
  },
  notes: {
    fontSize: typography.fontSizes.xs,
    marginTop: 3,
    opacity: 0.75,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: spacing.sm,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
