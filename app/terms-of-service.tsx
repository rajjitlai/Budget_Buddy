
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FileText } from 'lucide-react-native';
import { colors, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { LegalDocumentBody } from '@/components/LegalDocumentBody';
import { termsOfService } from '@/lib/content/legal';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';

export default function TermsOfServiceScreen() {
  const { backgroundColor } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ScreenHeader
        variant="standalone"
        leading="back"
        entering={FadeInDown.delay(100).duration(500)}
        title="Terms of Service"
        icon={<FileText size={24} color={colors.primary[500]} />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card radius="xl" padding={spacing.xl} style={styles.contentCard}>
            <LegalDocumentBody document={termsOfService} />
          </Card>
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
  contentCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
});

