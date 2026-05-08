
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Target, AlertTriangle, TrendingUp } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, MonthlyPlan, Transaction } from '@/lib/types';

interface BudgetHealthCardProps {
  plan: MonthlyPlan | null;
  transactions: Transaction[];
}

export function BudgetHealthCard({ plan, transactions }: BudgetHealthCardProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary, borderColor } = useTheme();

  if (!plan) return null;

  // Calculate current month spending
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
  });

  const totalSpent = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalBudget = plan.allocations.spending + Object.values(plan.essentials).reduce((a, b) => a + b, 0);
  
  const progress = Math.min(totalSpent / (totalBudget || 1), 1.2); // Cap at 120% for UI
  const isOverBudget = totalSpent > totalBudget;
  const isCloseToBudget = totalSpent > totalBudget * 0.8;

  const getStatusColor = () => {
    if (isOverBudget) return colors.error;
    if (isCloseToBudget) return colors.warning;
    return colors.primary[500];
  };

  return (
    <Animated.View entering={FadeIn.duration(600)} style={[styles.container, { backgroundColor: cardBackground }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${getStatusColor()}15` }]}>
          {isOverBudget ? (
            <AlertTriangle size={20} color={colors.error} />
          ) : (
            <Target size={20} color={getStatusColor()} />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: textPrimary }]}>Budget Health</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            {isOverBudget ? 'Over budget!' : isCloseToBudget ? 'Approaching limit' : 'On track'}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: textSecondary }]}>Spent</Text>
          <Text style={[styles.statValue, { color: textPrimary }]}>{formatCurrency(totalSpent)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: textSecondary }]}>Budget</Text>
          <Text style={[styles.statValue, { color: textPrimary }]}>{formatCurrency(totalBudget)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: textSecondary }]}>Remaining</Text>
          <Text style={[styles.statValue, { color: isOverBudget ? colors.error : colors.success }]}>
            {formatCurrency(Math.max(totalBudget - totalSpent, 0))}
          </Text>
        </View>
      </View>

      <View style={styles.progressWrapper}>
        <View style={[styles.progressBarBase, { backgroundColor: isDarkMode ? colors.slate[800] : colors.slate[100] }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${Math.min(progress * 100, 100)}%`, 
                backgroundColor: getStatusColor() 
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressPercent, { color: getStatusColor() }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {isOverBudget && (
        <View style={[styles.warningBox, { backgroundColor: `${colors.error}10` }]}>
          <Text style={[styles.warningText, { color: colors.error }]}>
            You've exceeded your planned budget by {formatCurrency(totalSpent - totalBudget)}. Consider pausing non-essential spending.
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  title: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressBarBase: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    minWidth: 35,
  },
  warningBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  warningText: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
    textAlign: 'center',
  },
});
