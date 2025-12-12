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
import { formatCurrency, categories } from '@/lib/mockData';
import { TransactionDocument } from '@/lib/services/transactions';
import { Account } from '@/lib/mockData';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TransactionItemProps {
  transaction: TransactionDocument;
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
  const { cardBackground, textPrimary, textSecondary, borderColor } = useTheme();
  const scale = useSharedValue(1);

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'income':
        return ArrowDownLeft;
      case 'expense':
        return ArrowUpRight;
      case 'transfer':
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

  const getCategoryLabel = () => {
    const category = categories.find((c) => c.id === transaction.category);
    return category?.label || transaction.category;
  };

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

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.container,
        { backgroundColor: cardBackground, borderColor },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${typeColor}15` }]}>
          <Icon size={20} color={typeColor} />
        </View>

        <View style={styles.details}>
          <View style={styles.headerRow}>
            <Text style={[styles.category, { color: textPrimary }]} numberOfLines={1}>
              {transaction.type === 'transfer'
                ? `${sourceAccount?.name || 'Account'} → ${destinationAccount?.name || 'Account'}`
                : getCategoryLabel()}
            </Text>
            <Text style={[styles.amount, { color: typeColor }]}>
              {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
              {formatCurrency(transaction.amount)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.account, { color: textSecondary }]} numberOfLines={1}>
              {transaction.type === 'transfer'
                ? 'Transfer'
                : sourceAccount?.name || 'Unknown Account'}
            </Text>
            <Text style={[styles.date, { color: textSecondary }]}>
              {formatDate(transaction.date)}
            </Text>
          </View>

          {transaction.notes && (
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
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    ...shadows.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  account: {
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  date: {
    fontSize: typography.fontSizes.sm,
  },
  notes: {
    fontSize: typography.fontSizes.xs,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

