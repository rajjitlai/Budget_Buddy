
import React, { useState, useEffect } from 'react';
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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  FileText,
  Plus,
  History,
  Search,
  Filter,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import {
  categories,
  formatCurrency,
} from '@/lib/mockData';
import { getAccounts } from '@/lib/services/accounts';
import { 
  createTransaction, 
  getTransactions, 
  updateTransaction,
  deleteTransaction,
  TransactionDocument 
} from '@/lib/services/transactions';
import { useAppwrite } from '@/lib/AppwriteContext';
import { Account } from '@/lib/mockData';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TransactionItem } from '@/components/TransactionItem';
import { ModalSheet } from '@/components/ui/ModalSheet';

type TransactionType = 'expense' | 'income' | 'transfer';
type TabType = 'add' | 'history';

export default function TransactionScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { user } = useAppwrite();
  const [activeTab, setActiveTab] = useState<TabType>('add');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<TransactionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  
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
  const [editingTransaction, setEditingTransaction] = useState<TransactionDocument | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterAccount, setFilterAccount] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadTransactions();
    }
  }, [activeTab]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountDocs = await getAccounts();
      const accountList: Account[] = accountDocs.map((doc) => ({
        id: doc.$id,
        name: doc.name,
        type: doc.type,
        balance: doc.balance,
        icon: doc.icon,
        color: doc.color,
      }));
      setAccounts(accountList);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const transactionDocs = await getTransactions({ limit: 500 }); // Load more for filtering
      setTransactions(transactionDocs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Filter and search transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Type filter
    if (filterType !== 'all' && transaction.type !== filterType) {
      return false;
    }

    // Account filter
    if (filterAccount !== 'all') {
      if (transaction.sourceAccountId !== filterAccount && 
          transaction.destinationAccountId !== filterAccount) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const categoryMatch = transaction.category.toLowerCase().includes(query);
      const notesMatch = transaction.notes?.toLowerCase().includes(query) || false;
      const amountMatch = transaction.amount.toString().includes(query);
      
      // Check account names
      const sourceAccount = getAccountById(transaction.sourceAccountId);
      const destAccount = transaction.destinationAccountId 
        ? getAccountById(transaction.destinationAccountId) 
        : null;
      const sourceAccountMatch = sourceAccount?.name.toLowerCase().includes(query) || false;
      const destAccountMatch = destAccount?.name.toLowerCase().includes(query) || false;

      if (!categoryMatch && !notesMatch && !amountMatch && !sourceAccountMatch && !destAccountMatch) {
        return false;
      }
    }

    return true;
  });

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
    label: `${acc.name} (${formatCurrency(acc.balance)})`,
  }));

  const handleTabChange = (tab: TabType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const handleTypeChange = (type: TransactionType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTransactionType(type);
    setCategory(null);
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

  const handleSubmit = async () => {
    if (!amount || !sourceAccount || (transactionType !== 'transfer' && !category)) {
      return;
    }

    try {
      setSubmitting(true);
      await createTransaction({
        amount: parseFloat(amount),
        category: category || 'other',
        sourceAccountId: sourceAccount,
        destinationAccountId: transactionType === 'transfer' ? destinationAccount : undefined,
        notes,
        date,
        type: transactionType,
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      resetForm();
      await loadAccounts();
      
      // Switch to history tab to show the new transaction
      setActiveTab('history');
      await loadTransactions();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction: TransactionDocument) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setSourceAccount(transaction.sourceAccountId);
    setDestinationAccount(transaction.destinationAccountId);
    setNotes(transaction.notes);
    setDate(transaction.date.split('T')[0]);
    setTransactionType(transaction.type);
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingTransaction || !amount || !sourceAccount || (transactionType !== 'transfer' && !category)) {
      return;
    }

    try {
      setSubmitting(true);
      await updateTransaction(editingTransaction.$id, {
        amount: parseFloat(amount),
        category: category || 'other',
        sourceAccountId: sourceAccount,
        destinationAccountId: transactionType === 'transfer' ? destinationAccount : undefined,
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
      await loadAccounts();
      await loadTransactions();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (transaction: TransactionDocument) => {
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
              await deleteTransaction(transaction.$id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              await loadAccounts();
              await loadTransactions();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return ArrowDownLeft;
      case 'expense':
        return ArrowUpRight;
      case 'transfer':
        return ArrowLeftRight;
    }
  };

  const getTypeColor = (type: TransactionType, isActive: boolean) => {
    if (!isActive) return textSecondary;
    switch (type) {
      case 'income':
        return colors.success;
      case 'expense':
        return colors.error;
      case 'transfer':
        return colors.info;
    }
  };

  const getAccountById = (accountId: string) => {
    return accounts.find((acc) => acc.id === accountId);
  };

  const renderAddTransaction = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.header}
      >
        <Text style={[styles.title, { color: textPrimary }]}>
          Add Transaction
        </Text>
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          Record your income, expenses, or transfers
        </Text>
      </Animated.View>

      {/* Transaction Type Selector */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={[styles.typeSelector, { backgroundColor: cardBackground }]}
      >
        {(['expense', 'income', 'transfer'] as TransactionType[]).map((type) => {
          const Icon = getTypeIcon(type);
          const isActive = transactionType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => handleTypeChange(type)}
              style={[
                styles.typeButton,
                isActive && {
                  backgroundColor: `${getTypeColor(type, true)}15`,
                  borderColor: getTypeColor(type, true),
                },
              ]}
            >
              <Icon size={20} color={getTypeColor(type, isActive)} />
              <Text
                style={[
                  styles.typeLabel,
                  { color: getTypeColor(type, isActive) },
                  isActive && styles.typeLabelActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Form */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(500)}
        style={styles.form}
      >
        {/* Amount Input */}
        <View style={[styles.amountContainer, { backgroundColor: cardBackground }]}>
          <Text style={[styles.currencySymbol, { color: textSecondary }]}>?</Text>
          <InputField
            label=""
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            containerStyle={styles.amountInput}
          />
        </View>

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <SelectField
              label="Category"
              options={categories}
              value={category}
              onChange={setCategory}
              placeholder="Select category"
            />
          </View>
          <View style={styles.column}>
            <InputField
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              icon={<Calendar size={18} color={textSecondary} />}
            />
          </View>
        </View>

        {/* Account Selection */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: textSecondary }]}>
              Loading accounts...
            </Text>
          </View>
        ) : (
          <SelectField
            label={transactionType === 'transfer' ? 'From Account' : 'Account'}
            options={accountOptions}
            value={sourceAccount}
            onChange={setSourceAccount}
            placeholder="Select account"
          />
        )}

        {transactionType === 'transfer' && (
          <Animated.View entering={FadeInUp.duration(300)}>
            <SelectField
              label="To Account"
              options={accountOptions.filter((acc) => acc.id !== sourceAccount)}
              value={destinationAccount}
              onChange={setDestinationAccount}
              placeholder="Select destination"
            />
          </Animated.View>
        )}

        {/* Notes */}
        <InputField
          label="Notes (Optional)"
          placeholder="Add a note..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          icon={<FileText size={18} color={textSecondary} />}
        />

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <PrimaryButton
            title={submitting ? 'Adding...' : `Add ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`}
            onPress={handleSubmit}
            disabled={!amount || !sourceAccount || (transactionType !== 'transfer' && !category) || submitting || loading}
            fullWidth
            size="lg"
          />
        </View>
      </Animated.View>
    </ScrollView>
  );

  const renderHistory = () => {
    if (transactionsLoading) {
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
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <TransactionItem
                transaction={item}
                sourceAccount={getAccountById(item.sourceAccountId)}
                destinationAccount={item.destinationAccountId ? getAccountById(item.destinationAccountId) : undefined}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
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
        onClose={() => {
          setIsEditModalVisible(false);
          setEditingTransaction(null);
          resetForm();
        }}
        title="Edit Transaction"
      >
        <View style={styles.modalContent}>
          {/* Transaction Type Selector */}
          <View style={[styles.typeSelector, { backgroundColor: cardBackground }]}>
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((type) => {
              const Icon = getTypeIcon(type);
              const isActive = transactionType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleTypeChange(type)}
                  style={[
                    styles.typeButton,
                    isActive && {
                      backgroundColor: `${getTypeColor(type, true)}15`,
                      borderColor: getTypeColor(type, true),
                    },
                  ]}
                >
                  <Icon size={20} color={getTypeColor(type, isActive)} />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: getTypeColor(type, isActive) },
                      isActive && styles.typeLabelActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount Input */}
          <View style={[styles.amountContainer, { backgroundColor: cardBackground }]}>
            <Text style={[styles.currencySymbol, { color: textSecondary }]}>?</Text>
            <InputField
              label=""
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              containerStyle={styles.amountInput}
            />
          </View>

          {/* Two Column Layout */}
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <SelectField
                label="Category"
                options={categories}
                value={category}
                onChange={setCategory}
                placeholder="Select category"
              />
            </View>
            <View style={styles.column}>
              <InputField
                label="Date"
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                icon={<Calendar size={18} color={textSecondary} />}
              />
            </View>
          </View>

          {/* Account Selection */}
          <SelectField
            label={transactionType === 'transfer' ? 'From Account' : 'Account'}
            options={accountOptions}
            value={sourceAccount}
            onChange={setSourceAccount}
            placeholder="Select account"
          />

          {transactionType === 'transfer' && (
            <SelectField
              label="To Account"
              options={accountOptions.filter((acc) => acc.id !== sourceAccount)}
              value={destinationAccount}
              onChange={setDestinationAccount}
              placeholder="Select destination"
            />
          )}

          {/* Notes */}
          <InputField
            label="Notes (Optional)"
            placeholder="Add a note..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            icon={<FileText size={18} color={textSecondary} />}
          />

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <PrimaryButton
              title="Cancel"
              onPress={() => {
                setIsEditModalVisible(false);
                setEditingTransaction(null);
                resetForm();
              }}
              variant="ghost"
              style={styles.cancelButton}
            />
            <PrimaryButton
              title={submitting ? 'Updating...' : 'Update Transaction'}
              onPress={handleUpdate}
              disabled={!amount || !sourceAccount || (transactionType !== 'transfer' && !category) || submitting}
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
    paddingHorizontal: spacing.lg,
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
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    padding: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...shadows.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  typeLabelActive: {
    fontWeight: typography.fontWeights.semibold,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    paddingLeft: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  currencySymbol: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
  },
  amountInput: {
    flex: 1,
    marginBottom: 0,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  submitContainer: {
    marginTop: spacing.lg,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
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
});
