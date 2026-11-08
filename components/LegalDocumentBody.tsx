import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { LegalDocumentData } from '@/lib/content/legal';

interface LegalDocumentBodyProps {
  document: LegalDocumentData;
}

export function LegalDocumentBody({ document }: LegalDocumentBodyProps) {
  const { textPrimary, textSecondary } = useTheme();

  return (
    <>
      <Text style={[styles.lastUpdated, { color: textSecondary }]}>
        Last Updated: {document.lastUpdated}
      </Text>
      {document.sections.map((section) => (
        <React.Fragment key={section.title}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            {section.title}
          </Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text
              key={index}
              style={[
                paragraph.startsWith('•') ? styles.bulletPoint : styles.content,
                { color: textSecondary },
              ]}
            >
              {paragraph}
            </Text>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
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
