
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  Plus,
  History,
  Search,
  Filter,
  X,
} from 'lucide-react-native';
import { RefreshButton } from '@/components/RefreshButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import {
  formatCurrency,
  Account,
  Transaction,
} from '@/lib/types';
import { 
  createTransaction, 
  updateTransaction,
  deleteTransaction
} from '@/lib/services/transactions';
import { useUser } from '@/lib/UserContext';
import { useData } from '@/lib/DataContext';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { TransactionItem } from '@/components/TransactionItem';
import { TransactionForm, TransactionFormValues, TransactionType } from '@/components/TransactionForm';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { filterTransactions } from '@/lib/utils/transactionFilter';

type TabType = 'add' | 'history';

export default function TransactionScreen() {
  const { backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { user } = useUser();
  const { accounts, transactions, loading, refreshKey, triggerRefresh } = useData();
  
  const displayCurrency = (amount: number) => formatCurrency(amount, user?.currency);
  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });
  const formScrollRef = React.useRef<ScrollView>(null);

  const animatedKeyboardPadding = useAnimatedStyle(() => {
    const kbHeight = keyboard.height.value;
    return {
      flex: 1,
      paddingBottom: kbHeight > 0 ? kbHeight : 0,
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('add');
  
  // Add transaction form state
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sourceAccount, setSourceAccount] = useState<string | null>(null);
  const [destinationAccount, setDestinationAccount] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Edit transaction state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterAccount, setFilterAccount] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = () => {
    setRefreshing(true);
    triggerRefresh();
  };

  useEffect(() => {
    if (refreshing) setRefreshing(false);
  }, [refreshKey, refreshing]);

  // Account lookup (memoized Map — declared before filteredTransactions uses it)
  const accountsById = useMemo(
    () => new Map<string, Account>(accounts.map((acc) => [acc.id, acc])),
    [accounts]
  );

  const getAccountById = useCallback(
    (accountId: string) => accountsById.get(accountId),
    [accountsById]
  );

  // Filter and search transactions (recomputed only when inputs change)
  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, accounts, {
      type: filterType,
      account: filterAccount,
      query: searchQuery,
    }),
    [transactions, accounts, filterType, filterAccount, searchQuery]
  );

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterAccount('all');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const hasActiveFilters = filterType !== 'all' || filterAccount !== 'all' || searchQuery.trim() !== '';

  const accountOptions = accounts.map((acc) => ({
    id: acc.id,
    label: `${acc.name} (${displayCurrency(acc.balance)})`,
    icon: acc.icon,
    color: acc.color,
  }));

  const handleTabChange = (tab: TabType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const resetForm = () => {
    setAmount('');
    setCategory(null);
    setSourceAccount(null);
    setDestinationAccount(null);
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setTransactionType('expense');
  };

  const handleFormChange = useCallback((patch: Partial<TransactionFormValues>) => {
    if (patch.amount !== undefined) setAmount(patch.amount);
    if (patch.category !== undefined) setCategory(patch.category);
    if (patch.date !== undefined) setDate(patch.date);
    if (patch.notes !== undefined) setNotes(patch.notes);
    if (patch.transactionType !== undefined) setTransactionType(patch.transactionType);
    if (patch.sourceAccount !== undefined) setSourceAccount(patch.sourceAccount);
    if (patch.destinationAccount !== undefined) setDestinationAccount(patch.destinationAccount);
  }, []);

  const formValues: TransactionFormValues = {
    amount,
    category,
    date,
    notes,
    transactionType,
    sourceAccount,
    destinationAccount,
  };

  const handleSubmit = async () => {
    if (!amount || !sourceAccount || (transactionType !== 'transfer' && !category)) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await createTransaction({
        amount: parseFloat(amount),
        category: category || 'other',
        sourceAccountId: sourceAccount,
        destinationAccountId: transactionType === 'transfer' ? (destinationAccount || undefined) : undefined,
        notes,
        date,
        type: transactionType,
      });

      if (result?.warning) {
        Alert.alert('Budget Alert', result.warning);
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      resetForm();
      triggerRefresh();
      
      // Switch to history tab to show the new transaction
      setActiveTab('history');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setSourceAccount(transaction.sourceAccountId);
    setDestinationAccount(transaction.destinationAccountId || null);
    setNotes(transaction.notes ?? '');
    setDate(transaction.date.split('T')[0]);
    setTransactionType(transaction.type);
    setIsEditModalVisible(true);
  }, []);

  const handleUpdate = async () => {
    if (!editingTransaction || !amount || !sourceAccount || (transactionType !== 'transfer' && !category)) {
      return;
    }

    try {
      setSubmitting(true);
      await updateTransaction(editingTransaction.id, {
        amount: parseFloat(amount),
        category: category || 'other',
        sourceAccountId: sourceAccount,
        destinationAccountId: transactionType === 'transfer' ? (destinationAccount || undefined) : undefined,
        notes,
        date,
        type: transactionType,
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setIsEditModalVisible(false);
      setEditingTransaction(null);
      resetForm();
      triggerRefresh();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback((transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              triggerRefresh();
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  }, [triggerRefresh]);

  const renderTransactionItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem
        transaction={item}
        sourceAccount={getAccountById(item.sourceAccountId)}
        destinationAccount={item.destinationAccountId ? getAccountById(item.destinationAccountId) : undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [getAccountById, handleEdit, handleDelete]
  );

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingTransaction(null);
    resetForm();
  };

  const renderAddTransaction = () => (
    <Animated.View style={animatedKeyboardPadding}>
      <ScrollView
        ref={formScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TransactionForm
          mode="add"
          values={formValues}
          onChange={handleFormChange}
          accountOptions={accountOptions}
          accountsLoading={loading}
          submitting={submitting}
          onSubmit={handleSubmit}
          onNotesFocus={() => {
            setTimeout(() => formScrollRef.current?.scrollToEnd({ animated: true }), 150);
          }}
        />
      </ScrollView>
    </Animated.View>
  );

  const renderHistory = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      );
    }

    if (transactions.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: textSecondary }]}>
            No transactions yet. Add your first transaction!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.historyContainer}>
        {/* Search and Filter Bar */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.searchFilterContainer}
        >
          {/* Search Input */}
          <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
            <Search size={18} color={textSecondary} />
            <InputField
              label=""
              placeholder="Search transactions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
            />
            {searchQuery.trim() !== '' && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <X size={16} color={textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Toggle */}
          <TouchableOpacity
            onPress={() => {
              setShowFilters(!showFilters);
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={[
              styles.filterToggle,
              { 
                backgroundColor: cardBackground,
                borderColor: hasActiveFilters ? colors.primary[500] : borderColor,
              },
            ]}
          >
            <Filter 
              size={18} 
              color={hasActiveFilters ? colors.primary[500] : textSecondary} 
            />
            {hasActiveFilters && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary[500] }]} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Filter Options */}
        {showFilters && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeInDown.duration(200)}
            style={[styles.filtersPanel, { backgroundColor: cardBackground, borderColor }]}
          >
            {/* Type Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: textSecondary }]}>Type</Text>
              <View style={styles.filterChips}>
                {(['all', 'expense', 'income', 'transfer'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setFilterType(type);
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    style={[
                      styles.filterChip,
                      filterType === type && { backgroundColor: `${colors.primary[500]}15` },
                      { borderColor: filterType === type ? colors.primary[500] : borderColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: filterType === type ? colors.primary[500] : textPrimary },
                      ]}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Account Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: textSecondary }]}>Account</Text>
              <SelectField
                label=""
                options={[
                  { id: 'all', label: 'All Accounts' },
                  ...accountOptions,
                ]}
                value={filterAccount}
                onChange={(value) => {
                  setFilterAccount(value || 'all');
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                placeholder="Select account"
              />
            </View>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={clearFilters}
                style={styles.clearFiltersButton}
              >
                <X size={16} color={colors.error} />
                <Text style={[styles.clearFiltersText, { color: colors.error }]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Results Count */}
        {hasActiveFilters && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.resultsCount}
          >
            <Text style={[styles.resultsText, { color: textSecondary }]}>
              {filteredTransactions.length} of {transactions.length} transactions
            </Text>
          </Animated.View>
        )}

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              {hasActiveFilters
                ? 'No transactions match your filters. Try adjusting your search.'
                : 'No transactions yet. Add your first transaction!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransactionItem}
            extraData={accountsById}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Dynamic Header */}
      <ScreenHeader
        entering={FadeInDown.delay(100).duration(500)}
        title={activeTab === 'add' ? 'Add Transaction' : 'History'}
        subtitle={activeTab === 'add' ? 'Record your activity' : 'Your transaction log'}
        right={<RefreshButton onPress={refreshData} refreshing={refreshing} />}
      />

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: cardBackground }]}>
        <TouchableOpacity
          onPress={() => handleTabChange('add')}
          style={[
            styles.tab,
            activeTab === 'add' && { backgroundColor: colors.primary[500] },
          ]}
        >
          <Plus size={18} color={activeTab === 'add' ? '#ffffff' : textSecondary} />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'add' ? '#ffffff' : textSecondary },
            ]}
          >
            Add
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange('history')}
          style={[
            styles.tab,
            activeTab === 'history' && { backgroundColor: colors.primary[500] },
          ]}
        >
          <History size={18} color={activeTab === 'history' ? '#ffffff' : textSecondary} />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'history' ? '#ffffff' : textSecondary },
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'add' ? renderAddTransaction() : renderHistory()}
      </View>

      {/* Edit Transaction Modal */}
      <ModalSheet
        visible={isEditModalVisible}
        onClose={closeEditModal}
        title="Edit Transaction"
      >
        <TransactionForm
          mode="edit"
          values={formValues}
          onChange={handleFormChange}
          accountOptions={accountOptions}
          accountsLoading={loading}
          submitting={submitting}
          onSubmit={handleUpdate}
          onCancel={closeEditModal}
        />
      </ModalSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.xs,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  tabLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['5xl'],
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['5xl'],
  },
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  historyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filterToggle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filtersPanel: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.lg,
  },
  filterSection: {
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  clearFiltersText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  resultsCount: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  resultsText: {
    fontSize: typography.fontSizes.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
});
