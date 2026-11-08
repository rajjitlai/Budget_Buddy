
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Plus, Bell, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { AnimatedScale } from '@/components/ui/AnimatedScale';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'expo-router';
import {
  Account,
  calculateNetWorth,
  formatCurrency,
  SUGGESTED_ACCOUNT_TYPES,
  Transaction,
} from '@/lib/types';
import { createAccount, updateAccount, deleteAccount } from '@/lib/services/accounts';
import { useData } from '@/lib/DataContext';
import { getTransactions, createTransaction } from '@/lib/services/transactions';
import { isSameMonth } from '@/lib/utils/dates';
import { generateAlerts } from '@/lib/services/notifications';
import { NetWorthCard } from '@/components/NetWorthCard';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionItem } from '@/components/TransactionItem';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { InputField } from '@/components/ui/InputField';
import { MilestoneBanner } from '@/components/ui/MilestoneBanner';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { user } = useUser();
  const {
    accounts: cachedAccounts,
    transactions,
    monthlyPlan,
    loading,
    unreadCount,
    refreshKey,
    triggerRefresh,
    triggerNotifRefresh,
  } = useData();
  const router = useRouter();
    const accounts = useMemo(
    () => [...cachedAccounts].sort((a, b) => a.balance - b.balance),
    [cachedAccounts]
  );
  
  const displayCurrency = (amount: number) => formatCurrency(amount, user?.currency);
  const goToTransactions = useCallback(
    () => router.push('/(tabs)/transactions'),
    [router]
  );
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountIcon, setNewAccountIcon] = useState('🏦');
  const [refreshing, setRefreshing] = useState(false);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const netWorth = calculateNetWorth(accounts);

  const thisMonth = useMemo(() => {
    const filtered = transactions.filter(t => isSameMonth(t.date));
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savingsPct = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
    return { income, expenses, savingsPct, net: income - expenses };
  }, [transactions]);

  useEffect(() => {
    if (refreshing) setRefreshing(false);
  }, [refreshKey, refreshing]);

  const runAlertGeneration = async (txns: Transaction[]) => {
    try {
      const monthTxns = txns.filter(t => isSameMonth(t.date));
      const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const savingsPct = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
      const categoryMap: Record<string, number> = {};
      monthTxns.filter(t => t.type === 'expense').forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
      const categoryBreakdown = Object.entries(categoryMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
      await generateAlerts({
        salary: monthlyPlan?.salary ?? 0,
        monthlyExpenses: expenses,
        savingsRate: savingsPct,
        categoryBreakdown,
        totalExpenses: expenses,
        hasTransactionsThisMonth: monthTxns.length > 0,
      });
      triggerNotifRefresh();
    } catch (e) {
      console.error('Error generating alerts:', e);
    }
  };

  // Generate budget/overspend alerts whenever the cached data reloads.
  const alertsRunForRefresh = useRef(-1);
  useEffect(() => {
    if (loading || alertsRunForRefresh.current === refreshKey) return;
    alertsRunForRefresh.current = refreshKey;
    runAlertGeneration(transactions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, refreshKey, transactions, monthlyPlan]);

  const refreshData = () => {
    setRefreshing(true);
    triggerRefresh();
  };

  const resetForm = () => {
    setNewAccountName('');
    setNewAccountType('');
    setNewAccountBalance('');
    setNewAccountIcon('🏦');
    setEditingAccount(null);
  };

  const handleAddAccount = async () => {
    if (!newAccountName || !newAccountType || !newAccountBalance) return;

    try {
      const colorOptions = [
        colors.primary[500],
        colors.info,
        colors.warning,
        '#8b5cf6',
        '#ec4899',
        '#f97316',
      ];

      const accountData = {
        name: newAccountName,
        type: newAccountType,
        balance: parseFloat(newAccountBalance) || 0,
        icon: newAccountIcon || '🏦',
        color: colorOptions[accounts.length % colorOptions.length],
      };

      await createAccount(accountData);

      triggerRefresh();
      setIsAddModalVisible(false);
      resetForm();

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setNewAccountName(account.name);
    setNewAccountType(account.type);
    setNewAccountBalance(account.balance.toString());
    setNewAccountIcon(account.icon);
    setIsEditModalVisible(true);
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount || !newAccountName || !newAccountType) return;

    try {
      const oldBalance = editingAccount.balance;
      const newBalance = parseFloat(newAccountBalance) || 0;
      const balanceDifference = newBalance - oldBalance;

      // 1. Update general account settings (excluding balance for now if it changed)
      await updateAccount(editingAccount.id, {
        name: newAccountName,
        type: newAccountType,
        icon: newAccountIcon || editingAccount.icon,
        color: editingAccount.color,
      });

      // 2. Log adjustment transaction if balance actually changed
      if (balanceDifference !== 0) {
        const type = balanceDifference > 0 ? 'income' : 'expense';
        const amount = Math.abs(balanceDifference);

        await createTransaction({
          amount,
          category: '🛠️ Adjustment',
          sourceAccountId: editingAccount.id,
          destinationAccountId: undefined,
          notes: 'Balance adjustment',
          date: new Date().toISOString().split('T')[0],
          type,
        });
      }

      triggerRefresh();
      setIsEditModalVisible(false);
      resetForm();

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update account');
    }
  };

  const confirmDelete = (message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(message)) onConfirm();
    } else {
      Alert.alert('Delete Account', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onConfirm },
      ]);
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    try {
      const linkedTransactions = await getTransactions({ accountId: account.id });

      // Close the modal first — on iOS, Alert is swallowed when a Modal is still mounted
      setIsEditModalVisible(false);
      resetForm();

      const doDelete = async () => {
        try {
          await deleteAccount(account.id);
          triggerRefresh();
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (error) {
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete account');
        }
      };

      setTimeout(() => {
        if (linkedTransactions.length > 0) {
          confirmDelete(
            `"${account.name}" has ${linkedTransactions.length} transaction(s). Deleting it will also permanently remove all linked transactions. This cannot be undone.\n\nConfirm Force Delete?`,
            doDelete
          );
        } else {
          confirmDelete(
            `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
            doDelete
          );
        }
      }, 300);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to check account transactions');
    }
  };

  const closeAddAccountModal = () => {
    setIsAddModalVisible(false);
    resetForm();
  };

  const closeEditAccountModal = () => {
    setIsEditModalVisible(false);
    resetForm();
  };

  const renderAccountForm = (mode: 'add' | 'edit') => {
    const isAdd = mode === 'add';
    return (
      <View style={styles.modalContent}>
        <InputField
          label="Account Name"
          placeholder="e.g., Emergency Fund"
          value={newAccountName}
          onChangeText={setNewAccountName}
        />
        <View style={styles.twoColumn}>
          <View style={styles.flex2}>
            <InputField
              label="Account Type"
              placeholder="e.g., Savings"
              value={newAccountType}
              onChangeText={setNewAccountType}
            />
          </View>
          <View style={styles.flex1}>
            <InputField
              label="Icon/Emoji"
              placeholder="🏦"
              value={newAccountIcon}
              onChangeText={setNewAccountIcon}
              maxLength={2}
            />
          </View>
        </View>
        {isAdd && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionScroll}
            contentContainerStyle={styles.suggestionContent}
          >
            {SUGGESTED_ACCOUNT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  const [emoji, ...nameParts] = type.split(' ');
                  setNewAccountType(nameParts.join(' '));
                  setNewAccountIcon(emoji);
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.suggestionChip,
                  { backgroundColor: cardBackground, borderColor }
                ]}
              >
                <Text style={{ color: textPrimary }}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <InputField
          label={isAdd ? 'Initial Balance' : 'Balance'}
          placeholder="0"
          value={newAccountBalance}
          onChangeText={setNewAccountBalance}
          keyboardType="numeric"
        />
        <View style={styles.modalActions}>
          <PrimaryButton
            title="Cancel"
            onPress={isAdd ? closeAddAccountModal : closeEditAccountModal}
            variant="ghost"
            style={styles.cancelButton}
          />
          <PrimaryButton
            title={isAdd ? 'Add Account' : 'Update Account'}
            onPress={isAdd ? handleAddAccount : handleUpdateAccount}
            disabled={!newAccountName || !newAccountType || !newAccountBalance}
            style={styles.submitButton}
          />
        </View>
        {!isAdd && editingAccount && (
          <TouchableOpacity
            onPress={() => handleDeleteAccount(editingAccount)}
            style={styles.deleteAccountBtn}
          >
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 60], [1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 60], [0, -20], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.decorativeBackground} />
      
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cinematic Header */}
        <ScreenHeader
          style={headerStyle}
          greeting={`${getGreeting()},`}
          title={`${user?.name || 'Buddy'} 👋`}
          right={
            <>
              <AnimatedScale
                onPress={() => router.push('/(tabs)/notifications')}
                style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}
              >
                <Bell size={20} color={textSecondary} />
                {unreadCount > 0 && (
                  <View style={[styles.bellBadge, { backgroundColor: colors.error }]}>
                    <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </AnimatedScale>
              <AnimatedScale 
                onPress={refreshData}
                style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}
              >
                <RefreshCw size={20} color={refreshing ? colors.primary[500] : textSecondary} />
              </AnimatedScale>
            </>
          }
        />

        {/* Net Worth Hero */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <NetWorthCard totalBalance={netWorth} />
        </Animated.View>

        {/* This Month Analytics */}
        {transactions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.analyticsRow}>
            <View style={[styles.analyticsCard, { backgroundColor: `${colors.success}12`, borderColor: `${colors.success}30` }]}>
              <TrendingUp size={16} color={colors.success} />
              <Text style={[styles.analyticsLabel, { color: textSecondary }]}>Income</Text>
              <Text style={[styles.analyticsValue, { color: colors.success }]} numberOfLines={1}>
                {displayCurrency(thisMonth.income)}
              </Text>
            </View>
            <View style={[styles.analyticsCard, { backgroundColor: `${colors.error}12`, borderColor: `${colors.error}30` }]}>
              <TrendingDown size={16} color={colors.error} />
              <Text style={[styles.analyticsLabel, { color: textSecondary }]}>Expenses</Text>
              <Text style={[styles.analyticsValue, { color: colors.error }]} numberOfLines={1}>
                {displayCurrency(thisMonth.expenses)}
              </Text>
            </View>
            <View style={[styles.analyticsCard, {
              backgroundColor: thisMonth.savingsPct >= 0 ? `${colors.primary[500]}12` : `${colors.warning}12`,
              borderColor: thisMonth.savingsPct >= 0 ? `${colors.primary[500]}30` : `${colors.warning}30`,
            }]}>
              <Minus size={16} color={thisMonth.savingsPct >= 0 ? colors.primary[500] : colors.warning} />
              <Text style={[styles.analyticsLabel, { color: textSecondary }]}>Saved</Text>
              <Text style={[styles.analyticsValue, { color: thisMonth.savingsPct >= 0 ? colors.primary[500] : colors.warning }]} numberOfLines={1}>
                {thisMonth.savingsPct}%
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Milestone Savings Celebration Banner */}
        {thisMonth && thisMonth.savingsPct >= 20 && (
          <MilestoneBanner
            savingsRate={thisMonth.savingsPct}
            surplus={thisMonth.net}
            currency={user?.currency}
            onPress={() => router.push('/(tabs)/charts')}
          />
        )}

        {/* Accounts Section */}
        <View style={styles.section}>
          <SectionHeader
            title="My Accounts"
            subtitle={`${accounts.length} Total`}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountsScroll}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Skeleton width={200} height={180} radius={borderRadius['3xl']} />
                <Skeleton width={200} height={180} radius={borderRadius['3xl']} />
                <Skeleton width={200} height={180} radius={borderRadius['3xl']} />
              </View>
            ) : (
              accounts.map((account, index) => (
                <Animated.View 
                  key={account.id} 
                  entering={FadeInRight.delay(300 + index * 100).springify()}
                >
                  <BalanceCard
                    account={account}
                    onPress={() => handleEditAccount(account)}
                  />
                </Animated.View>
              ))
            )}
            {!loading && (
              <AnimatedScale 
                onPress={() => setIsAddModalVisible(true)}
                style={[styles.addAccountCard, { backgroundColor: cardBackground, borderColor }]}
              >
                <View style={[styles.addIconContainer, { backgroundColor: `${colors.primary[500]}15` }]}>
                  <Plus size={24} color={colors.primary[500]} />
                </View>
                <Text style={[styles.addAccountLabel, { color: textPrimary }]}>Add Account</Text>
              </AnimatedScale>
            )}
          </ScrollView>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Activity"
            actionLabel="View All"
            onAction={goToTransactions}
          />

          {loading ? (
            <ActivityIndicator color={colors.primary[500]} style={{ marginTop: spacing.xl }} />
          ) : transactions.length > 0 ? (
            <View style={styles.transactionsContainer}>
              {transactions.slice(0, 5).map((transaction, index) => (
                <Animated.View 
                  key={transaction.id} 
                  entering={FadeInDown.delay(500 + index * 50).springify()}
                >
                  <TransactionItem
                    transaction={transaction}
                    sourceAccount={accounts.find((a) => a.id === transaction.sourceAccountId)}
                    destinationAccount={accounts.find((a) => a.id === transaction.destinationAccountId)}
                    onPress={goToTransactions}
                  />
                </Animated.View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: cardBackground }]}>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                No recent transactions
              </Text>
            </View>
          )}
        </View>
        
        {/* Bottom Spacing for FAB and Floating Tab Bar */}
        <View style={{ height: 140 }} />
      </Animated.ScrollView>

      {/* Floating Action Button - Navigates to Add Transaction */}
      <AnimatedScale
        onPress={() => router.push('/(tabs)/transactions')}
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary[500],
            bottom: Math.max(insets.bottom, 16) + 16,
          },
        ]}
        haptic="heavy"
      >
        <Plus size={28} color="#ffffff" />
      </AnimatedScale>

      {/* Add Account Modal */}
      <ModalSheet
        visible={isAddModalVisible}
        onClose={closeAddAccountModal}
        title="Add New Account"
      >
        {renderAccountForm('add')}
      </ModalSheet>

      {/* Edit Account Modal */}
      <ModalSheet
        visible={isEditModalVisible}
        onClose={closeEditAccountModal}
        title="Edit Account"
      >
        {renderAccountForm('edit')}
      </ModalSheet>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  decorativeBackground: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${colors.primary[500]}08`,
    zIndex: -1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
  },
  section: {
    marginTop: spacing.xl,
  },
  accountsScroll: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
  },
  addAccountCard: {
    width: 160,
    height: 180,
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
    marginRight: spacing.xl,
  },
  addIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  addAccountLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  transactionsContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing['3xl'],
    right: spacing['2xl'],
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
  },
  modalContent: {
    paddingBottom: spacing['3xl'],
  },
  twoColumn: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  suggestionScroll: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  suggestionContent: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  deleteAccountBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteAccountText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  analyticsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  analyticsCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.xs,
  },
  analyticsLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  analyticsValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
});
