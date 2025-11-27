

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
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  Sparkles,
  TrendingUp,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, mockAIInsights } from '@/lib/mockData';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AIInsightCard } from '@/components/AIInsightCard';

interface MetricCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface ExpandableSection {
  id: string;
  title: string;
  content: string;
}

export default function AIRecommendationScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const metrics: MetricCard[] = [
    {
      id: 'essentials',
      title: 'Monthly Essentials',
      value: formatCurrency(17098),
      subtitle: '20% of income',
      icon: Target,
      color: colors.info,
      trend: 'neutral',
    },
    {
      id: 'buffer',
      title: 'Salary Buffer',
      value: formatCurrency(25000),
      subtitle: 'Target: ?30,000',
      icon: Shield,
      color: colors.warning,
      trend: 'up',
    },
    {
      id: 'emergency',
      title: 'Emergency Fund',
      value: formatCurrency(150000),
      subtitle: '4.5 months covered',
      icon: AlertCircle,
      color: colors.success,
      trend: 'up',
    },
    {
      id: 'savings',
      title: 'Savings Rate',
      value: '35%',
      subtitle: 'Above average!',
      icon: TrendingUp,
      color: colors.primary[500],
      trend: 'up',
    },
  ];

  const explanations: ExpandableSection[] = [
    {
      id: 'exp1',
      title: 'Why move money to Spending?',
      content: 'Based on your spending patterns over the last 3 months, your Spending account tends to run low by the 20th of each month. Moving ?4,000 from Salary will ensure smooth cash flow without dipping into savings.',
    },
    {
      id: 'exp2',
      title: 'Emergency Fund Calculation',
      content: 'Your monthly essential expenses average ?33,000. Financial experts recommend 6 months of expenses (?198,000) as an emergency fund. You currently have ?150,000, which covers 4.5 months.',
    },
    {
      id: 'exp3',
      title: 'Optimal Savings Strategy',
      content: 'With your current income and expenses, you can comfortably save 35% of your income. This puts you ahead of the recommended 20% savings rate and will help you reach your financial goals faster.',
    },
  ];

  const toggleSection = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color={colors.success} />;
      case 'down':
        return <TrendingUp size={14} color={colors.error} style={{ transform: [{ rotate: '180deg' }] }} />;
      default:
        return null;
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

        {/* Metrics Grid */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.metricsGrid}
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Animated.View
                key={metric.id}
                entering={FadeInDown.delay(200 + index * 100).duration(500)}
                style={[styles.metricCard, { backgroundColor: cardBackground }]}
              >
                <View style={styles.metricHeader}>
                  <View
                    style={[
                      styles.metricIconContainer,
                      { backgroundColor: `${metric.color}15` },
                    ]}
                  >
                    <Icon size={18} color={metric.color} />
                  </View>
                  {getTrendIcon(metric.trend)}
                </View>
                <Text style={[styles.metricValue, { color: textPrimary }]}>
                  {metric.value}
                </Text>
                <Text style={[styles.metricTitle, { color: textSecondary }]}>
                  {metric.title}
                </Text>
                <Text style={[styles.metricSubtitle, { color: textSecondary }]}>
                  {metric.subtitle}
                </Text>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Recommended Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <SectionHeader
            title="Recommended Actions"
            subtitle="Take these steps to optimize your finances"
          />
          <View style={styles.actionsContainer}>
            {mockAIInsights.filter((i) => i.action).map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        </Animated.View>

        {/* Expandable Explanations */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <SectionHeader
            title="Understanding Your Insights"
            subtitle="Learn more about our recommendations"
          />
          <View style={styles.explanationsContainer}>
            {explanations.map((section) => {
              const isExpanded = expandedSections.includes(section.id);
              return (
                <TouchableOpacity
                  key={section.id}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.explanationCard,
                    { backgroundColor: cardBackground },
                  ]}
                >
                  <View style={styles.explanationHeader}>
                    <Text
                      style={[styles.explanationTitle, { color: textPrimary }]}
                    >
                      {section.title}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={20} color={textSecondary} />
                    ) : (
                      <ChevronDown size={20} color={textSecondary} />
                    )}
                  </View>
                  {isExpanded && (
                    <Animated.View entering={FadeIn.duration(200)}>
                      <Text
                        style={[
                          styles.explanationContent,
                          { color: textSecondary },
                        ]}
                      >
                        {section.content}
                      </Text>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              );
            })}
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '47%',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  metricTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: typography.fontSizes.xs,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  explanationsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  explanationCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  explanationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  explanationTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
    marginRight: spacing.md,
  },
  explanationContent: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 22,
    marginTop: spacing.md,
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
});


