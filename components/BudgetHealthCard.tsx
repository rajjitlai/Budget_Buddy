import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Target, AlertTriangle } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { formatCurrency, MonthlyPlan, Transaction } from '@/lib/types';

interface BudgetHealthCardProps {
  plan: MonthlyPlan | null;
  transactions: Transaction[];
  variant?: 'default' | 'compact';
}

export function BudgetHealthCard({ plan, transactions, variant = 'default' }: BudgetHealthCardProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary } = useTheme();
  const { user } = useUser();
  
  const displayCurrency = (amount: number) => formatCurrency(amount, user?.currency);

  if (!plan) return null;

  const isCompact = variant === 'compact';
  
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
    <Animated.View entering={FadeIn.duration(600)} style={[
      styles.container, 
      { 
        backgroundColor: cardBackground,
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.04)',
        padding: isCompact ? spacing.lg : spacing.xl,
        marginHorizontal: isCompact ? 0 : spacing.xl,
        flex: isCompact ? 1 : undefined,
        justifyContent: isCompact ? 'space-between' : undefined,
      }
    ]}>
      <View style={[styles.header, { marginBottom: isCompact ? spacing.md : spacing.xl }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${getStatusColor()}15`, width: isCompact ? 36 : 44, height: isCompact ? 36 : 44 }]}>
          {isOverBudget ? (
            <AlertTriangle size={isCompact ? 16 : 20} color={colors.error} />
          ) : (
            <Target size={isCompact ? 16 : 20} color={getStatusColor()} />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: textPrimary, fontSize: isCompact ? typography.fontSizes.sm : typography.fontSizes.md }]}>Health</Text>
          <Text style={[styles.subtitle, { color: textSecondary, fontSize: 10 }]}>
            {isOverBudget ? 'Over!' : 'On track'}
          </Text>
        </View>
      </View>

      {!isCompact && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: textSecondary }]}>Spent</Text>
            <Text style={[styles.statValue, { color: textPrimary }]}>{displayCurrency(totalSpent)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: textSecondary }]}>Budget</Text>
            <Text style={[styles.statValue, { color: textPrimary }]}>{displayCurrency(totalBudget)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: textSecondary }]}>Remaining</Text>
            <Text style={[styles.statValue, { color: isOverBudget ? colors.error : colors.success }]}>
              {displayCurrency(Math.max(totalBudget - totalSpent, 0))}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.progressWrapper}>
        <View style={[styles.progressBarBase, { backgroundColor: isDarkMode ? colors.slate[800] : colors.slate[100], height: isCompact ? 6 : 8 }]}>
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
        <Text style={[styles.progressPercent, { color: getStatusColor(), fontSize: 10 }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {isOverBudget && !isCompact && (
        <View style={[styles.warningBox, { backgroundColor: `${colors.error}10` }]}>
          <Text style={[styles.warningText, { color: colors.error }]}>
            {"You've exceeded your planned budget by "}{displayCurrency(totalSpent - totalBudget)}. Consider pausing non-essential spending.
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
    borderRadius: borderRadius['3xl'],
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.lg,
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
