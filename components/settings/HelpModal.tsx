import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, Book, ExternalLink } from 'lucide-react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { FAQSection } from '@/components/FAQSection';
import { GettingStartedCard, TipsCard, ContactCard } from '@/components/HelpSections';
import { openSupportEmail, openDocumentation } from '@/lib/utils/links';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HelpModal({ visible, onClose }: HelpModalProps) {
  const { textPrimary, textSecondary, cardBackground, borderColor } = useTheme();

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Help & Support">
      {/* Quick Actions */}
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

      {/* Getting Started */}
      <GettingStartedCard />

      {/* FAQs */}
      <FAQSection />

      {/* Tips & Tricks */}
      <TipsCard />

      {/* Contact Info */}
      <ContactCard />
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
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
