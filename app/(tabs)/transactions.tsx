

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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  FileText,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import {
  initialAccounts,
  categories,
  formatCurrency,
} from '@/lib/mockData';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SectionHeader } from '@/components/ui/SectionHeader';

type TransactionType = 'expense' | 'income' | 'transfer';

export default function TransactionScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sourceAccount, setSourceAccount] = useState<string | null>(null);
  const [destinationAccount, setDestinationAccount] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const accountOptions = initialAccounts.map((acc) => ({
    id: acc.id,
    label: `${acc.name} (${formatCurrency(acc.balance)})`,
  }));

  const handleTypeChange = (type: TransactionType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTransactionType(type);
    setCategory(null);
  };

  const handleSubmit = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // Reset form
    setAmount('');
    setCategory(null);
    setSourceAccount(null);
    setDestinationAccount(null);
    setNotes('');
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
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
          <SelectField
            label={transactionType === 'transfer' ? 'From Account' : 'Account'}
            options={accountOptions}
            value={sourceAccount}
            onChange={setSourceAccount}
            placeholder="Select account"
          />

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
              title={`Add ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`}
              onPress={handleSubmit}
              disabled={!amount || !sourceAccount || (transactionType !== 'transfer' && !category)}
              fullWidth
              size="lg"
            />
          </View>
        </Animated.View>

        {/* Recent Transactions Preview */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <SectionHeader
            title="Quick Tips"
            subtitle="Make the most of Budget Buddy"
          />
          <View style={[styles.tipCard, { backgroundColor: cardBackground }]}>
            <Text style={[styles.tipText, { color: textSecondary }]}>
              ?? Categorize your transactions to get better insights and recommendations from Budget Buddy AI.
            </Text>
          </View>
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
  tipCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  tipText: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
});


