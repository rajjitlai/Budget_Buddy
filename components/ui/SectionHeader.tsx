

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
}: SectionHeaderProps) {
  const { textPrimary, textSecondary } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View>
          <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <ChevronRight size={16} color={colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[500],
    marginRight: 2,
  },
});

