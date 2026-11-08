import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { ModalSheet } from '@/components/ui/ModalSheet';

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelect: (currency: string) => void;
}

export function CurrencyModal({ visible, onClose, selectedCurrency, onSelect }: CurrencyModalProps) {
  const { textPrimary, textSecondary, cardBackground, borderColor } = useTheme();

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Select Currency">
      <View style={styles.modalBody}>
        <Text style={[styles.modalHint, { color: textSecondary }]}>
          Choose the currency symbol to be used across the application.
        </Text>
        <View style={styles.currencyGrid}>
          {['Rs.', '$', '€', '£', '¥', 'CHF', 'A$', 'C$'].map((curr) => (
            <TouchableOpacity
              key={curr}
              onPress={() => onSelect(curr)}
              style={[
                styles.currencyOption,
                {
                  backgroundColor: selectedCurrency === curr ? `${colors.primary[500]}20` : cardBackground,
                  borderColor: selectedCurrency === curr ? colors.primary[500] : borderColor
                }
              ]}
            >
              <Text style={[
                styles.currencyText,
                { color: selectedCurrency === curr ? colors.primary[500] : textPrimary }
              ]}>
                {curr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  modalBody: {
    paddingBottom: spacing.xl,
  },
  modalHint: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  currencyOption: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  currencyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
});
