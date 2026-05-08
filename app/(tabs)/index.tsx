
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { RefreshButton } from '@/components/RefreshButton';
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
  MonthlyPlan,
} from '@/lib/types';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/lib/services/accounts';
import { getTransactions } from '@/lib/services/transactions';
import { getCurrentMonthlyPlan } from '@/lib/services/monthlyPlans';
import { NetWorthCard } from '@/components/NetWorthCard';
import { BudgetHealthCard } from '@/components/BudgetHealthCard';
import { BalanceCard } from '@/components/BalanceCard';
import { AccountList } from '@/components/AccountList';
import { TransactionItem } from '@/components/TransactionItem';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';

export default function DashboardScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewAllModalVisible, setIsViewAllModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountIcon, setNewAccountIcon] = useState('🏦');
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const netWorth = calculateNetWorth(accounts);

  useEffect(() => {
    loadAccounts();
    loadRecentTransactions();
    loadMonthlyPlan();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadAccounts(), loadRecentTransactions(), loadMonthlyPlan()]);
    } finally {
      setRefreshing(false);
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

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountDocs = await getAccounts();
      const accountList: Account[] = accountDocs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        balance: doc.balance,
        icon: doc.icon,
        color: doc.color,
      }));
      // Sort accounts by balance (lowest first)
      accountList.sort((a, b) => a.balance - b.balance);
      setAccounts(accountList);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const transactionDocs = await getTransactions({ limit: 10 }); // Get 10 most recent
      setTransactions(transactionDocs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
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

      await loadAccounts();
      await loadRecentTransactions();
      setIsAddModalVisible(false);
      resetForm();

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
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
      await updateAccount(editingAccount.id, {
        name: newAccountName,
        type: newAccountType,
        balance: parseFloat(newAccountBalance) || 0,
        icon: newAccountIcon || editingAccount.icon,
        color: editingAccount.color, // Keep existing color
      });

      await loadAccounts();
      setIsEditModalVisible(false);
      resetForm();

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update account');
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    // Check if account has transactions
    try {
      const transactions = await getTransactions({ accountId: account.id });
      
      if (transactions.length > 0) {
        Alert.alert(
          'Cannot Delete Account',
          `This account has ${transactions.length} transaction(s). Please delete or reassign those transactions first.`,
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Delete Account',
        `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAccount(account.id);
                await loadAccounts();

                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to delete account');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check account transactions');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Decorative Background Shape */}
        <View style={styles.decorativeBackground} />

        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800).springify()}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: textSecondary }]}>
                {getGreeting()},
              </Text>
              <Text style={[styles.title, { color: textPrimary }]}>
                Budget Buddy
              </Text>
            </View>
            <View style={styles.headerActions}>
              <RefreshButton onPress={refreshData} refreshing={refreshing} />
            </View>
          </View>
        </Animated.View>

        {/* Net Worth Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(800).springify()}>
          <NetWorthCard totalBalance={netWorth} />
        </Animated.View>

        {/* Budget Health Card */}
        {monthlyPlan && (
          <Animated.View entering={FadeInDown.delay(400).duration(800).springify()}>
            <BudgetHealthCard plan={monthlyPlan} transactions={transactions} />
          </Animated.View>
        )}

        {/* Accounts Section */}
        <Animated.View entering={FadeInDown.delay(500).duration(800).springify()}>
          <SectionHeader
            title="Your Accounts"
            subtitle={`${accounts.length} Total`}
            actionLabel={showAllAccounts ? "Show less" : "See all"}
            onAction={() => {
              if (accounts.length > 3) {
                setShowAllAccounts(!showAllAccounts);
              } else {
                setIsViewAllModalVisible(true);
              }
            }}
          />
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : accounts.length > 0 ? (
            <View style={styles.accountsContainer}>
              {(showAllAccounts ? accounts : accounts.slice(0, 3)).map((account, index) => (
                <Animated.View 
                  key={account.id} 
                  entering={FadeInDown.delay(600 + index * 100).duration(600).springify()}
                >
                  <BalanceCard
                    account={account}
                    onEdit={() => handleEditAccount(account)}
                    onDelete={() => handleDeleteAccount(account)}
                  />
                </Animated.View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: cardBackground }]}>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                No accounts yet. Add your first account to get started!
              </Text>
            </View>
          )}
          <View style={styles.addButtonContainer}>
            <PrimaryButton
              title="Add Account"
              onPress={() => setIsAddModalVisible(true)}
              icon={<Plus size={18} color="#ffffff" />}
              fullWidth
              size="lg"
            />
          </View>
        </Animated.View>

        {/* Recent Transactions Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.recentTransactionsContainer}>
          <SectionHeader
            title="Recent Transactions"
            subtitle="Your latest activity"
            actionLabel="See all"
            onAction={() => router.push('/(tabs)/transactions')}
          />
          {transactionsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
            </View>
          ) : transactions.length > 0 ? (
            <View style={styles.transactionsContainer}>
              {transactions.map((transaction) => {
                const sourceAccount = accounts.find((acc) => acc.id === transaction.sourceAccountId);
                const destinationAccount = transaction.destinationAccountId
                  ? accounts.find((acc) => acc.id === transaction.destinationAccountId)
                  : undefined;
                return (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    sourceAccount={sourceAccount}
                    destinationAccount={destinationAccount}
                  />
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: cardBackground }]}>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                No transactions yet. Add your first transaction to get started!
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Add Account Modal */}
      <ModalSheet
        visible={isAddModalVisible}
        onClose={() => {
          setIsAddModalVisible(false);
          resetForm();
        }}
        title="Add New Account"
      >
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
          <InputField
            label="Initial Balance"
            placeholder="0"
            value={newAccountBalance}
            onChangeText={setNewAccountBalance}
            keyboardType="numeric"
          />
          <View style={styles.modalActions}>
            <PrimaryButton
              title="Cancel"
              onPress={() => {
                setIsAddModalVisible(false);
                resetForm();
              }}
              variant="ghost"
              style={styles.cancelButton}
            />
            <PrimaryButton
              title="Add Account"
              onPress={handleAddAccount}
              disabled={!newAccountName || !newAccountType || !newAccountBalance}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ModalSheet>

      {/* Edit Account Modal */}
      <ModalSheet
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          resetForm();
        }}
        title="Edit Account"
      >
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
          <InputField
            label="Balance"
            placeholder="0"
            value={newAccountBalance}
            onChangeText={setNewAccountBalance}
            keyboardType="numeric"
          />
          <View style={styles.modalActions}>
            <PrimaryButton
              title="Cancel"
              onPress={() => {
                setIsEditModalVisible(false);
                resetForm();
              }}
              variant="ghost"
              style={styles.cancelButton}
            />
            <PrimaryButton
              title="Update Account"
              onPress={handleUpdateAccount}
              disabled={!newAccountName || !newAccountType || !newAccountBalance}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ModalSheet>

      {/* View All Accounts Modal */}
      <ModalSheet
        visible={isViewAllModalVisible}
        onClose={() => setIsViewAllModalVisible(false)}
        title="All Accounts"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.viewAllModalScroll}
          contentContainerStyle={styles.viewAllModalContent}
        >
          {loading ? (
            <View style={styles.viewAllLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : accounts.length > 0 ? (
            <AccountList 
              accounts={accounts}
              onAccountEdit={(account) => {
                setIsViewAllModalVisible(false);
                handleEditAccount(account);
              }}
              onAccountDelete={handleDeleteAccount}
            />
          ) : (
            <View style={[styles.viewAllEmptyContainer, { backgroundColor: cardBackground }]}>
              <Text style={[styles.viewAllEmptyText, { color: textSecondary }]}>
                No accounts yet. Add your first account to get started!
              </Text>
            </View>
          )}
        </ScrollView>
      </ModalSheet>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginLeft: spacing.xs,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  addButtonContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  accountsContainer: {
    paddingHorizontal: spacing.xl,
  },
  recentTransactionsContainer: {
    marginTop: spacing.xl,
  },
  transactionsContainer: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyContainer: {
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  modalContent: {
    paddingBottom: spacing['3xl'],
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
  viewAllModalScroll: {
    maxHeight: 600,
  },
  viewAllModalContent: {
    paddingBottom: spacing.xl,
  },
  viewAllLoadingContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  viewAllEmptyContainer: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  viewAllEmptyText: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  suggestionScroll: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  suggestionContent: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
});
