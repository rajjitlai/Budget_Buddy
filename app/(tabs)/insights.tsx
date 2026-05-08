
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  Sparkles,
  TrendingUp,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, Account, Transaction, MonthlyPlan } from '@/lib/types';
import { getAccounts } from '@/lib/services/accounts';
import { getTransactions } from '@/lib/services/transactions';
import { getCurrentMonthlyPlan } from '@/lib/services/monthlyPlans';
import { generateAIInsights } from '@/lib/services/ai';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AIInsightCard } from '@/components/AIInsightCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AdvancedCharts } from '@/components/AdvancedCharts';
import { RefreshButton } from '@/components/RefreshButton';
import * as SecureStore from 'expo-secure-store';

interface MetricCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface ExpandableSection {
  id: string;
  title: string;
  content: string;
}

export default function AIRecommendationScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showAdvancedCharts, setShowAdvancedCharts] = useState(false);

  useEffect(() => {
    loadData();
    loadAdvancedChartsSetting();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const loadAdvancedChartsSetting = async () => {
    try {
      const value = await SecureStore.getItemAsync('advancedCharts');
      setShowAdvancedCharts(value === 'true');
    } catch (error) {
      console.error('Error loading advanced charts setting:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadAccounts(), loadTransactions(), loadMonthlyPlan()]);
      await generateInsights();
    } catch (error) {
      console.error('Error loading insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const accountDocs = await getAccounts();
      const accountList: Account[] = accountDocs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        balance: doc.balance,
        icon: doc.icon,
        color: doc.color,
      }));
      setAccounts(accountList);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const transactionDocs = await getTransactions({ limit: 200 });
      const transactionList: Transaction[] = transactionDocs;
      setTransactions(transactionList);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadMonthlyPlan = async () => {
    try {
      const plan = await getCurrentMonthlyPlan();
      setMonthlyPlan(plan);
    } catch (error) {
      console.error('Error loading monthly plan:', error);
    }
  };

  const generateInsights = async () => {
    try {
      const generatedInsights = await generateAIInsights({
        accounts,
        transactions,
        monthlyPlan: monthlyPlan || undefined,
      });
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights([]);
    }
  };

  const handleRefresh = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadData();
    await loadAdvancedChartsSetting();
    setRefreshing(false);
  };

  // Calculate metrics
  const calculateMetrics = (): MetricCard[] => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = transactions.filter(
      (t) => new Date(t.date) >= thirtyDaysAgo
    );
    const recentExpenses = recentTransactions.filter((t) => t.type === 'expense');
    const monthlySpending = recentExpenses.reduce((sum, t) => sum + t.amount, 0);

    const monthlyEssentials = monthlyPlan
      ? Object.values(monthlyPlan.essentials).reduce((sum, val) => sum + val, 0)
      : 0;

    const savingsAccount = accounts.find((acc) => acc.type === 'savings');
    const emergencyFund = savingsAccount?.balance || 0;
    const monthsCovered = monthlyEssentials > 0 ? emergencyFund / monthlyEssentials : 0;

    const savingsRate = monthlyPlan && monthlyPlan.salary > 0
      ? Math.round(((monthlyPlan.salary - monthlySpending) / monthlyPlan.salary) * 100)
      : 0;

    return [
      {
        id: 'essentials',
        title: 'Monthly Essentials',
        value: formatCurrency(monthlyEssentials || monthlySpending),
        subtitle: monthlyPlan && monthlyPlan.salary > 0
          ? `${Math.round((monthlyEssentials / monthlyPlan.salary) * 100)}% of income`
          : 'Based on recent spending',
        icon: Target,
        color: colors.info,
        trend: 'neutral',
      },
      {
        id: 'buffer',
        title: 'Salary Buffer',
        value: formatCurrency(monthlyPlan?.allocations.salaryBuffer || 0),
        subtitle: monthlyPlan?.allocations.salaryBuffer
          ? `Target: ${formatCurrency(monthlyPlan.allocations.salaryBuffer)}`
          : 'Not set',
        icon: Shield,
        color: colors.warning,
        trend: monthlyPlan?.allocations.salaryBuffer ? 'up' : 'neutral',
      },
      {
        id: 'emergency',
        title: 'Emergency Fund',
        value: formatCurrency(emergencyFund),
        subtitle: monthsCovered > 0
          ? `${monthsCovered.toFixed(1)} months covered`
          : 'Not calculated',
        icon: AlertCircle,
        color: monthsCovered >= 6 ? colors.success : colors.warning,
        trend: monthsCovered >= 6 ? 'up' : 'down',
      },
      {
        id: 'savings',
        title: 'Savings Rate',
        value: `${savingsRate}%`,
        subtitle: savingsRate >= 20 ? 'Above average!' : savingsRate >= 10 ? 'Good progress' : 'Below target',
        icon: TrendingUp,
        color: savingsRate >= 20 ? colors.success : savingsRate >= 10 ? colors.warning : colors.error,
        trend: savingsRate >= 20 ? 'up' : savingsRate >= 10 ? 'neutral' : 'down',
      },
    ];
  };

  const metrics = calculateMetrics();

  const explanations: ExpandableSection[] = insights
    .filter((insight) => insight.description)
    .map((insight, index) => ({
      id: `exp-${index}`,
      title: insight.title,
      content: insight.description,
    }));

  const toggleSection = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color={colors.success} />;
      case 'down':
        return <TrendingUp size={14} color={colors.error} style={{ transform: [{ rotate: '180deg' }] }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={[styles.loadingText, { color: textSecondary }]}>
            Loading insights...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Sparkles size={28} color={colors.primary[500]} />
              </View>
              <View>
                <Text style={[styles.title, { color: textPrimary }]}>
                  Budget Buddy Insights
                </Text>
                <Text style={[styles.subtitle, { color: textSecondary }]}>
                  AI-powered recommendations for your finances
                </Text>
              </View>
            </View>
            <RefreshButton onPress={refreshData} refreshing={refreshing} />
          </View>
        </Animated.View>

        {/* Metrics Grid */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.metricsGrid}
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Animated.View
                key={metric.id}
                entering={FadeInDown.delay(200 + index * 100).duration(500)}
                style={[styles.metricCard, { backgroundColor: cardBackground }]}
              >
                <View style={styles.metricHeader}>
                  <View
                    style={[
                      styles.metricIconContainer,
                      { backgroundColor: `${metric.color}15` },
                    ]}
                  >
                    <Icon size={18} color={metric.color} />
                  </View>
                  {getTrendIcon(metric.trend)}
                </View>
                <Text style={[styles.metricValue, { color: textPrimary }]}>
                  {metric.value}
                </Text>
                <Text style={[styles.metricTitle, { color: textSecondary }]}>
                  {metric.title}
                </Text>
                <Text style={[styles.metricSubtitle, { color: textSecondary }]}>
                  {metric.subtitle}
                </Text>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Recommended Actions */}
        {insights.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <SectionHeader
              title="Recommended Actions"
              subtitle="Take these steps to optimize your finances"
            />
            <View style={styles.actionsContainer}>
              {insights.map((insight) => (
                <AIInsightCard key={insight.id} insight={insight} />
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <SectionHeader
              title="Insights"
              subtitle="Add accounts and transactions to get personalized recommendations"
            />
            <View style={styles.actionsContainer}>
              <View style={[styles.emptyContainer, { backgroundColor: cardBackground }]}>
                <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                  No insights yet
                </Text>
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  {accounts.length === 0
                    ? 'Add your first account to start getting insights.'
                    : transactions.length === 0
                    ? 'Add some transactions to see personalized recommendations.'
                    : 'We need more data to generate insights. Keep adding transactions!'}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Advanced Charts */}
        {showAdvancedCharts && (
          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <AdvancedCharts
              accounts={accounts}
              transactions={transactions}
              monthlyPlan={monthlyPlan}
            />
          </Animated.View>
        )}

        {/* Expandable Explanations */}
        {explanations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <SectionHeader
              title="Understanding Your Insights"
              subtitle="Learn more about our recommendations"
            />
            <View style={styles.explanationsContainer}>
              {explanations.map((section) => {
                const isExpanded = expandedSections.includes(section.id);
                return (
                  <TouchableOpacity
                    key={section.id}
                    onPress={() => toggleSection(section.id)}
                    activeOpacity={0.7}
                    style={[
                      styles.explanationCard,
                      { backgroundColor: cardBackground, borderColor },
                    ]}
                  >
                    <View style={styles.explanationHeader}>
                      <Text
                        style={[styles.explanationTitle, { color: textPrimary }]}
                      >
                        {section.title}
                      </Text>
                      {isExpanded ? (
                        <ChevronUp size={20} color={textSecondary} />
                      ) : (
                        <ChevronDown size={20} color={textSecondary} />
                      )}
                    </View>
                    {isExpanded && (
                      <Animated.View entering={FadeIn.duration(200)}>
                        <Text
                          style={[
                            styles.explanationContent,
                            { color: textSecondary },
                          ]}
                        >
                          {section.content}
                        </Text>
                      </Animated.View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* AI Disclaimer */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={[styles.disclaimerCard, { backgroundColor: isDarkMode ? colors.slate[800] : colors.slate[100] }]}
        >
          <View style={styles.disclaimerIcon}>
            <Sparkles size={16} color={colors.primary[500]} />
          </View>
          <Text style={[styles.disclaimerText, { color: textSecondary }]}>
            These insights are generated based on your financial data and general best practices. 
            Always consult a financial advisor for personalized advice.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['5xl'],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.xl,
    backgroundColor: `${colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '47%',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  metricTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  metricSubtitle: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  explanationsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  explanationCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  explanationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  explanationTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  explanationContent: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 22,
    marginTop: spacing.md,
    marginHorizontal: spacing.xs,
  },
  disclaimerCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  disclaimerIcon: {
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
    marginLeft: spacing.xs,
  },
});
