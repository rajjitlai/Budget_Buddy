import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { borderRadius, shadows, spacing, typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { faqs } from '@/lib/content/faqs';

interface FAQSectionProps {
  title?: string;
  /** Adds full-screen horizontal inset (standalone screens); omit inside modals. */
  inset?: boolean;
}

export function FAQSection({ title = 'Frequently Asked Questions', inset = false }: FAQSectionProps) {
  const { textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);

  const toggleFAQ = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedFAQs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Text
        style={[
          styles.sectionHeader,
          inset && styles.sectionHeaderInset,
          { color: textPrimary },
        ]}
      >
        {title}
      </Text>
      <View style={[styles.faqContainer, inset && styles.faqContainerInset]}>
        {faqs.map((faq) => {
          const isExpanded = expandedFAQs.includes(faq.id);
          return (
            <TouchableOpacity
              key={faq.id}
              onPress={() => toggleFAQ(faq.id)}
              activeOpacity={0.7}
              style={[styles.faqCard, { backgroundColor: cardBackground, borderColor }]}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: textPrimary }]}>
                  {faq.question}
                </Text>
                {isExpanded ? (
                  <ChevronUp size={20} color={textSecondary} />
                ) : (
                  <ChevronDown size={20} color={textSecondary} />
                )}
              </View>
              {isExpanded && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <Text style={[styles.faqAnswer, { color: textSecondary }]}>
                    {faq.answer}
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
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
  faqContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  faqContainerInset: {
    paddingHorizontal: spacing.lg,
  },
  faqCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
    marginRight: spacing.md,
  },
  faqAnswer: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginTop: spacing.md,
  },
});
