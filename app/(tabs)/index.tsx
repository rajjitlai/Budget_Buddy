
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
import { Plus, Sparkles, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useAppwrite } from '@/lib/AppwriteContext';
import {
  Account,
  calculateNetWorth,
  formatCurrency,
  accountTypes,
} from '@/lib/mockData';
import { getAccounts, createAccount, updateAccount, deleteAccount, AccountDocument } from '@/lib/services/accounts';
import { getTransactions } from '@/lib/services/transactions';
import { getTransactions, TransactionDocument } from '@/lib/services/transactions';
import { getCurrentMonthlyPlan } from '@/lib/services/monthlyPlans';
import { generateAIInsights } from '@/lib/services/ai';
import { AIInsight, Transaction } from '@/lib/mockData';
import { transactionDocumentToTransaction } from '@/lib/utils/converters';
import { NetWorthCard } from '@/components/NetWorthCard';
import { AccountList } from '@/components/AccountList';
import { AIInsightCard } from '@/components/AIInsightCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';

export default function DashboardScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground } = useTheme();
  const { user } = useAppwrite();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<string | null>(null);
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const netWorth = calculateNetWorth(accounts);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      loadInsights();
    }
  }, [accounts]);

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

  const loadInsights = async () => {
    try {
      setInsightsLoading(true);
      
      // Load transactions and monthly plan
      const [transactionDocs, monthlyPlan] = await Promise.all([
        getTransactions({ limit: 100 }), // Get recent transactions
        getCurrentMonthlyPlan(),
      ]);

      // Convert transaction documents to Transaction type
      const transactions: Transaction[] = transactionDocs.map((doc) =>
        transactionDocumentToTransaction(doc)
      );

      // Generate insights
      const generatedInsights = await generateAIInsights({
        accounts,
        transactions,
        monthlyPlan: monthlyPlan || undefined,
      });

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
      // Set empty insights on error
      setInsights([]);
    } finally {
      setInsightsLoading(false);
    }
  };

  const resetForm = () => {
    setNewAccountName('');
    setNewAccountType(null);
    setNewAccountBalance('');
    setEditingAccount(null);
  };

  const handleAddAccount = async () => {
    if (!newAccountName || !newAccountType || !newAccountBalance) return;

    try {
      const typeConfig = accountTypes.find((t) => t.id === newAccountType);
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
        type: newAccountType as Account['type'],
        balance: parseFloat(newAccountBalance) || 0,
        icon: typeConfig?.icon || 'Wallet',
        color: colorOptions[accounts.length % colorOptions.length],
      };

      await createAccount(accountData);

      await loadAccounts();
      setIsAddModalVisible(false);
      resetForm();

      // Reload insights after adding account
      await loadInsights();

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
    setIsEditModalVisible(true);
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount || !newAccountName || !newAccountType) return;

    try {
      const typeConfig = accountTypes.find((t) => t.id === newAccountType);
      
      await updateAccount(editingAccount.id, {
        name: newAccountName,
        type: newAccountType as Account['type'],
        balance: parseFloat(newAccountBalance) || 0,
        icon: typeConfig?.icon || editingAccount.icon,
        color: editingAccount.color, // Keep existing color
      });

      await loadAccounts();
      setIsEditModalVisible(false);
      resetForm();

      // Reload insights after updating account
      await loadInsights();

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
                await loadInsights();

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
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View>
            <Text style={[styles.greeting, { color: textSecondary }]}>
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </Text>
            <Text style={[styles.title, { color: textPrimary }]}>
              Budget Buddy
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: cardBackground }]}
          >
            <Bell size={22} color={textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Net Worth Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <NetWorthCard totalBalance={netWorth} />
        </Animated.View>

        {/* Accounts Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SectionHeader
            title="Your Accounts"
            subtitle={`${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`}
            actionLabel="See all"
            onAction={() => {}}
          />
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : accounts.length > 0 ? (
            <AccountList 
              accounts={accounts}
              onAccountEdit={handleEditAccount}
              onAccountDelete={handleDeleteAccount}
            />
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

        {/* AI Insights Section */}
        {insights.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <SectionHeader
              title="Budget Buddy AI Insights"
              subtitle="Personalized recommendations"
              icon={<Sparkles size={20} color={colors.primary[500]} />}
              actionLabel="See all"
              onAction={() => {}}
            />
            <View style={styles.insightsContainer}>
              {insights.slice(0, 3).map((insight) => (
                <AIInsightCard key={insight.id} insight={insight} />
              ))}
            </View>
          </Animated.View>
        )}

        {insightsLoading && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View style={styles.insightsLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
              <Text style={[styles.insightsLoadingText, { color: textSecondary }]}>
                Generating insights...
              </Text>
            </View>
          </Animated.View>
        )}
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
          <SelectField
            label="Account Type"
            options={accountTypes}
            value={newAccountType}
            onChange={setNewAccountType}
            placeholder="Select account type"
          />
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
          <SelectField
            label="Account Type"
            options={accountTypes}
            value={newAccountType}
            onChange={setNewAccountType}
            placeholder="Select account type"
          />
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
    paddingBottom: spacing['5xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSizes.sm,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
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
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  insightsContainer: {
    paddingHorizontal: spacing.lg,
  },
  insightsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  insightsLoadingText: {
    fontSize: typography.fontSizes.sm,
  },
  loadingContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyContainer: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
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
