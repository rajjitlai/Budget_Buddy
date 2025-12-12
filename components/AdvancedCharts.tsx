
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, Transaction, Account } from '@/lib/mockData';
import { StackedBarChart } from './StackedBarChart';
import { CircularProgress } from './CircularProgress';
import { LineChart } from './LineChart';
import { SectionHeader } from './ui/SectionHeader';

interface AdvancedChartsProps {
  accounts: Account[];
  transactions: Transaction[];
  monthlyPlan?: {
    salary: number;
    essentials: Record<string, number>;
    allocations: Record<string, number>;
  } | null;
}

export function AdvancedCharts({ accounts, transactions, monthlyPlan }: AdvancedChartsProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary, borderColor } = useTheme();

  // Calculate spending by category
  const spendingByCategory = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const categorySpending: Record<string, number> = {};
    
    expenses.forEach((expense) => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categorySpending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const now = new Date();
    const last6Months: { month: string; income: number; expenses: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getFullYear() === date.getFullYear() &&
          tDate.getMonth() === date.getMonth()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
      });
    }

    return last6Months;
  }, [transactions]);

  // Account distribution
  const accountDistribution = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    if (totalBalance === 0) return [];

    return accounts
      .map((acc) => ({
        label: acc.name,
        value: acc.balance,
        color: acc.color,
        percentage: (acc.balance / totalBalance) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [accounts]);

  // Budget allocation (if monthly plan exists)
  const budgetAllocation = useMemo(() => {
    if (!monthlyPlan || monthlyPlan.salary === 0) return null;

    const totalEssentials = Object.values(monthlyPlan.essentials).reduce((sum, val) => sum + val, 0);
    const total = monthlyPlan.salary;

    return [
      {
        value: totalEssentials,
        color: colors.error,
        label: 'Essentials',
        percentage: (totalEssentials / total) * 100,
      },
      {
        value: monthlyPlan.allocations.spending,
        color: colors.info,
        label: 'Spending',
        percentage: (monthlyPlan.allocations.spending / total) * 100,
      },
      {
        value: monthlyPlan.allocations.salaryBuffer,
        color: colors.warning,
        label: 'Buffer',
        percentage: (monthlyPlan.allocations.salaryBuffer / total) * 100,
      },
      {
        value: monthlyPlan.allocations.savings,
        color: colors.success,
        label: 'Savings',
        percentage: (monthlyPlan.allocations.savings / total) * 100,
      },
      {
        value: monthlyPlan.allocations.emergency,
        color: '#8b5cf6',
        label: 'Emergency',
        percentage: (monthlyPlan.allocations.emergency / total) * 100,
      },
    ].filter((item) => item.value > 0);
  }, [monthlyPlan]);

  // Calculate savings rate
  const savingsRate = useMemo(() => {
    if (!monthlyPlan || monthlyPlan.salary === 0) return 0;
    const totalSavings = monthlyPlan.allocations.savings + monthlyPlan.allocations.emergency;
    return Math.round((totalSavings / monthlyPlan.salary) * 100);
  }, [monthlyPlan]);

  // Calculate expense growth
  const expenseGrowth = useMemo(() => {
    if (monthlyTrends.length < 2) return 0;
    const current = monthlyTrends[monthlyTrends.length - 1].expenses;
    const previous = monthlyTrends[monthlyTrends.length - 2].expenses;
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [monthlyTrends]);

  // Calculate net worth trend over time (cumulative net savings per month)
  const netWorthTrend = useMemo(() => {
    const now = new Date();
    const trendData: { label: string; value: number }[] = [];
    let cumulativeNet = 0;
    
    // Calculate net savings for each of the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      
      // Get transactions for this specific month
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getFullYear() === date.getFullYear() &&
          tDate.getMonth() === date.getMonth()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expenses;
      cumulativeNet += net;

      trendData.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.max(0, cumulativeNet), // Cumulative net savings
      });
    }

    return trendData;
  }, [transactions]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Net Worth Trend Line Chart */}
      {netWorthTrend.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <SectionHeader 
            title="Net Worth Trend" 
            subtitle="Your financial growth over time"
          />
          <View style={[styles.chartCard, { backgroundColor: cardBackground, borderColor }]}>
            <LineChart
              data={netWorthTrend}
              height={200}
              color={colors.primary[500]}
              showGrid={true}
              showDots={true}
              title="Net Worth Over Time"
            />
          </View>
        </Animated.View>
      )}

      {/* Savings Rate */}
      {monthlyPlan && monthlyPlan.salary > 0 && (
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <SectionHeader title="Savings Rate" subtitle="Your monthly savings percentage" />
          <View style={[styles.chartCard, { backgroundColor: cardBackground, borderColor }]}>
            <CircularProgress
              percentage={savingsRate}
              size={150}
              strokeWidth={12}
              color={savingsRate >= 20 ? colors.success : savingsRate >= 10 ? colors.warning : colors.error}
              value={`${savingsRate}%`}
              label="Savings Rate"
            />
            <View style={styles.savingsInfo}>
              <Text style={[styles.savingsText, { color: textSecondary }]}>
                Target: 20%
              </Text>
              <Text style={[styles.savingsAmount, { color: textPrimary }]}>
                {formatCurrency(monthlyPlan.allocations.savings + monthlyPlan.allocations.emergency)} saved
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Account Distribution */}
      {accountDistribution.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SectionHeader title="Account Distribution" subtitle="Balance across all accounts" />
          <View style={[styles.chartCard, { backgroundColor: cardBackground, borderColor }]}>
            <StackedBarChart
              segments={accountDistribution.map((acc) => ({
                value: acc.value,
                color: acc.color,
                label: acc.label,
              }))}
              height={32}
              showLegend={true}
            />
            <View style={styles.distributionList}>
              {accountDistribution.map((acc, index) => (
                <View key={index} style={styles.distributionItem}>
                  <View style={styles.distributionLeft}>
                    <View style={[styles.distributionDot, { backgroundColor: acc.color }]} />
                    <Text style={[styles.distributionLabel, { color: textPrimary }]}>
                      {acc.label}
                    </Text>
                  </View>
                  <View style={styles.distributionRight}>
                    <Text style={[styles.distributionValue, { color: textPrimary }]}>
                      {formatCurrency(acc.value)}
                    </Text>
                    <Text style={[styles.distributionPercentage, { color: textSecondary }]}>
                      {acc.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Budget Allocation */}
      {budgetAllocation && budgetAllocation.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SectionHeader title="Budget Allocation" subtitle="Monthly salary breakdown" />
          <View style={[styles.chartCard, { backgroundColor: cardBackground, borderColor }]}>
            <StackedBarChart
              segments={budgetAllocation}
              height={32}
              showLegend={true}
            />
            <View style={styles.allocationList}>
              {budgetAllocation.map((item, index) => (
                <View key={index} style={styles.allocationItem}>
                  <View style={styles.allocationLeft}>
                    <View style={[styles.allocationDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.allocationLabel, { color: textPrimary }]}>
                      {item.label}
                    </Text>
                  </View>
                  <View style={styles.allocationRight}>
                    <Text style={[styles.allocationValue, { color: textPrimary }]}>
                      {formatCurrency(item.value)}
                    </Text>
                    <Text style={[styles.allocationPercentage, { color: textSecondary }]}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Spending by Category */}
      {spendingByCategory.length > 0 && (
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <SectionHeader title="Spending by Category" subtitle="Top expense categories" />
          <View style={[styles.chartCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.categoryList}>
              {spendingByCategory.slice(0, 8).map((item, index) => {
                const totalSpending = spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0);
                const percentage = (item.amount / totalSpending) * 100;
                return (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryLeft}>
                      <Text style={[styles.categoryLabel, { color: textPrimary }]}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </Text>
                      <View style={styles.categoryBarContainer}>
                        <View
                          style={[
                            styles.categoryBar,
                            {
                              width: `${percentage}%`,
                              backgroundColor: colors.primary[500],
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={[styles.categoryValue, { color: textPrimary }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text style={[styles.categoryPercentage, { color: textSecondary }]}>
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Monthly Trends */}
      {monthlyTrends.length > 0 && (
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <SectionHeader 
            title="Monthly Trends" 
            subtitle="Income vs Expenses (Last 6 months)"
          />
          <View style={[styles.chartCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.trendsContainer}>
              {monthlyTrends.map((trend, index) => {
                const maxValue = Math.max(
                  ...monthlyTrends.map((t) => Math.max(t.income, t.expenses))
                );
                const incomeHeight = maxValue > 0 ? (trend.income / maxValue) * 100 : 0;
                const expenseHeight = maxValue > 0 ? (trend.expenses / maxValue) * 100 : 0;
                const net = trend.income - trend.expenses;

                return (
                  <View key={index} style={styles.trendItem}>
                    <View style={styles.trendBars}>
                      <View style={styles.trendBarContainer}>
                        <View
                          style={[
                            styles.trendBar,
                            {
                              height: `${incomeHeight}%`,
                              backgroundColor: colors.success,
                            },
                          ]}
                        />
                        <Text style={[styles.trendValue, { color: textSecondary }]}>
                          {formatCurrency(trend.income)}
                        </Text>
                      </View>
                      <View style={styles.trendBarContainer}>
                        <View
                          style={[
                            styles.trendBar,
                            {
                              height: `${expenseHeight}%`,
                              backgroundColor: colors.error,
                            },
                          ]}
                        />
                        <Text style={[styles.trendValue, { color: textSecondary }]}>
                          {formatCurrency(trend.expenses)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.trendMonth, { color: textSecondary }]}>
                      {trend.month}
                    </Text>
                    <View style={styles.trendNet}>
                      {net >= 0 ? (
                        <ArrowUpRight size={14} color={colors.success} />
                      ) : (
                        <ArrowDownLeft size={14} color={colors.error} />
                      )}
                      <Text
                        style={[
                          styles.trendNetText,
                          { color: net >= 0 ? colors.success : colors.error },
                        ]}
                      >
                        {formatCurrency(Math.abs(net))}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            {expenseGrowth !== 0 && (
              <View style={styles.growthIndicator}>
                {expenseGrowth > 0 ? (
                  <TrendingUp size={16} color={colors.error} />
                ) : (
                  <TrendingDown size={16} color={colors.success} />
                )}
                <Text
                  style={[
                    styles.growthText,
                    { color: expenseGrowth > 0 ? colors.error : colors.success },
                  ]}
                >
                  Expenses {expenseGrowth > 0 ? 'increased' : 'decreased'} by {Math.abs(expenseGrowth)}% this month
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing['5xl'],
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  savingsInfo: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  savingsText: {
    fontSize: typography.fontSizes.sm,
  },
  savingsAmount: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  distributionList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  distributionLabel: {
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  distributionRight: {
    alignItems: 'flex-end',
  },
  distributionValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  distributionPercentage: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  allocationList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  allocationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  allocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  allocationLabel: {
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  allocationRight: {
    alignItems: 'flex-end',
  },
  allocationValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  allocationPercentage: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  categoryList: {
    gap: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  categoryLabel: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.xs,
  },
  categoryBarContainer: {
    height: 6,
    backgroundColor: colors.slate[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  categoryRight: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  categoryValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  categoryPercentage: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  trendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    minHeight: 200,
    marginBottom: spacing.lg,
  },
  trendItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendBars: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-end',
    height: 150,
    width: '100%',
    justifyContent: 'center',
  },
  trendBarContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendBar: {
    width: '100%',
    minHeight: 4,
    borderRadius: borderRadius.sm,
  },
  trendValue: {
    fontSize: typography.fontSizes.xs,
    textAlign: 'center',
  },
  trendMonth: {
    fontSize: typography.fontSizes.xs,
    textAlign: 'center',
  },
  trendNet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendNetText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
  },
  growthText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
});

