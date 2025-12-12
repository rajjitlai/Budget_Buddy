
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

export default function TermsOfServiceScreen() {
  const { backgroundColor, textPrimary, textSecondary, cardBackground } = useTheme();
  const router = useRouter();

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
            <FileText size={24} color={colors.primary[500]} />
          </View>
          <Text style={[styles.title, { color: textPrimary }]}>Terms of Service</Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={[styles.contentCard, { backgroundColor: cardBackground }]}>
            <Text style={[styles.lastUpdated, { color: textSecondary }]}>
              Last Updated: December 2025
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              1. Acceptance of Terms
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              By accessing and using Budget Buddy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use the application.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              2. Description of Service
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              Budget Buddy is a personal finance management application that helps you track accounts, manage transactions, plan budgets, and receive AI-powered financial insights. The service is provided "as is" for your personal use.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              3. User Accounts
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              To use Budget Buddy, you must:
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Create an account with accurate and complete information
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Maintain the security of your account credentials
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Be responsible for all activities under your account
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Notify us immediately of any unauthorized access
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              4. Acceptable Use
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              You agree not to:
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Use the service for any illegal or unauthorized purpose
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Attempt to gain unauthorized access to the service or other users' accounts
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Interfere with or disrupt the service or servers
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Use automated systems to access the service without permission
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              5. Financial Information
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              Budget Buddy is a tool to help you manage your finances. However:
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • We do not provide financial, investment, or tax advice
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • All financial decisions are your sole responsibility
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • AI insights are recommendations only, not professional advice
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Consult a qualified financial advisor for personalized advice
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              6. Data Accuracy
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              You are responsible for the accuracy of all financial data you enter into Budget Buddy. We are not liable for any errors, omissions, or inaccuracies in the data you provide.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              7. Service Availability
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              We strive to provide reliable service but do not guarantee uninterrupted or error-free operation. The service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              8. Limitation of Liability
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              Budget Buddy is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the service, including but not limited to financial losses or data loss.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              9. Intellectual Property
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              All content, features, and functionality of Budget Buddy are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the service without our permission.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              10. Termination
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              We reserve the right to terminate or suspend your account at any time for violation of these terms. You may also delete your account at any time through the settings.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              11. Changes to Terms
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              12. Governing Law
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              These terms are governed by applicable laws. Any disputes will be resolved through appropriate legal channels.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              13. Contact
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              For questions about these Terms of Service, please contact us through the Help & Support section in the app settings.
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
  contentCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  lastUpdated: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  content: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
});

