import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { ModalSheet } from '@/components/ui/ModalSheet';

interface ChangelogModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangelogModal({ visible, onClose }: ChangelogModalProps) {
  const { isDarkMode, textPrimary, textSecondary, borderColor } = useTheme();

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Release Notes & Changelog">
      {/* Release v2.4.0 */}
      <View style={[styles.changelogCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : colors.slate[50], borderColor }]}>
        <View style={styles.changelogHeader}>
          <View style={styles.changelogVersionRow}>
            <Text style={[styles.changelogVersion, { color: textPrimary }]}>v2.4.0</Text>
            <View style={[styles.changelogBadge, { backgroundColor: colors.primary[500] }]}>
              <Text style={styles.changelogBadgeText}>Latest Release</Text>
            </View>
          </View>
          <Text style={[styles.changelogDate, { color: textSecondary }]}>November 2026</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Shared UI Primitives
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            New unified ScreenHeader across every screen — drawer menu, icon tile, title/subtitle, and action slot in one component.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            New shared Card shell for consistent themed surfaces with radius, border, and shadow tokens.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            New usePressScale hook powering the press-scale micro-interaction everywhere.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            SelectField option picker now uses the shared ModalSheet for identical animations and back handling.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Security Hardening
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            On web, your AI API key is now session-only and never written to localStorage; any previously stored plaintext key is migrated and erased.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Removed the bundled EXPO_PUBLIC OpenRouter key path — AI calls use only your own key.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Fixed the update checker semver comparison so pre-release tags are handled correctly.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Type Safety & Code Quality
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Eliminated every explicit any in the codebase and enforced no-explicit-any in lint; typed SQLite bindings and row mapping across the data layer.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Transaction notes and destination accounts are now accurately nullable, and Loan/Notification/ChatMessage consolidated into shared types.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Settings split into focused components — the settings screen is 33% smaller with identical behavior.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Quality Gates & Testing
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Added CI that runs typecheck, lint, and tests on every pull request.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Added 34 automated tests covering transaction filtering, dates, category normalization, currency formatting, and service-layer SQL.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Added Prettier formatting and an explicit babel config with the worklets plugin.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Release Hygiene
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            Android release builds now produce an AAB for Play Store submissions.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            New deep-link scheme (budgetbuddy://), iOS bundle identifier, and OTA runtime version policy.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            npm audit: 47 → 27 vulnerabilities; remaining findings are toolchain-only.
          </Text>
        </View>
      </View>

      {/* Release v2.3.1 */}
      <View style={[styles.changelogCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : colors.slate[50], borderColor }]}>
        <View style={styles.changelogHeader}>
          <View style={styles.changelogVersionRow}>
            <Text style={[styles.changelogVersion, { color: textPrimary }]}>v2.3.1</Text>
            <View style={[styles.changelogBadge, { backgroundColor: colors.slate[400] }]}>
              <Text style={styles.changelogBadgeText}>Previous Release</Text>
            </View>
          </View>
          <Text style={[styles.changelogDate, { color: textSecondary }]}>August 2026</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Account Grid & Interactive Popups
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Replaced account bottom sheet with a centered, 2-column interactive grid popup dialog featuring account icons, color themes, balances, and check badges.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • WhatsApp-style reactive 60fps soft keyboard height translation across AI Chat and Transaction form notes inputs.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Auto-scroll on input focus to keep transaction notes and action buttons directly visible above the keyboard.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Multi-Model AI & Real-Time Connect
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Added <Text style={{ fontWeight: '600', color: textPrimary }}>openrouter/free</Text> auto-routing with instant failover across Gemma 4, Nemotron 3.5, and GLM 5.2.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Real-time error diagnostic feedback for invalid keys (401), rate limits (429), or credit limits (402).
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Rich Markdown preview formatting in Chat bubbles and AI Insight cards.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Enforced strict personal finance domain guardrails preventing code generation.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Analytics & Dynamic Category Analysis
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Auto-inferred transaction categories from notes and merchant names as you type.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Interactive dynamic SVG Pie & Donut chart with deterministic color palettes in Analytics.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Visual Design & Micro-Interactions
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Animated rolling number counters on net worth and account balance values.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Linear gradient meshes, ambient glows, and tactile privacy eye toggle on Hero cards.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Glowing area curve fills on Net Worth Trend line charts.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Category-tinted circular glow rings for transaction icon badges.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Dynamic Savings Milestone celebration banner on the home dashboard.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Navigation & Device Optimizations
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Dynamic safe area insets for Android 3-button navigation and gesture navigation bars.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Android hardware back button modal dismissal.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Configured drawer swipe edge width to avoid gesture navigation conflicts.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.changelogSection}>
          <Text style={[styles.changelogSectionTitle, { color: colors.primary[500] }]}>
            Data Integrity & Full Backup Scope
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Fixed loan partial update overwrite bug.
          </Text>
          <Text style={[styles.changelogItemText, { color: textSecondary }]}>
            • Extended backup/restore to serialize accounts, transactions, monthly plans, loans, notifications, and chat history atomically.
          </Text>
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  changelogCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  changelogHeader: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
    paddingBottom: spacing.sm,
  },
  changelogVersionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  changelogVersion: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  changelogBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  changelogBadgeText: {
    color: '#ffffff',
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  changelogDate: {
    fontSize: typography.fontSizes.xs,
  },
  changelogSection: {
    marginBottom: spacing.md,
  },
  changelogSectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  changelogItemText: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
});
