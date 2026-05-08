
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
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Plus, Bell, RefreshCw, Sparkles, Menu } from 'lucide-react-native';
import { AnimatedScale } from '@/components/ui/AnimatedScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { RefreshButton } from '@/components/RefreshButton';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
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
  const navigation = useNavigation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  const displayCurrency = (amount: number) => formatCurrency(amount, user?.currency);
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
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerLeft}>
            <AnimatedScale 
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10`, marginRight: spacing.md }]}
            >
              <Menu size={22} color={textSecondary} />
            </AnimatedScale>
            <View>
              <Text style={[styles.greeting, { color: textSecondary }]}>
                {getGreeting()},
              </Text>
              <Text style={[styles.title, { color: textPrimary }]}>
                {user?.name || 'Buddy'} 👋
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <AnimatedScale 
              onPress={refreshData}
              style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}
            >
              <RefreshCw size={20} color={textSecondary} />
            </AnimatedScale>
          </View>
        </Animated.View>

        {/* Bento Grid - Phase 1 */}
        <View style={styles.bentoGrid}>
          {/* Net Worth - Large Hero */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.bentoHero}>
            <NetWorthCard totalBalance={netWorth} />
          </Animated.View>

          <View style={styles.bentoRow}>
            {/* Budget Health - Medium Card */}
            {monthlyPlan && (
              <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.bentoMain}>
                <BudgetHealthCard plan={monthlyPlan} transactions={transactions} variant="compact" />
              </Animated.View>
            )}

            {/* AI Insights - Small Card */}
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.bentoSide}>
              <AnimatedScale 
                onPress={() => router.push('/(tabs)/insights')}
                style={[styles.miniCard, { backgroundColor: cardBackground, borderColor }]}
              >
                <View style={[styles.miniIcon, { backgroundColor: `${colors.warning}15` }]}>
                  <Sparkles size={20} color={colors.warning} />
                </View>
                <Text style={[styles.miniLabel, { color: textSecondary }]}>AI Advice</Text>
                <Text style={[styles.miniValue, { color: textPrimary }]}>Check Now</Text>
              </AnimatedScale>
            </Animated.View>
          </View>
        </View>

        {/* Accounts Section */}
        <View style={styles.section}>
          <SectionHeader
            title="My Accounts"
            subtitle={`${accounts.length} Total`}
            actionLabel={showAllAccounts ? "Show Less" : "See All"}
            onAction={() => setShowAllAccounts(!showAllAccounts)}
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
              accounts.slice(0, showAllAccounts ? accounts.length : 5).map((account, index) => (
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
            onAction={() => router.push('/(tabs)/transactions')}
          />

          {transactionsLoading ? (
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
                    onPress={() => router.push('/(tabs)/transactions')}
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

      {/* Floating Action Button */}
      <AnimatedScale
        onPress={() => setIsAddModalVisible(true)}
        style={[styles.fab, { backgroundColor: colors.primary[500] }]}
        haptic="heavy"
      >
        <Plus size={28} color="#ffffff" />
      </AnimatedScale>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoGrid: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  bentoHero: {
    marginHorizontal: -spacing.xl, // Neutralize container padding for full width hero
  },
  bentoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: -spacing.md, // Tighten up the grid
  },
  bentoMain: {
    flex: 1.8,
  },
  bentoSide: {
    flex: 1,
  },
  miniCard: {
    padding: spacing.lg,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    minHeight: 120,
    ...shadows.md,
    justifyContent: 'space-between',
  },
  miniIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  miniLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  miniValue: {
    fontSize: typography.fontSizes.sm,
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
});
