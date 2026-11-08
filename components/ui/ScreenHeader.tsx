import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Menu, ArrowLeft } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme';
import { AnimatedScale } from './AnimatedScale';

type EnteringAnimation = React.ComponentProps<typeof Animated.View>['entering'];

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Rendered above the title (e.g. greeting on the dashboard) */
  greeting?: string;
  /** Icon rendered in a tinted tile next to the leading button */
  icon?: React.ReactNode;
  /** Leading control: drawer menu button (default), back arrow, or nothing */
  leading?: 'menu' | 'back' | 'none';
  /** Right-aligned action slot */
  right?: React.ReactNode;
  /** Extra content rendered next to the title (e.g. unread badge) */
  titleContent?: React.ReactNode;
  /** 'drawer' = tab screens, 'standalone' = pushed screens with a back button */
  variant?: 'drawer' | 'standalone';
  entering?: EnteringAnimation;
  /** Extra style for the header container (e.g. scroll-linked animation) */
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({
  title,
  subtitle,
  greeting,
  icon,
  leading = 'menu',
  right,
  titleContent,
  variant = 'drawer',
  entering,
  style,
}: ScreenHeaderProps) {
  const navigation = useNavigation();
  const router = useRouter();
  const { textPrimary, textSecondary, cardBackground } = useTheme();

  if (variant === 'standalone') {
    return (
      <Animated.View entering={entering} style={[styles.standaloneHeader, style]}>
        {leading === 'back' && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: cardBackground }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={20} color={textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.standaloneContent}>
          {icon && <View style={styles.standaloneTile}>{icon}</View>}
          <Text style={[styles.standaloneTitle, { color: textPrimary }]}>{title}</Text>
        </View>
        {right}
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={entering} style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          {leading === 'menu' && (
            <AnimatedScale
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}
            >
              <Menu size={22} color={textSecondary} />
            </AnimatedScale>
          )}
          {icon && <View style={styles.iconTile}>{icon}</View>}
          <View>
            {greeting ? (
              <Text style={[styles.greeting, { color: textSecondary }]}>{greeting}</Text>
            ) : null}
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
              {titleContent}
            </View>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: textSecondary }]}>{subtitle}</Text>
            ) : null}
          </View>
        </View>
        {right ? <View style={styles.headerRight}>{right}</View> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  greeting: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    marginTop: spacing.xs,
  },
  standaloneHeader: {
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
  standaloneContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  standaloneTile: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standaloneTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
});
