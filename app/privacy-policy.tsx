
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

export default function PrivacyPolicyScreen() {
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
            <Shield size={24} color={colors.primary[500]} />
          </View>
          <Text style={[styles.title, { color: textPrimary }]}>Privacy Policy</Text>
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
              1. Information We Collect
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              Budget Buddy collects the following information to provide you with financial management services:
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Account information (account names, types, balances)
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Transaction data (amounts, categories, dates, notes)
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Monthly budget plans and allocations
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • User account information (name, email) for authentication
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              2. How We Use Your Information
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              We use your information to:
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Provide financial tracking and budgeting features
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Generate AI-powered financial insights and recommendations
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Calculate and display your net worth and account balances
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Maintain your account and provide customer support
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              3. Data Storage and Security
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              Your financial data is stored securely using Appwrite, a secure backend-as-a-service platform. We implement industry-standard security measures including:
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Encrypted data transmission (HTTPS)
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Secure authentication and authorization
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • User-isolated data access (you can only access your own data)
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Secure credential storage using Expo SecureStore
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              4. Third-Party Services
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              Budget Buddy uses the following third-party services:
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Appwrite: For data storage and authentication
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • OpenRouter (optional): For AI-powered insights generation
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              These services have their own privacy policies. We recommend reviewing them to understand how they handle your data.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              5. Your Rights
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              You have the right to:
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Access your personal and financial data
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Update or correct your information
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Delete your account and all associated data
            </Text>
            <Text style={[styles.bulletPoint, { color: textSecondary }]}>
              • Export your data at any time
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              6. Data Retention
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              We retain your data for as long as your account is active. When you delete your account, all associated data is permanently removed from our systems.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              7. Children's Privacy
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              Budget Buddy is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              8. Changes to This Policy
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy.
            </Text>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              9. Contact Us
            </Text>
            <Text style={[styles.content, { color: textSecondary }]}>
              If you have questions about this Privacy Policy or our data practices, please contact us through the Help & Support section in the app settings.
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

