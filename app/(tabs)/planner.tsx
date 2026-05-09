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
  FadeInRight,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
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
  Plus,
  Trash2,
  Menu,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { useData } from '@/lib/DataContext';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { formatCurrency, MonthlyPlan } from '@/lib/types';
import { getCurrentMonthlyPlan, saveMonthlyPlan } from '@/lib/services/monthlyPlans';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AnimatedScale } from '@/components/ui/AnimatedScale';

const { width } = Dimensions.get('window');

type Step = 'income' | 'fixed' | 'savings' | 'variable' | 'summary';

interface PlanItem {
  id: string;
  label: string;
  amount: string;
}

export default function PlannerScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { user } = useUser();
  const { refreshKey, triggerRefresh } = useData();
  const navigation = useNavigation();
  
  const displayCurrency = (amount: number) => formatCurrency(amount, user?.currency);
  const [currentStep, setCurrentStep] = useState<Step>('income');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Plan State
  const [salary, setSalary] = useState('');
  
  // Dynamic Sections
  const [fixedExpenses, setFixedExpenses] = useState<PlanItem[]>([
    { id: '1', label: 'Rent / Mortgage', amount: '' },
    { id: '2', label: 'Utilities & Bills', amount: '' },
  ]);
  
  const [savingsGoals, setSavingsGoals] = useState<PlanItem[]>([
    { id: '1', label: 'Emergency Fund', amount: '' },
  ]);
  
  const [allowances, setAllowances] = useState<PlanItem[]>([
    { id: '1', label: 'Variable Spending', amount: '' },
  ]);

  useEffect(() => {
    loadExistingPlan();
  }, [refreshKey]);

  const loadExistingPlan = async () => {
    try {
      setLoading(true);
      const plan = await getCurrentMonthlyPlan();
      if (plan) {
        setSalary(plan.salary.toString());
        
        // Reconstruct dynamic fields from the flat structure (legacy support)
        const fixed: PlanItem[] = [];
        if (plan.essentials.rent) fixed.push({ id: Math.random().toString(), label: 'Rent', amount: plan.essentials.rent.toString() });
        if (plan.essentials.bills) fixed.push({ id: Math.random().toString(), label: 'Bills', amount: plan.essentials.bills.toString() });
        if (plan.essentials.other) fixed.push({ id: Math.random().toString(), label: 'Other Fixed', amount: plan.essentials.other.toString() });
        if (fixed.length > 0) setFixedExpenses(fixed);

        const savings: PlanItem[] = [];
        if (plan.allocations.savings) savings.push({ id: Math.random().toString(), label: 'Savings Goal', amount: plan.allocations.savings.toString() });
        if (savings.length > 0) setSavingsGoals(savings);

        const allow: PlanItem[] = [];
        if (plan.allocations.spending) allow.push({ id: Math.random().toString(), label: 'Variable Spending', amount: plan.allocations.spending.toString() });
        if (plan.allocations.salaryBuffer) allow.push({ id: Math.random().toString(), label: 'Buffer', amount: plan.allocations.salaryBuffer.toString() });
        if (allow.length > 0) setAllowances(allow);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (setFn: React.Dispatch<React.SetStateAction<PlanItem[]>>) => {
    setFn(prev => [...prev, { id: Math.random().toString(), label: '', amount: '' }]);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeItem = (id: string, setFn: React.Dispatch<React.SetStateAction<PlanItem[]>>) => {
    setFn(prev => prev.filter(item => item.id !== id));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateItem = (id: string, field: 'label' | 'amount', value: string, setFn: React.Dispatch<React.SetStateAction<PlanItem[]>>) => {
    setFn(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
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

      // Aggregate totals
      const sum = (items: PlanItem[]) => items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

      const planData: MonthlyPlan = {
        salary: parseFloat(salary) || 0,
        essentials: {
          rent: parseFloat(fixedExpenses.find(e => e.label.toLowerCase().includes('rent'))?.amount ?? '0') || 0,
          bills: sum(fixedExpenses.filter(e => !e.label.toLowerCase().includes('rent'))),
          other: 0,
        },
        allocations: {
          savings: sum(savingsGoals),
          spending: sum(allowances),
          investment: 0,
          salaryBuffer: 0,
        },
      };

      await saveMonthlyPlan(month, year, planData);
      triggerRefresh();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (Platform.OS === 'web') {
        window.alert('Plan saved! Your Budget Buddy is updated.');
      } else {
        Alert.alert('Success', 'Plan saved! Your Budget Buddy is updated.');
      }
    } catch (error: any) {
      console.error('Error saving plan:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: ' + (error?.message || 'Failed to save plan.'));
      } else {
        Alert.alert('Error', error?.message || 'Failed to save plan.');
      }
    } finally {
      setSaving(false);
    }
  };

  const totalIncome = parseFloat(salary) || 0;
  const sum = (items: PlanItem[]) => items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalFixed = sum(fixedExpenses);
  const totalSavings = sum(savingsGoals);
  const totalSpending = sum(allowances);
  const remaining = totalIncome - totalFixed - totalSavings - totalSpending;

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
                backgroundColor: index <= currentIndex ? colors.primary[500] : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                flex: index === currentIndex ? 2 : 1
              }
            ]} 
          />
        ))}
      </View>
    );
  };

  const renderSectionItems = (items: PlanItem[], setFn: React.Dispatch<React.SetStateAction<PlanItem[]>>) => (
    <View style={styles.itemsList}>
      {items.map((item) => (
        <Animated.View key={item.id} entering={FadeInRight} style={styles.itemRow}>
          <View style={styles.itemLabelCol}>
            <InputField
              label=""
              placeholder="Label (e.g. Rent)"
              value={item.label}
              onChangeText={(v) => updateItem(item.id, 'label', v, setFn)}
              containerStyle={styles.compactInput}
            />
          </View>
          <View style={styles.itemAmountCol}>
            <InputField
              label=""
              placeholder="0.00"
              value={item.amount}
              onChangeText={(v) => updateItem(item.id, 'amount', v, setFn)}
              keyboardType="numeric"
              containerStyle={styles.compactInput}
            />
          </View>
          <TouchableOpacity onPress={() => removeItem(item.id, setFn)} style={styles.removeBtn}>
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </Animated.View>
      ))}
      <AnimatedScale onPress={() => addItem(setFn)} style={[styles.addBtn, { borderColor }]}>
        <Plus size={18} color={colors.primary[500]} />
        <Text style={[styles.addBtnText, { color: colors.primary[500] }]}>Add Field</Text>
      </AnimatedScale>
    </View>
  );

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
        <Animated.View entering={FadeInDown} style={styles.header}>
          <View style={styles.headerLeft}>
            <AnimatedScale 
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10`, marginRight: spacing.md }]}
            >
              <Menu size={22} color={textSecondary} />
            </AnimatedScale>
            <View style={[styles.headerIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
              <Target size={28} color={colors.primary[500]} />
            </View>
          </View>
          <View>
            <Text style={[styles.title, { color: textPrimary }]}>Budget Strategy</Text>
            <Text style={[styles.subtitle, { color: textSecondary }]}>Customize your monthly allocations</Text>
          </View>
        </Animated.View>

        {renderProgress()}

        <View style={styles.cardContainer}>
          {currentStep === 'income' && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={[styles.stepCard, { backgroundColor: cardBackground, borderColor }]}>
              <View style={styles.cardHeader}>
                <Wallet size={24} color={colors.primary[500]} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Step 1: Net Income</Text>
              </View>
              <Text style={[styles.cardHint, { color: textSecondary }]}>What is your total expected take-home pay?</Text>
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
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={[styles.stepCard, { backgroundColor: cardBackground, borderColor }]}>
              <View style={styles.cardHeader}>
                <ShieldCheck size={24} color={colors.info} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Step 2: Fixed Costs</Text>
              </View>
              <Text style={[styles.cardHint, { color: textSecondary }]}>Non-negotiable bills and necessities.</Text>
              {renderSectionItems(fixedExpenses, setFixedExpenses)}
              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" onPress={handleBack} variant="ghost" style={{ flex: 1 }} />
                <PrimaryButton title="Next" onPress={handleNext} icon={<ChevronRight size={18} color="#fff" />} style={{ flex: 2 }} />
              </View>
            </Animated.View>
          )}

          {currentStep === 'savings' && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={[styles.stepCard, { backgroundColor: cardBackground, borderColor }]}>
              <View style={styles.cardHeader}>
                <TrendingUp size={24} color={colors.success} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Step 3: Savings Goals</Text>
              </View>
              <Text style={[styles.cardHint, { color: textSecondary }]}>Prioritize your future self.</Text>
              {renderSectionItems(savingsGoals, setSavingsGoals)}
              <View style={styles.suggestedBox}>
                <Text style={[styles.suggestedText, { color: textSecondary }]}>Suggested (20%): {displayCurrency(totalIncome * 0.2)}</Text>
              </View>
              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" onPress={handleBack} variant="ghost" style={{ flex: 1 }} />
                <PrimaryButton title="Next" onPress={handleNext} icon={<ChevronRight size={18} color="#fff" />} style={{ flex: 2 }} />
              </View>
            </Animated.View>
          )}

          {currentStep === 'variable' && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={[styles.stepCard, { backgroundColor: cardBackground, borderColor }]}>
              <View style={styles.cardHeader}>
                <Sparkles size={24} color={colors.warning} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Step 4: Allowances</Text>
              </View>
              <Text style={[styles.cardHint, { color: textSecondary }]}>Food, fun, and lifestyle spending.</Text>
              {renderSectionItems(allowances, setAllowances)}
              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" onPress={handleBack} variant="ghost" style={{ flex: 1 }} />
                <PrimaryButton title="Finish" onPress={handleNext} icon={<CheckCircle2 size={18} color="#fff" />} style={{ flex: 2 }} />
              </View>
            </Animated.View>
          )}

          {currentStep === 'summary' && (
            <Animated.View entering={FadeInDown} style={[styles.stepCard, { backgroundColor: cardBackground, borderColor }]}>
              <View style={styles.cardHeader}>
                <PieIcon size={24} color={colors.primary[500]} />
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Strategy Review</Text>
              </View>
              
              <View style={styles.summaryGrid}>
                <SummaryItem label="Income" value={totalIncome} color={textPrimary} currency={user?.currency} />
                <SummaryItem label="Fixed" value={totalFixed} color={colors.error} currency={user?.currency} />
                <SummaryItem label="Savings" value={totalSavings} color={colors.success} currency={user?.currency} />
                <SummaryItem label="Flexible" value={totalSpending} color={colors.warning} currency={user?.currency} />
              </View>

              <View style={[styles.resultBox, { backgroundColor: remaining >= 0 ? `${colors.success}10` : `${colors.error}10` }]}>
                <Text style={[styles.resultLabel, { color: textSecondary }]}>Leftover</Text>
                <Text style={[styles.resultValue, { color: remaining >= 0 ? colors.success : colors.error }]}>
                  {displayCurrency(remaining)}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <PrimaryButton title="Back" onPress={handleBack} variant="ghost" style={{ flex: 1 }} />
                <PrimaryButton title="Apply Strategy" onPress={handleSave} loading={saving} disabled={saving} style={{ flex: 2 }} />
              </View>
            </Animated.View>
          )}
        </View>

        <Animated.View entering={FadeInDown.delay(300)} style={[styles.tipCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
          <Sparkles size={20} color={colors.primary[500]} />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: textPrimary }]}>Strategy Guide: 50/30/20 Rule</Text>
            <Text style={[styles.tipText, { color: textSecondary }]}>
              • 50% for Needs: {displayCurrency(totalIncome * 0.5)} (Fixed Costs)
              • 30% for Wants: {displayCurrency(totalIncome * 0.3)} (Variable Spending)
              • 20% for Savings: {displayCurrency(totalIncome * 0.2)} (Future Goals)
            </Text>
            <Text style={[styles.tipText, { color: textSecondary, marginTop: spacing.sm }]}>
              Adjust these manually based on your local cost of living and specific goals.
            </Text>
          </View>
        </Animated.View>
        
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, color, currency }: { label: string; value: number; color: string; currency?: string }) {
  const { textSecondary } = useTheme();
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryLabel, { color: textSecondary }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{formatCurrency(value, currency)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: { width: 56, height: 56, borderRadius: borderRadius['2xl'], alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold },
  subtitle: { fontSize: typography.fontSizes.sm, opacity: 0.8 },
  progressContainer: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.xs, marginBottom: spacing.xl },
  progressDot: { height: 4, borderRadius: 2 },
  cardContainer: { paddingHorizontal: spacing.xl },
  stepCard: { padding: spacing.xl, borderRadius: borderRadius['3xl'], borderWidth: 1, ...shadows.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  cardTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold },
  cardHint: { fontSize: typography.fontSizes.sm, marginBottom: spacing.xl, opacity: 0.7 },
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  itemsList: { gap: spacing.sm },
  itemRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  itemLabelCol: { flex: 2 },
  itemAmountCol: { flex: 1 },
  compactInput: { marginBottom: 0 },
  removeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: borderRadius.xl, borderWidth: 1, borderStyle: 'dashed', marginTop: spacing.sm },
  addBtnText: { marginLeft: spacing.sm, fontWeight: '600', fontSize: typography.fontSizes.sm },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xl },
  summaryItem: { width: '45%' },
  summaryLabel: { fontSize: typography.fontSizes.xs, marginBottom: 4 },
  summaryValue: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
  resultBox: { padding: spacing.xl, borderRadius: borderRadius['2xl'], alignItems: 'center', marginBottom: spacing.md },
  resultLabel: { fontSize: typography.fontSizes.sm, marginBottom: 4 },
  resultValue: { fontSize: typography.fontSizes['3xl'], fontWeight: typography.fontWeights.bold },
  tipCard: { flexDirection: 'row', margin: spacing.xl, padding: spacing.lg, borderRadius: borderRadius['2xl'], gap: spacing.md },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold, marginBottom: 4 },
  tipText: { fontSize: typography.fontSizes.xs, lineHeight: 18 },
  suggestedBox: { alignItems: 'flex-end', marginTop: spacing.sm },
  suggestedText: { fontSize: typography.fontSizes.xs, fontStyle: 'italic' },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
