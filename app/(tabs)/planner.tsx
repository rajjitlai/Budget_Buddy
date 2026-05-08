
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Target,
  Wallet,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  PieChart as PieIcon,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, MonthlyPlan } from '@/lib/types';
import { getCurrentMonthlyPlan, saveMonthlyPlan } from '@/lib/services/monthlyPlans';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const { width } = Dimensions.get('window');

type Step = 'income' | 'fixed' | 'savings' | 'variable' | 'summary';

export default function PlannerScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>('income');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Plan State
  const [salary, setSalary] = useState('');
  const [rent, setRent] = useState('');
  const [bills, setBills] = useState('');
  const [otherFixed, setOtherFixed] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [spendingAllowance, setSpendingAllowance] = useState('');
  const [salaryBuffer, setSalaryBuffer] = useState('');

  useEffect(() => {
    loadExistingPlan();
  }, []);

  const loadExistingPlan = async () => {
    try {
      setLoading(true);
      const plan = await getCurrentMonthlyPlan();
      if (plan) {
        setSalary(plan.salary.toString());
        setRent(plan.essentials.rent.toString());
        setBills(plan.essentials.bills.toString());
        setOtherFixed((plan.essentials.other || 0).toString());
        setSavingsTarget(plan.allocations.savings.toString());
        setSpendingAllowance(plan.allocations.spending.toString());
        setSalaryBuffer((plan.allocations.salaryBuffer || 0).toString());
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (currentStep) {
      case 'income': setCurrentStep('fixed'); break;
      case 'fixed': setCurrentStep('savings'); break;
      case 'savings': setCurrentStep('variable'); break;
      case 'variable': setCurrentStep('summary'); break;
    }
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (currentStep) {
      case 'fixed': setCurrentStep('income'); break;
      case 'savings': setCurrentStep('fixed'); break;
      case 'variable': setCurrentStep('savings'); break;
      case 'summary': setCurrentStep('variable'); break;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();

      const planData: MonthlyPlan = {
        salary: parseFloat(salary) || 0,
        essentials: {
          rent: parseFloat(rent) || 0,
          bills: parseFloat(bills) || 0,
          other: parseFloat(otherFixed) || 0,
        },
        allocations: {
          savings: parseFloat(savingsTarget) || 0,
          spending: parseFloat(spendingAllowance) || 0,
          investment: 0,
          salaryBuffer: parseFloat(salaryBuffer) || 0,
        },
      };

      await saveMonthlyPlan(month, year, planData);
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your monthly budget has been saved!');
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save your budget plan.');
    } finally {
      setSaving(false);
    }
  };

  // Calculations
  const totalIncome = parseFloat(salary) || 0;
  const totalFixed = (parseFloat(rent) || 0) + (parseFloat(bills) || 0) + (parseFloat(otherFixed) || 0);
  const totalSavings = parseFloat(savingsTarget) || 0;
  const totalSpending = parseFloat(spendingAllowance) || 0;
  const totalBuffer = parseFloat(salaryBuffer) || 0;
  const remaining = totalIncome - totalFixed - totalSavings - totalSpending - totalBuffer;

  const renderProgress = () => {
    const steps: Step[] = ['income', 'fixed', 'savings', 'variable', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    
    return (
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.progressDot, 
              { 
                backgroundColor: index <= currentIndex ? colors.primary[500] : (isDarkMode ? colors.slate[700] : colors.slate[200]),
                flex: index <= currentIndex ? 2 : 1
              }
            ]} 
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={styles.headerIcon}>
            <Target size={28} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={[styles.title, { color: textPrimary }]}>Budget Planner</Text>
            <Text style={[styles.subtitle, { color: textSecondary }]}>Design your monthly financial strategy</Text>
          </View>
        </Animated.View>

        {renderProgress()}

        <View style={styles.cardContainer}>
          {currentStep === 'income' && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={[styles.stepCard, { backgroundColor: cardBackground }]}>
              <View style={styles.cardHeader}>
                <Wallet size={24} color={colors.primary[500]} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Step 1: Monthly Income</Text>
              </View>
              <Text style={[styles.cardHint, { color: textSecondary }]}>How much do you expect to earn this month after taxes?</Text>
              <InputField
                label="Monthly Salary / Income"
                placeholder="0.00"
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
                prefix="Rs."
              />
              <View style={styles.buttonRow}>
                <PrimaryButton title="Next" onPress={handleNext} icon={<ChevronRight size={18} color="#fff" />} style={{ flex: 1 }} />
              </View>
            </Animated.View>
          )}

          {currentStep === 'fixed' && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={[styles.stepCard, { backgroundColor: cardBackground }]}>
              <View style={styles.cardHeader}>
                <ShieldCheck size={24} color={colors.info} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Step 2: Fixed Expenses</Text>
              </View>
              <Text style={[styles.cardHint, { color: textSecondary }]}>Enter your non-negotiable monthly costs.</Text>
              <InputField label="Rent / Mortgage" placeholder="0.00" value={rent} onChangeText={setRent} keyboardType="numeric" prefix="Rs." />
              <InputField label="Utilities & Bills" placeholder="0.00" value={bills} onChangeText={setBills} keyboardType="numeric" prefix="Rs." />
              <InputField label="Other Fixed Costs" placeholder="0.00" value={otherFixed} onChangeText={setOtherFixed} keyboardType="numeric" prefix="Rs." />
              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" onPress={handleBack} variant="ghost" style={{ flex: 1 }} />
                <PrimaryButton title="Next" onPress={handleNext} icon={<ChevronRight size={18} color="#fff" />} style={{ flex: 2 }} />
              </View>
            </Animated.View>
          )}

          {currentStep === 'savings' && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={[styles.stepCard, { backgroundColor: cardBackground }]}>
              <View style={styles.cardHeader}>
                <TrendingUp size={24} color={colors.success} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Step 3: Savings Goals</Text>
              </View>
              <Text style={[styles.cardHint, { color: textSecondary }]}>The "20" in 50/30/20. How much do you want to save?</Text>
              <InputField label="Savings Target" placeholder="0.00" value={savingsTarget} onChangeText={setSavingsTarget} keyboardType="numeric" prefix="Rs." />
              <View style={styles.suggestedBox}>
                <Text style={[styles.suggestedText, { color: textSecondary }]}>Suggested (20%): {formatCurrency(totalIncome * 0.2)}</Text>
              </View>
              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" onPress={handleBack} variant="ghost" style={{ flex: 1 }} />
                <PrimaryButton title="Next" onPress={handleNext} icon={<ChevronRight size={18} color="#fff" />} style={{ flex: 2 }} />
              </View>
            </Animated.View>
          )}

          {currentStep === 'variable' && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={[styles.stepCard, { backgroundColor: cardBackground }]}>
              <View style={styles.cardHeader}>
                <Sparkles size={24} color={colors.warning} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Step 4: Allowances</Text>
              </View>
              <Text style={[styles.cardHint, { color: textSecondary }]}>Set your budget for food, fun, and shopping.</Text>
              <InputField label="Variable Spending" placeholder="0.00" value={spendingAllowance} onChangeText={setSpendingAllowance} keyboardType="numeric" prefix="Rs." />
              <InputField label="Salary Buffer" placeholder="Emergency cushion" value={salaryBuffer} onChangeText={setSalaryBuffer} keyboardType="numeric" prefix="Rs." />
              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" onPress={handleBack} variant="ghost" style={{ flex: 1 }} />
                <PrimaryButton title="Finish" onPress={handleNext} icon={<CheckCircle2 size={18} color="#fff" />} style={{ flex: 2 }} />
              </View>
            </Animated.View>
          )}

          {currentStep === 'summary' && (
            <Animated.View entering={FadeInDown} style={[styles.stepCard, { backgroundColor: cardBackground }]}>
              <View style={styles.cardHeader}>
                <PieIcon size={24} color={colors.primary[500]} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Monthly Summary</Text>
              </View>
              
              <View style={styles.summaryGrid}>
                <SummaryItem label="Total Income" value={totalIncome} color={textPrimary} />
                <SummaryItem label="Fixed Costs" value={totalFixed} color={colors.error} />
                <SummaryItem label="Savings" value={totalSavings} color={colors.success} />
                <SummaryItem label="Spending" value={totalSpending} color={colors.warning} />
                <SummaryItem label="Buffer" value={totalBuffer} color={colors.info} />
              </View>

              <View style={[styles.resultBox, { backgroundColor: remaining >= 0 ? `${colors.success}15` : `${colors.error}15` }]}>
                <Text style={[styles.resultLabel, { color: textSecondary }]}>Unallocated Funds</Text>
                <Text style={[styles.resultValue, { color: remaining >= 0 ? colors.success : colors.error }]}>
                  {formatCurrency(remaining)}
                </Text>
                {remaining < 0 && (
                  <Text style={[styles.resultWarning, { color: colors.error }]}>Warning: Your budget exceeds your income!</Text>
                )}
              </View>

              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" onPress={handleBack} variant="ghost" style={{ flex: 1 }} />
                <PrimaryButton title="Save Budget" onPress={handleSave} loading={saving} style={{ flex: 2 }} />
              </View>
            </Animated.View>
          )}
        </View>

        {/* Pro Tip Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={[styles.tipCard, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
          <Sparkles size={20} color={colors.primary[500]} />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: textPrimary }]}>Pro Tip</Text>
            <Text style={[styles.tipText, { color: textSecondary }]}>
              Try the 50/30/20 rule: 50% for Needs, 30% for Wants, and 20% for Savings. This balance ensures long-term financial health.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: number; color: string }) {
  const { textSecondary } = useTheme();
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryLabel, { color: textSecondary }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{formatCurrency(value)}</Text>
    </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    backgroundColor: `${colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
  },
  cardContainer: {
    paddingHorizontal: spacing.xl,
  },
  stepCard: {
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  cardHint: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  suggestedBox: {
    marginTop: -spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  suggestedText: {
    fontSize: typography.fontSizes.xs,
    fontStyle: 'italic',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryItem: {
    width: '45%',
  },
  summaryLabel: {
    fontSize: typography.fontSizes.xs,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  resultBox: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultLabel: {
    fontSize: typography.fontSizes.sm,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
  },
  resultWarning: {
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 4,
  },
  tipText: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 18,
  },
});
