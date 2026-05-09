import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { formatCurrency, Transaction, Account } from '@/lib/types';
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
  const { user } = useUser();
  
  const displayCurrency = (amount: number) => formatCurrency(amount, user?.currency);

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
    const totalSavings = (monthlyPlan.allocations.savings || 0) + (monthlyPlan.allocations.emergency || 0);
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

  // Calculate net worth trend anchored to current account balance
  const netWorthTrend = useMemo(() => {
    const now = new Date();
    const currentNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Compute monthly net (income - expenses) for last 6 months
    const monthlyNets: { label: string; net: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTxns = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
      });
      const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      monthlyNets.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        net: income - expenses,
      });
    }

    // Work backwards from currentNetWorth to estimate each month's balance
    const trendData: { label: string; value: number }[] = new Array(6);
    trendData[5] = { label: monthlyNets[5].label, value: currentNetWorth };
    for (let i = 4; i >= 0; i--) {
      trendData[i] = {
        label: monthlyNets[i].label,
        value: trendData[i + 1].value - monthlyNets[i + 1].net,
      };
    }

    return trendData;
  }, [transactions, accounts]);

  // Cash flow for current month
  const currentMonthFlow = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const income = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = income - expenses;
    const savingsPct = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
    return { income, expenses, net, savingsPct };
  }, [transactions]);

  // Budget vs Actual for current month
  const budgetVsActual = useMemo(() => {
    if (!monthlyPlan || monthlyPlan.salary === 0) return null;
    const now = new Date();
    const thisMonthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
    });

    const actualByCategory: Record<string, number> = {};
    thisMonthExpenses.forEach((t) => {
      const key = t.category.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/u, '').trim() || t.category;
      actualByCategory[key] = (actualByCategory[key] || 0) + t.amount;
    });

    const totalActual = thisMonthExpenses.reduce((s, t) => s + t.amount, 0);
    const totalEssentials = Object.values(monthlyPlan.essentials).reduce((s, v) => s + v, 0);
    const totalPlanned = totalEssentials + (monthlyPlan.allocations.spending || 0);

    return { totalPlanned, totalActual, surplus: totalPlanned - totalActual };
  }, [transactions, monthlyPlan]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Cash Flow Summary - Current Month */}
      <Animated.View entering={FadeInDown.delay(50).duration(500)}>
        <SectionHeader
          title="This Month's Cash Flow"
          subtitle={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        />
        <View style={[styles.flowRow]}>
          <View style={[styles.flowCard, { backgroundColor: `${colors.success}15`, borderColor: `${colors.success}30` }]}>
            <View style={styles.flowIcon}>
              <TrendingUp size={18} color={colors.success} />
            </View>
            <Text style={[styles.flowLabel, { color: colors.success }]}>Income</Text>
            <Text style={[styles.flowValue, { color: colors.success }]}>{displayCurrency(currentMonthFlow.income)}</Text>
          </View>
          <View style={[styles.flowCard, { backgroundColor: `${colors.error}15`, borderColor: `${colors.error}30` }]}>
            <View style={styles.flowIcon}>
              <TrendingDown size={18} color={colors.error} />
            </View>
            <Text style={[styles.flowLabel, { color: colors.error }]}>Expenses</Text>
            <Text style={[styles.flowValue, { color: colors.error }]}>{displayCurrency(currentMonthFlow.expenses)}</Text>
          </View>
          <View style={[styles.flowCard, { backgroundColor: currentMonthFlow.net >= 0 ? `${colors.primary[500]}15` : `${colors.warning}15`, borderColor: currentMonthFlow.net >= 0 ? `${colors.primary[500]}30` : `${colors.warning}30` }]}>
            <View style={styles.flowIcon}>
              <ArrowUpRight size={18} color={currentMonthFlow.net >= 0 ? colors.primary[500] : colors.warning} />
            </View>
            <Text style={[styles.flowLabel, { color: currentMonthFlow.net >= 0 ? colors.primary[500] : colors.warning }]}>Net</Text>
            <Text style={[styles.flowValue, { color: currentMonthFlow.net >= 0 ? colors.primary[500] : colors.warning }]}>{displayCurrency(Math.abs(currentMonthFlow.net))}</Text>
          </View>
        </View>
        {currentMonthFlow.income > 0 && (
          <View style={[styles.savingsRateBar, { borderColor }]}>
            <View style={styles.savingsRateHeader}>
              <Text style={[styles.savingsRateLabel, { color: textSecondary }]}>Savings Rate</Text>
              <Text style={[styles.savingsRateValue, { color: currentMonthFlow.savingsPct >= 20 ? colors.success : currentMonthFlow.savingsPct >= 10 ? colors.warning : colors.error }]}>
                {currentMonthFlow.savingsPct}%
              </Text>
            </View>
            <View style={styles.savingsRateTrack}>
              <View style={[styles.savingsRateFill, {
                width: `${Math.min(100, Math.max(0, currentMonthFlow.savingsPct))}%`,
                backgroundColor: currentMonthFlow.savingsPct >= 20 ? colors.success : currentMonthFlow.savingsPct >= 10 ? colors.warning : colors.error,
              }]} />
            </View>
            <Text style={[styles.savingsRateHint, { color: textSecondary }]}>Target: 20% or more</Text>
          </View>
        )}
      </Animated.View>

      {/* Budget vs Actual */}
      {budgetVsActual && (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <SectionHeader title="Budget vs Actual" subtitle="Planned spend vs real spend this month" />
          <View style={[styles.chartCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.bvaRow}>
              <View style={styles.bvaItem}>
                <Text style={[styles.bvaLabel, { color: textSecondary }]}>Planned</Text>
                <Text style={[styles.bvaValue, { color: textPrimary }]}>{displayCurrency(budgetVsActual.totalPlanned)}</Text>
              </View>
              <View style={styles.bvaDivider} />
              <View style={styles.bvaItem}>
                <Text style={[styles.bvaLabel, { color: textSecondary }]}>Actual</Text>
                <Text style={[styles.bvaValue, { color: budgetVsActual.totalActual > budgetVsActual.totalPlanned ? colors.error : textPrimary }]}>{displayCurrency(budgetVsActual.totalActual)}</Text>
              </View>
              <View style={styles.bvaDivider} />
              <View style={styles.bvaItem}>
                <Text style={[styles.bvaLabel, { color: textSecondary }]}>{budgetVsActual.surplus >= 0 ? 'Under' : 'Over'}</Text>
                <Text style={[styles.bvaValue, { color: budgetVsActual.surplus >= 0 ? colors.success : colors.error }]}>{displayCurrency(Math.abs(budgetVsActual.surplus))}</Text>
              </View>
            </View>
            <View style={styles.bvaTrackContainer}>
              <View style={styles.bvaTrack}>
                <View style={[styles.bvaFill, {
                  width: budgetVsActual.totalPlanned > 0 ? `${Math.min(100, (budgetVsActual.totalActual / budgetVsActual.totalPlanned) * 100)}%` : '0%',
                  backgroundColor: budgetVsActual.totalActual > budgetVsActual.totalPlanned ? colors.error : colors.success,
                }]} />
              </View>
              <Text style={[styles.bvaHint, { color: textSecondary }]}>
                {budgetVsActual.totalPlanned > 0 ? `${Math.min(100, Math.round((budgetVsActual.totalActual / budgetVsActual.totalPlanned) * 100))}% of budget used` : 'Set up a budget plan to track this'}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

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
                {displayCurrency((monthlyPlan.allocations.savings || 0) + (monthlyPlan.allocations.emergency || 0))} saved
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
                      {displayCurrency(acc.value)}
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
                      {displayCurrency(item.value)}
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
                        {displayCurrency(item.amount)}
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
                          {displayCurrency(trend.income)}
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
                          {displayCurrency(trend.expenses)}
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
                        {displayCurrency(Math.abs(net))}
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
  flowRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  flowCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  flowIcon: {
    marginBottom: 2,
  },
  flowLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  flowValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  savingsRateBar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.sm,
  },
  savingsRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsRateLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  savingsRateValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  savingsRateTrack: {
    height: 8,
    backgroundColor: colors.slate[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  savingsRateFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  savingsRateHint: {
    fontSize: typography.fontSizes.xs,
  },
  bvaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  bvaItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bvaLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bvaValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  bvaDivider: {
    width: 1,
    backgroundColor: colors.slate[200],
    marginVertical: spacing.xs,
  },
  bvaTrackContainer: {
    gap: spacing.xs,
  },
  bvaTrack: {
    height: 10,
    backgroundColor: colors.slate[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  bvaFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  bvaHint: {
    fontSize: typography.fontSizes.xs,
    textAlign: 'right',
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

