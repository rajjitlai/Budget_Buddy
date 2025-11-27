

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Plus, Sparkles, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import {
  Account,
  initialAccounts,
  mockAIInsights,
  calculateNetWorth,
  formatCurrency,
  accountTypes,
} from '@/lib/mockData';
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
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<string | null>(null);
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const netWorth = calculateNetWorth(accounts);

  const handleAddAccount = () => {
    if (!newAccountName || !newAccountType || !newAccountBalance) return;

    const typeConfig = accountTypes.find((t) => t.id === newAccountType);
    const colorOptions = [
      colors.primary[500],
      colors.info,
      colors.warning,
      '#8b5cf6',
      '#ec4899',
      '#f97316',
    ];

    const newAccount: Account = {
      id: Date.now().toString(),
      name: newAccountName,
      type: newAccountType as Account['type'],
      balance: parseFloat(newAccountBalance) || 0,
      icon: typeConfig?.icon || 'Wallet',
      color: colorOptions[accounts.length % colorOptions.length],
    };

    setAccounts([...accounts, newAccount]);
    setIsAddModalVisible(false);
    setNewAccountName('');
    setNewAccountType(null);
    setNewAccountBalance('');

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
              Welcome back
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
            subtitle={`${accounts.length} accounts`}
            actionLabel="See all"

            {/* AI Insights Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <SectionHeader
              title="Budget Buddy AI Insights"
              subtitle="Personalized recommendations"
              icon={<Sparkles size={20} color={colors.primary[500]} />}
            />
            <View style={styles.insightsContainer}>
              {mockAIInsights.slice(0, 3).map((insight) => (
                <AIInsightCard key={insight.id} insight={insight} />
              ))}
            </View>
          </Animated.View>
      </ScrollView>

      {/* Add Account Modal */}
      <ModalSheet
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
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
              onPress={() => setIsAddModalVisible(false)}
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


