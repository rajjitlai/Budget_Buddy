

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import {
  Zap,
  Wifi,
  Smartphone,
  UtensilsCrossed,
  Wrench,
  Calculator,
} from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, mockMonthlyPlan } from '@/lib/mockData';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CircularProgress } from '@/components/CircularProgress';
import { StackedBarChart } from '@/components/StackedBarChart';

interface Essential {
  key: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  value: number;
}

export default function MonthlyPlannerScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  
  const [salary, setSalary] = useState(mockMonthlyPlan.salary);
  const [essentials, setEssentials] = useState({
    electricity: mockMonthlyPlan.essentials.electricity,
    internet: mockMonthlyPlan.essentials.internet,
    mobile: mockMonthlyPlan.essentials.mobile,
    food: mockMonthlyPlan.essentials.food,
    utilities: mockMonthlyPlan.essentials.utilities,
  });

  const essentialsList: Essential[] = [
    { key: 'electricity', label: 'Electricity', icon: Zap, value: essentials.electricity },
    { key: 'internet', label: 'Internet', icon: Wifi, value: essentials.internet },
    { key: 'mobile', label: 'Mobile', icon: Smartphone, value: essentials.mobile },
    { key: 'food', label: 'Food & Groceries', icon: UtensilsCrossed, value: essentials.food },
    { key: 'utilities', label: 'Other Utilities', icon: Wrench, value: essentials.utilities },
  ];

  const totalEssentials = useMemo(() => {
    return Object.values(essentials).reduce((sum, val) => sum + val, 0);
  }, [essentials]);

  const allocations = useMemo(() => {
    const remaining = salary - totalEssentials;
    if (remaining <= 0) {
      return {
        spending: 0,
        salaryBuffer: 0,
        savings: 0,
        emergency: 0,
      };
    }
    
    // Smart allocation logic (mock)
    const spending = Math.round(remaining * 0.35);
    const salaryBuffer = Math.round(remaining * 0.15);
    const savings = Math.round(remaining * 0.35);
    const emergency = Math.round(remaining * 0.15);
    
    return { spending, salaryBuffer, savings, emergency };
  }, [salary, totalEssentials]);

  const chartSegments = [
    { value: totalEssentials, color: colors.error, label: 'Essentials' },
    { value: allocations.spending, color: colors.info, label: 'Spending' },
    { value: allocations.salaryBuffer, color: colors.warning, label: 'Salary Buffer' },
    { value: allocations.savings, color: colors.success, label: 'Savings' },
    { value: allocations.emergency, color: '#8b5cf6', label: 'Emergency' },
  ];

  const savingsRate = salary > 0 ? Math.round(((allocations.savings + allocations.emergency) / salary) * 100) : 0;

  const handleEssentialChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEssentials((prev) => ({ ...prev, [key]: numValue }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <Text style={[styles.title, { color: textPrimary }]}>
            Monthly Planner
          </Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            Plan your budget allocation smartly
          </Text>
        </Animated.View>

        {/* Salary Input */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.salaryCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.salaryHeader}>
            <Calculator size={24} color={colors.primary[500]} />
            <Text style={[styles.salaryLabel, { color: textPrimary }]}>
              Monthly Salary
            </Text>
          </View>
          <Text style={[styles.salaryValue, { color: textPrimary }]}>
            {formatCurrency(salary)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={10000}
            maximumValue={500000}
            step={1000}
            value={salary}
            onValueChange={setSalary}
            minimumTrackTintColor={colors.primary[500]}
            maximumTrackTintColor={isDarkMode ? colors.slate[600] : colors.slate[300]}
            thumbTintColor={colors.primary[500]}
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: textSecondary }]}>?10K</Text>
            <Text style={[styles.sliderLabel, { color: textSecondary }]}>?5L</Text>
          </View>
        </Animated.View>

        {/* Essentials Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SectionHeader
            title="Monthly Essentials"
            subtitle={`Total: ${formatCurrency(totalEssentials)}`}
          />
          <View style={styles.essentialsGrid}>
            {essentialsList.map((item) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.key}
                  style={[styles.essentialCard, { backgroundColor: cardBackground }]}
                >
                  <View style={styles.essentialHeader}>
                    <Icon size={18} color={colors.primary[500]} />
                    <Text style={[styles.essentialLabel, { color: textSecondary }]}>
                      {item.label}
                    </Text>
                  </View>
                  <View style={[styles.essentialInput, { borderColor }]}>
                    <Text style={[styles.currencyPrefix, { color: textSecondary }]}>?</Text>
                    <TextInput
                      style={[styles.input, { color: textPrimary }]}
                      value={item.value.toString()}
                      onChangeText={(val) => handleEssentialChange(item.key, val)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={textSecondary}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Allocation Breakdown */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <SectionHeader
            title="Suggested Allocation"
            subtitle="Smart breakdown of your income"
          />
          <View style={[styles.allocationCard, { backgroundColor: cardBackground }]}>
            <View style={styles.chartRow}>
              <CircularProgress
                percentage={savingsRate}
                size={100}
                color={colors.success}
                value={`${savingsRate}%`}
                label="Savings Rate"
              />
              <View style={styles.allocationDetails}>
                <View style={styles.allocationItem}>
                  <View style={[styles.dot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.allocationLabel, { color: textSecondary }]}>
                    Essentials
                  </Text>
                  <Text style={[styles.allocationValue, { color: textPrimary }]}>
                    {formatCurrency(totalEssentials)}
                  </Text>
                </View>
                <View style={styles.allocationItem}>
                  <View style={[styles.dot, { backgroundColor: colors.info }]} />
                  <Text style={[styles.allocationLabel, { color: textSecondary }]}>
                    Spending
                  </Text>
                  <Text style={[styles.allocationValue, { color: textPrimary }]}>
                    {formatCurrency(allocations.spending)}
                  </Text>
                </View>
                <View style={styles.allocationItem}>
                  <View style={[styles.dot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.allocationLabel, { color: textSecondary }]}>
                    Buffer
                  </Text>
                  <Text style={[styles.allocationValue, { color: textPrimary }]}>
                    {formatCurrency(allocations.salaryBuffer)}
                  </Text>
                </View>
                <View style={styles.allocationItem}>
                  <View style={[styles.dot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.allocationLabel, { color: textSecondary }]}>
                    Savings
                  </Text>
                  <Text style={[styles.allocationValue, { color: textPrimary }]}>
                    {formatCurrency(allocations.savings)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.barChartContainer}>
              <StackedBarChart segments={chartSegments} height={20} showLegend={false} />
            </View>
          </View>
        </Animated.View>

        {/* Summary Card */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={[styles.summaryCard, { backgroundColor: colors.primary[600] }]}
        >
          <Text style={styles.summaryTitle}>Monthly Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValue}>{formatCurrency(salary)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalEssentials + allocations.spending)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryHighlight]}>
            <Text style={styles.summaryLabelBold}>Net Savings</Text>
            <Text style={styles.summaryValueBold}>
              {formatCurrency(allocations.savings + allocations.emergency + allocations.salaryBuffer)}
            </Text>
          </View>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
  },
  salaryCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    ...shadows.md,
  },
  salaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  salaryLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  salaryValue: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: typography.fontSizes.sm,
  },
  essentialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  essentialCard: {
    width: '47%',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  essentialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  essentialLabel: {
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  essentialInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencyPrefix: {
    fontSize: typography.fontSizes.md,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    padding: 0,
  },
  allocationCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    ...shadows.md,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  allocationDetails: {
    flex: 1,
    gap: spacing.sm,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  allocationLabel: {
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  allocationValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  barChartContainer: {
    marginTop: spacing.xl,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    ...shadows.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: '#ffffff',
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: '#ffffff',
  },
  summaryHighlight: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryLabelBold: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: '#ffffff',
  },
  summaryValueBold: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: '#ffffff',
  },
});


