import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { SUGGESTED_CATEGORIES } from '@/lib/types';
import { inferCategoryFromText } from '@/lib/utils/categorizer';
import { InputField } from '@/components/ui/InputField';
import { SelectField, SelectOption } from '@/components/ui/SelectField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface TransactionFormValues {
  amount: string;
  category: string | null;
  date: string;
  notes: string;
  transactionType: TransactionType;
  sourceAccount: string | null;
  destinationAccount: string | null;
}

interface TransactionFormProps {
  mode: 'add' | 'edit';
  values: TransactionFormValues;
  onChange: (patch: Partial<TransactionFormValues>) => void;
  accountOptions: SelectOption[];
  accountsLoading: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  onNotesFocus?: () => void;
}

export function TransactionForm({
  mode,
  values,
  onChange,
  accountOptions,
  accountsLoading,
  submitting,
  onSubmit,
  onCancel,
  onNotesFocus,
}: TransactionFormProps) {
  const { textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const suggestionScrollRef = useRef<ScrollView>(null);
  const isAdd = mode === 'add';
  const { amount, category, date, notes, transactionType, sourceAccount, destinationAccount } = values;

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return ArrowDownLeft;
      case 'expense':
        return ArrowUpRight;
      case 'transfer':
      default:
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

  const handleTypeChange = (type: TransactionType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange({ transactionType: type, category: null });
  };

  const handleNotesChange = (text: string) => {
    if (!isAdd) {
      onChange({ notes: text });
      return;
    }
    const patch: Partial<TransactionFormValues> = { notes: text };
    if (!category || category.trim() === '') {
      const inferred = inferCategoryFromText(text);
      if (inferred) {
        patch.category = inferred.category;
        if (transactionType !== 'transfer') {
          patch.transactionType = inferred.type;
        }
      }
    }
    onChange(patch);
  };

  const chips = SUGGESTED_CATEGORIES.map((cat) => (
    <TouchableOpacity
      key={cat}
      onPress={() => {
        onChange({ category: cat });
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      style={[
        styles.suggestionChip,
        { backgroundColor: cardBackground, borderColor },
      ]}
    >
      <Text style={{ color: textPrimary }}>{cat}</Text>
    </TouchableOpacity>
  ));

  const isSubmitDisabled =
    !amount ||
    !sourceAccount ||
    (transactionType !== 'transfer' && !category) ||
    submitting ||
    (isAdd && accountsLoading);

  return (
    <>
      <Animated.View
        entering={isAdd ? FadeInDown.delay(200).duration(500) : undefined}
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

      <Animated.View
        entering={isAdd ? FadeInDown.delay(300).duration(500) : undefined}
        style={isAdd ? styles.form : styles.modalContent}
      >
        {/* Amount Input */}
        <View style={[styles.amountContainer, { backgroundColor: cardBackground }]}>
          <Text style={[styles.currencySymbol, { color: textSecondary }]}>Rs.</Text>
          <InputField
            label=""
            placeholder="0"
            value={amount}
            onChangeText={(v) => onChange({ amount: v })}
            keyboardType="numeric"
            containerStyle={styles.amountInput}
          />
        </View>

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <InputField
              label="Category"
              placeholder="e.g. Lunch"
              value={category || ''}
              onChangeText={(v) => onChange({ category: v })}
            />
          </View>
          <View style={styles.column}>
            <InputField
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={(v) => onChange({ date: v })}
              icon={<Calendar size={18} color={textSecondary} />}
            />
          </View>
        </View>

        {/* Category Suggestion Chips */}
        {isAdd ? (
          <View style={styles.scrollIndicatorContainer}>
            <TouchableOpacity
              onPress={() => suggestionScrollRef.current?.scrollTo({ x: 0, animated: true })}
              style={styles.scrollIndicator}
            >
              <ChevronLeft size={16} color={textSecondary} />
            </TouchableOpacity>

            <ScrollView
              ref={suggestionScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionScroll}
              contentContainerStyle={styles.suggestionContent}
            >
              {chips}
            </ScrollView>

            <TouchableOpacity
              onPress={() => suggestionScrollRef.current?.scrollToEnd({ animated: true })}
              style={styles.scrollIndicator}
            >
              <ChevronRight size={16} color={textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionScroll}
            contentContainerStyle={styles.suggestionContent}
          >
            {chips}
          </ScrollView>
        )}

        {/* Account Selection */}
        {isAdd && accountsLoading ? (
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
            onChange={(v) => onChange({ sourceAccount: v })}
            placeholder="Select account"
          />
        )}

        {transactionType === 'transfer' && (
          <Animated.View entering={isAdd ? FadeInUp.duration(300) : undefined}>
            <SelectField
              label="To Account"
              options={accountOptions.filter((acc) => acc.id !== sourceAccount)}
              value={destinationAccount}
              onChange={(v) => onChange({ destinationAccount: v })}
              placeholder="Select destination"
            />
          </Animated.View>
        )}

        {/* Notes */}
        <InputField
          label="Notes (Optional)"
          placeholder={isAdd ? 'e.g. Starbucks, Uber, Walmart Groceries, Rent...' : 'Add a note...'}
          value={notes}
          onChangeText={handleNotesChange}
          multiline
          numberOfLines={3}
          onFocus={isAdd ? onNotesFocus : undefined}
          icon={<FileText size={18} color={textSecondary} />}
        />

        {/* Footer */}
        {isAdd ? (
          <View style={styles.submitContainer}>
            <PrimaryButton
              title={submitting ? 'Adding...' : `Add ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`}
              onPress={onSubmit}
              disabled={isSubmitDisabled}
              fullWidth
              size="lg"
            />
          </View>
        ) : (
          <View style={styles.modalActions}>
            <PrimaryButton
              title="Cancel"
              onPress={() => onCancel?.()}
              variant="ghost"
              style={styles.cancelButton}
            />
            <PrimaryButton
              title={submitting ? 'Updating...' : 'Update Transaction'}
              onPress={onSubmit}
              disabled={isSubmitDisabled}
              style={styles.submitButton}
            />
          </View>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  modalContent: {
    paddingBottom: spacing['3xl'],
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
  suggestionScroll: {},
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
  scrollIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  scrollIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
