

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Sparkles,
} from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function AIRecommendationScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground } = useTheme();

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
          <View style={styles.headerIcon}>
            <Sparkles size={28} color={colors.primary[500]} />
          </View>
          <Text style={[styles.title, { color: textPrimary }]}>
            Budget Buddy Insights
          </Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            AI-powered recommendations for your finances
          </Text>
        </Animated.View>

        {/* Empty State */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <SectionHeader
            title="Insights"
            subtitle="Connect your accounts to unlock AI recommendations"
          />
          <View style={styles.actionsContainer}>
            <View style={[styles.emptyContainer, { backgroundColor: cardBackground }]}>
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                Insights are coming soon
              </Text>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                Once you add accounts and transactions, Budget Buddy will analyze your spending and surface personalized tips here.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* AI Disclaimer */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={[styles.disclaimerCard, { backgroundColor: isDarkMode ? colors.slate[800] : colors.slate[100] }]}
        >
          <View style={styles.disclaimerIcon}>
            <Sparkles size={16} color={colors.primary[500]} />
          </View>
          <Text style={[styles.disclaimerText, { color: textSecondary }]}>
            These insights are generated based on your financial data and general best practices. 
            Always consult a financial advisor for personalized advice.
          </Text>
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.xl,
    backgroundColor: `${colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  disclaimerCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  disclaimerIcon: {
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});


