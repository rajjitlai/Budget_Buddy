import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail } from 'lucide-react-native';
import { colors, borderRadius, shadows, spacing, typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { openSupportEmail } from '@/lib/utils/links';

interface SectionProps {
  /** Adds full-screen horizontal inset (standalone screens); omit inside modals. */
  inset?: boolean;
}

export function GettingStartedCard({ inset = false }: SectionProps) {
  const { textPrimary, textSecondary, cardBackground, borderColor } = useTheme();

  return (
    <>
      <Text
        style={[
          styles.sectionHeader,
          inset && styles.sectionHeaderInset,
          { color: textPrimary },
        ]}
      >
        Getting Started
      </Text>
      <View
        style={[
          styles.infoCard,
          inset && styles.infoCardInset,
          { backgroundColor: cardBackground, borderColor },
        ]}
      >
        <Text style={[styles.infoText, { color: textSecondary }]}>
          {"Welcome to Budget Buddy! Here's how to get started:"}
        </Text>
        <Text style={[styles.stepText, { color: textSecondary }]}>
          1. Add your accounts (Salary, Spending, Savings, etc.)
        </Text>
        <Text style={[styles.stepText, { color: textSecondary }]}>
          2. Record your transactions (income, expenses, transfers)
        </Text>
        <Text style={[styles.stepText, { color: textSecondary }]}>
          3. Set up your monthly budget in the Planner tab
        </Text>
        <Text style={[styles.stepText, { color: textSecondary }]}>
          4. View insights and recommendations in the Insights tab
        </Text>
      </View>
    </>
  );
}

export function TipsCard({ inset = false }: SectionProps) {
  const { textPrimary, textSecondary, cardBackground, borderColor } = useTheme();

  return (
    <>
      <Text
        style={[
          styles.sectionHeader,
          inset && styles.sectionHeaderInset,
          { color: textPrimary },
        ]}
      >
        Tips & Tricks
      </Text>
      <View
        style={[
          styles.infoCard,
          inset && styles.infoCardInset,
          { backgroundColor: cardBackground, borderColor },
        ]}
      >
        <Text style={[styles.tipTitle, { color: textPrimary }]}>💡 Pro Tips</Text>
        <Text style={[styles.tipText, { color: textSecondary }]}>
          • Use categories consistently to get better spending insights
        </Text>
        <Text style={[styles.tipText, { color: textSecondary }]}>
          • Review your monthly trends to identify spending patterns
        </Text>
        <Text style={[styles.tipText, { color: textSecondary }]}>
          • Enable Advanced Charts for detailed financial visualizations
        </Text>
        <Text style={[styles.tipText, { color: textSecondary }]}>
          • Set up your monthly plan to track budget vs actual spending
        </Text>
        <Text style={[styles.tipText, { color: textSecondary }]}>
          • Use the search and filter features to find specific transactions quickly
        </Text>
      </View>
    </>
  );
}

export function ContactCard({ inset = false }: SectionProps) {
  const { textPrimary, textSecondary, cardBackground, borderColor } = useTheme();

  return (
    <View
      style={[
        styles.contactCard,
        inset && styles.contactCardInset,
        { backgroundColor: cardBackground, borderColor },
      ]}
    >
      <Text style={[styles.contactTitle, { color: textPrimary }]}>Need More Help?</Text>
      <Text style={[styles.contactText, { color: textSecondary }]}>
        {"If you can't find what you're looking for, feel free to reach out:"}
      </Text>
      <TouchableOpacity onPress={openSupportEmail} style={styles.contactButton}>
        <Mail size={18} color={colors.primary[500]} />
        <Text style={[styles.contactButtonText, { color: colors.primary[500] }]}>
          rajjitlai@mail.com
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeaderInset: {
    marginHorizontal: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  infoCardInset: {
    marginHorizontal: spacing.lg,
  },
  infoText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  stepText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  tipTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.md,
  },
  tipText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  contactCard: {
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.sm,
  },
  contactCardInset: {
    marginHorizontal: spacing.lg,
  },
  contactTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
  },
  contactText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  contactButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
});
