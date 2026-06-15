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
import { getCurrentMonthlyPlan, saveMonthlyPlan, deleteCurrentMonthlyPlan } from '@/lib/services/monthlyPlans';
import { getTransactions } from '@/lib/services/transactions';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AnimatedScale } from '@/components/ui/AnimatedScale';

const SUGGESTED_FIXED = ['Rent', 'Electricity', 'Water', 'Internet', 'Insurance', 'Loan EMI', 'Groceries'];
const SUGGESTED_SAVINGS = ['Emergency Fund', 'Retirement', 'Mutual Funds', 'Stocks', 'Vacation'];
const SUGGESTED_ALLOWANCES = ['Dining Out', 'Shopping', 'Entertainment', 'Cafes', 'Gym / Health'];

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
  const [suggesting, setSuggesting] = useState(false);
  const [hasExistingPlan, setHasExistingPlan] = useState(false);

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
        setHasExistingPlan(true);
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
      } else {
        setHasExistingPlan(false);
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

  const handleAISuggest = async () => {
    const income = parseFloat(salary) || 0;
    if (income <= 0) return;
    setSuggesting(true);
    try {
      const transactions = await getTransactions({});
      const now = new Date();
      const last3Months = transactions.filter((t) => {
        const d = new Date(t.date);
        const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        return monthsAgo >= 0 && monthsAgo < 3 && t.type === 'expense';
      });

      const categoryMap: Record<string, number> = {};
      last3Months.forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

      const totalSpent3m = Object.values(categoryMap).reduce((s, v) => s + v, 0);
      const avgMonthlySpend = totalSpent3m / 3;

      if (avgMonthlySpend > 0 && transactions.length > 0) {
        const topCategories = Object.entries(categoryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);

        const newFixed: PlanItem[] = topCategories.slice(0, 2).map(([cat, total], i) => ({
          id: `suggest-fixed-${i}`,
          label: cat,
          amount: Math.round(total / 3).toString(),
        }));
        const savingsPct = Math.max(10, Math.min(30, Math.round(((income - avgMonthlySpend) / income) * 100)));
        const newSavings: PlanItem[] = [{ id: 'suggest-savings', label: 'Savings Goal', amount: Math.round(income * (savingsPct / 100)).toString() }];
        const spendAmt = topCategories.slice(2).reduce((s, [, v]) => s + Math.round(v / 3), 0) || Math.round(income * 0.2);
        const newAllowances: PlanItem[] = [{ id: 'suggest-variable', label: 'Variable Spending', amount: spendAmt.toString() }];

        setFixedExpenses(newFixed);
        setSavingsGoals(newSavings);
        setAllowances(newAllowances);
      } else {
        setFixedExpenses([
          { id: 'suggest-rent', label: 'Essentials', amount: Math.round(income * 0.5).toString() },
        ]);
        setSavingsGoals([{ id: 'suggest-savings', label: 'Savings Goal', amount: Math.round(income * 0.2).toString() }]);
        setAllowances([{ id: 'suggest-variable', label: 'Discretionary', amount: Math.round(income * 0.3).toString() }]);
      }

      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error('AI Suggest error:', e);
    } finally {
      setSuggesting(false);
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
      setHasExistingPlan(true);
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

  const handleDeletePlan = () => {
    const performDelete = async () => {
      try {
        setLoading(true);
        await deleteCurrentMonthlyPlan();
        
        // Reset states
        setSalary('');
        setFixedExpenses([
          { id: '1', label: 'Rent / Mortgage', amount: '' },
          { id: '2', label: 'Utilities & Bills', amount: '' },
        ]);
        setSavingsGoals([
          { id: '1', label: 'Emergency Fund', amount: '' },
        ]);
        setAllowances([
          { id: '1', label: 'Variable Spending', amount: '' },
        ]);
        setHasExistingPlan(false);
        setCurrentStep('income');
        
        triggerRefresh();
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (Platform.OS === 'web') {
          window.alert('Budget plan reset successfully.');
        } else {
          Alert.alert('Success', 'Budget plan reset successfully.');
        }
      } catch (err) {
        console.error('Error deleting plan:', err);
        Alert.alert('Error', 'Failed to delete budget plan.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete the currently applied monthly plan? This will clear all planned budget limits.')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Reset Budget Plan',
        'Are you sure you want to delete the currently applied monthly plan? This will clear all planned budget limits.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
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

  const renderQuickAdd = (
    suggestions: string[],
    currentItems: PlanItem[],
    setFn: React.Dispatch<React.SetStateAction<PlanItem[]>>
  ) => {
    const activeLabels = currentItems.map(item => item.label.toLowerCase().trim());
    return (
      <View style={styles.suggestionsRow}>
        {suggestions.map((s) => {
          const isActive = activeLabels.includes(s.toLowerCase().trim());
          return (
            <TouchableOpacity
              key={s}
              onPress={() => {
                if (isActive) {
                  setFn(prev => prev.filter(item => item.label.toLowerCase().trim() !== s.toLowerCase().trim()));
                } else {
                  setFn(prev => {
                    const emptyIndex = prev.findIndex(item => !item.label.trim());
                    if (emptyIndex !== -1) {
                      const updated = [...prev];
                      updated[emptyIndex] = { ...updated[emptyIndex], label: s };
                      return updated;
                    }
                    return [...prev, { id: Math.random().toString(), label: s, amount: '' }];
                  });
                }
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.suggestionChip,
                {
                  backgroundColor: isActive ? `${colors.primary[500]}15` : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                  borderColor: isActive ? colors.primary[500] : borderColor,
                }
              ]}
            >
              <Text style={[
                styles.suggestionChipText,
                { color: isActive ? colors.primary[500] : textSecondary }
              ]}>
                {isActive ? `✓ ${s}` : `+ ${s}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderRatioVisualizer = () => {
    if (totalIncome <= 0) return null;
    
    const fixedPct = Math.min(100, Math.max(0, (totalFixed / totalIncome) * 100));
    const savingsPct = Math.min(100, Math.max(0, (totalSavings / totalIncome) * 100));
    const spendingPct = Math.min(100, Math.max(0, (totalSpending / totalIncome) * 100));
    const leftoverPct = Math.max(0, 100 - fixedPct - savingsPct - spendingPct);
    
    return (
      <View style={[styles.visualizerCard, { backgroundColor: cardBackground, borderColor }]}>
        <Text style={[styles.visualizerTitle, { color: textPrimary }]}>Live Allocation Ratios</Text>
        
        <View style={styles.segmentBar}>
          {fixedPct > 0 && (
            <View style={[styles.barSegment, { flex: fixedPct, backgroundColor: colors.info }]} />
          )}
          {savingsPct > 0 && (
            <View style={[styles.barSegment, { flex: savingsPct, backgroundColor: colors.success }]} />
          )}
          {spendingPct > 0 && (
            <View style={[styles.barSegment, { flex: spendingPct, backgroundColor: colors.warning }]} />
          )}
          {leftoverPct > 0 && (
            <View style={[styles.barSegment, { flex: leftoverPct, backgroundColor: isDarkMode ? colors.slate[700] : colors.slate[300] }]} />
          )}
        </View>
        
        <View style={styles.legendContainer}>
          <LegendItem label="Fixed (Needs)" value={`${fixedPct.toFixed(0)}%`} target="50%" color={colors.info} />
          <LegendItem label="Savings" value={`${savingsPct.toFixed(0)}%`} target="20%" color={colors.success} />
          <LegendItem label="Allowances (Wants)" value={`${spendingPct.toFixed(0)}%`} target="30%" color={colors.warning} />
          <LegendItem label="Leftover" value={`${leftoverPct.toFixed(0)}%`} color={isDarkMode ? colors.slate[400] : colors.slate[600]} />
        </View>
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
          <View style={{ flex: 1 }}>
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
              {parseFloat(salary) > 0 && (
                <TouchableOpacity
                  onPress={handleAISuggest}
                  disabled={suggesting}
                  style={[styles.aiSuggestBtn, { backgroundColor: `${colors.primary[500]}12`, borderColor: `${colors.primary[500]}30` }]}
                >
                  {suggesting ? (
                    <ActivityIndicator size="small" color={colors.primary[500]} />
                  ) : (
                    <Sparkles size={16} color={colors.primary[500]} />
                  )}
                  <Text style={[styles.aiSuggestText, { color: colors.primary[500] }]}>
                    {suggesting ? 'Calculating...' : '✨ AI Suggest Allocations'}
                  </Text>
                </TouchableOpacity>
              )}
              {hasExistingPlan && (
                <TouchableOpacity
                  onPress={handleDeletePlan}
                  style={[styles.deletePlanBtn, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30`, marginTop: spacing.sm }]}
                >
                  <Trash2 size={16} color={colors.error} />
                  <Text style={[styles.deletePlanText, { color: colors.error }]}>
                    Reset Current Plan
                  </Text>
                </TouchableOpacity>
              )}
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
              <Text style={[styles.cardHint, { color: textSecondary }]}>Non-negotiable bills, necessities, and rent.</Text>
              {renderSectionItems(fixedExpenses, setFixedExpenses)}
              {renderQuickAdd(SUGGESTED_FIXED, fixedExpenses, setFixedExpenses)}
              {renderRatioVisualizer()}
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
              <Text style={[styles.cardHint, { color: textSecondary }]}>Prioritize your future self (emergency fund, investments, etc.).</Text>
              {renderSectionItems(savingsGoals, setSavingsGoals)}
              {renderQuickAdd(SUGGESTED_SAVINGS, savingsGoals, setSavingsGoals)}
              {renderRatioVisualizer()}
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
              <Text style={[styles.cardHint, { color: textSecondary }]}>Food, fun, cafe, shopping, and lifestyle spending.</Text>
              {renderSectionItems(allowances, setAllowances)}
              {renderQuickAdd(SUGGESTED_ALLOWANCES, allowances, setAllowances)}
              {renderRatioVisualizer()}
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
                <SummaryItem label="Fixed" value={totalFixed} color={colors.info} currency={user?.currency} />
                <SummaryItem label="Savings" value={totalSavings} color={colors.success} currency={user?.currency} />
                <SummaryItem label="Flexible" value={totalSpending} color={colors.warning} currency={user?.currency} />
              </View>

              {renderRatioVisualizer()}

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

function LegendItem({ label, value, target, color }: { label: string; value: string; target?: string; color: string }) {
  const { textPrimary, textSecondary } = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={styles.legendHeader}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={[styles.legendLabel, { color: textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.legendValue, { color: textPrimary }]}>
        {value} {target ? `(Target ${target})` : ''}
      </Text>
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
  aiSuggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  aiSuggestText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  suggestionChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '500',
  },
  visualizerCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginVertical: spacing.md,
  },
  visualizerTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  segmentBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: spacing.md,
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  legendItem: {
    minWidth: '45%',
    marginBottom: 4,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: typography.fontSizes.xs,
  },
  legendValue: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: 'bold',
    marginLeft: 14,
  },
  deletePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  deletePlanText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
});
