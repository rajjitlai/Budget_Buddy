
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart3, Menu } from 'lucide-react-native';
import { RefreshButton } from '@/components/RefreshButton';
import { AnimatedScale } from '@/components/ui/AnimatedScale';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Account, Transaction, MonthlyPlan } from '@/lib/types';
import { getAccounts } from '@/lib/services/accounts';
import { getTransactions } from '@/lib/services/transactions';
import { getCurrentMonthlyPlan } from '@/lib/services/monthlyPlans';
import { AdvancedCharts } from '@/components/AdvancedCharts';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function ChartsScreen() {
  const { backgroundColor, textPrimary, textSecondary } = useTheme();
  const navigation = useNavigation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadAccounts(), loadTransactions(), loadMonthlyPlan()]);
    } catch (error) {
      console.error('Error loading charts data:', error);
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
      setTransactions(transactionDocs);
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

  const handleRefresh = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refreshData();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={[styles.loadingText, { color: textSecondary }]}>
            Loading charts...
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
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <AnimatedScale 
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10`, marginRight: spacing.md }]}
              >
                <Menu size={22} color={textSecondary} />
              </AnimatedScale>
              <View style={styles.headerIcon}>
                <BarChart3 size={28} color={colors.primary[500]} />
              </View>
              <View>
                <Text style={[styles.title, { color: textPrimary }]}>Financial Charts</Text>
                <Text style={[styles.subtitle, { color: textSecondary }]}>
                  Visualize your data
                </Text>
              </View>
            </View>
            <RefreshButton onPress={refreshData} refreshing={refreshing} />
          </View>
        </Animated.View>

        {/* Charts */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <AdvancedCharts
            accounts={accounts}
            transactions={transactions}
            monthlyPlan={monthlyPlan || undefined}
          />
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
    marginTop: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    marginHorizontal: spacing.xs,
    marginTop: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

