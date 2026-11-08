
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HelpCircle, Mail, Github, ExternalLink } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { FAQSection } from '@/components/FAQSection';
import { GettingStartedCard, TipsCard, ContactCard } from '@/components/HelpSections';
import { openSupportEmail, openGithubRepo } from '@/lib/utils/links';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function HelpSupportScreen() {
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ScreenHeader
        variant="standalone"
        leading="back"
        entering={FadeInDown.delay(100).duration(500)}
        title="Help & Support"
        icon={<HelpCircle size={24} color={colors.primary[500]} />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={openSupportEmail}
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
              onPress={openGithubRepo}
              style={[styles.actionCard, { backgroundColor: cardBackground, borderColor }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.slate[800]}15` }]}>
                <Github size={24} color={isDarkMode ? '#ffffff' : colors.slate[800]} />
              </View>
              <Text style={[styles.actionTitle, { color: textPrimary }]}>GitHub Repo</Text>
              <Text style={[styles.actionSubtitle, { color: textSecondary }]}>
                View source & issues
              </Text>
              <ExternalLink size={14} color={textSecondary} style={styles.externalIcon} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Getting Started */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <GettingStartedCard inset />
        </Animated.View>

        {/* FAQs */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <FAQSection inset />
        </Animated.View>

        {/* Tips & Tricks */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <TipsCard inset />
        </Animated.View>

        {/* Contact Info */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <ContactCard inset />
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
});

