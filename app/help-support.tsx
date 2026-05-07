
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Book, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I add my first account?',
    answer: 'Go to the Dashboard tab and tap "Add Account". Enter your account name, select the account type (Salary, Spending, Savings, etc.), and set the initial balance. Your account will be created and displayed on the dashboard.',
  },
  {
    id: '2',
    question: 'How do transactions affect account balances?',
    answer: 'When you create a transaction, account balances are automatically updated. Expenses decrease the source account balance, income increases it, and transfers move money between accounts. The system prevents negative balances for expenses and transfers.',
  },
  {
    id: '3',
    question: 'What are AI Insights?',
    answer: 'AI Insights provide personalized financial recommendations based on your spending patterns, account balances, and budget plans. You can enable AI-powered insights (requires OpenRouter API key) or use rule-based insights that work without any API key.',
  },
  {
    id: '4',
    question: 'How do I set up a monthly budget?',
    answer: 'Go to the Planner tab, enter your monthly salary, and set your essential expenses (electricity, internet, mobile, food, utilities). The app will automatically calculate suggested allocations for spending, buffer, savings, and emergency fund.',
  },
  {
    id: '5',
    question: 'Can I edit or delete transactions?',
    answer: 'Yes! Go to the Transactions tab, switch to the "History" view, and you\'ll see all your transactions. Tap the edit icon to modify a transaction or the delete icon to remove it. Account balances will be automatically adjusted.',
  },
  {
    id: '6',
    question: 'How do I enable Advanced Charts?',
    answer: 'Go to Settings → Features and toggle "Show Advanced Charts" ON. Then visit the Insights screen to see detailed visualizations including savings rate, account distribution, spending by category, and monthly trends.',
  },
  {
    id: '7',
    question: 'Is my financial data secure?',
    answer: 'Yes! Your data is stored locally on your device in a secure SQLite database. We do not store your data on our servers, ensuring total privacy. You can also enable biometric locking for an extra layer of security.',
  },
  {
    id: '8',
    question: 'Can I use the app without an internet connection?',
    answer: 'Absolutely! Budget Buddy is a local-first app, meaning all your data is stored on your device. You only need an internet connection for optional features like AI-powered insights or cloud backups.',
  },
];

export default function HelpSupportScreen() {
  const { backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const router = useRouter();
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);

  const toggleFAQ = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedFAQs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openEmail = () => {
    const email = 'support@budgetbuddy.app';
    const subject = 'Budget Buddy Support Request';
    const body = 'Please describe your issue or question:';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch((err) => {
      console.error('Error opening email:', err);
    });
  };

  const openDocumentation = () => {
    // You can link to your documentation website here
    const url = 'https://budgetbuddy.app/docs';
    Linking.openURL(url).catch((err) => {
      console.error('Error opening documentation:', err);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: cardBackground }]}
        >
          <ArrowLeft size={20} color={textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
            <HelpCircle size={24} color={colors.primary[500]} />
          </View>
          <Text style={[styles.title, { color: textPrimary }]}>Help & Support</Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={openEmail}
              style={[styles.actionCard, { backgroundColor: cardBackground, borderColor }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
                <Mail size={24} color={colors.primary[500]} />
              </View>
              <Text style={[styles.actionTitle, { color: textPrimary }]}>Email Support</Text>
              <Text style={[styles.actionSubtitle, { color: textSecondary }]}>
                Get help via email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openDocumentation}
              style={[styles.actionCard, { backgroundColor: cardBackground, borderColor }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.info}15` }]}>
                <Book size={24} color={colors.info} />
              </View>
              <Text style={[styles.actionTitle, { color: textPrimary }]}>Documentation</Text>
              <Text style={[styles.actionSubtitle, { color: textSecondary }]}>
                User guides & tutorials
              </Text>
              <ExternalLink size={14} color={textSecondary} style={styles.externalIcon} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Getting Started */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.sectionHeader, { color: textPrimary }]}>Getting Started</Text>
          <View style={[styles.infoCard, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.infoText, { color: textSecondary }]}>
              Welcome to Budget Buddy! Here's how to get started:
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
        </Animated.View>

        {/* FAQs */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={[styles.sectionHeader, { color: textPrimary }]}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
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
        </Animated.View>

        {/* Tips & Tricks */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={[styles.sectionHeader, { color: textPrimary }]}>Tips & Tricks</Text>
          <View style={[styles.infoCard, { backgroundColor: cardBackground, borderColor }]}>
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
        </Animated.View>

        {/* Contact Info */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <View style={[styles.contactCard, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.contactTitle, { color: textPrimary }]}>Need More Help?</Text>
            <Text style={[styles.contactText, { color: textSecondary }]}>
              If you can't find what you're looking for, feel free to reach out:
            </Text>
            <TouchableOpacity
              onPress={openEmail}
              style={styles.contactButton}
            >
              <Mail size={18} color={colors.primary[500]} />
              <Text style={[styles.contactButtonText, { color: colors.primary[500] }]}>
                support@budgetbuddy.app
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  scrollContent: {
    paddingBottom: spacing['5xl'],
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
  },
  externalIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
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
  faqContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
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
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.sm,
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

