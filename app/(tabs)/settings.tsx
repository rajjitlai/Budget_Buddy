

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Moon,
  Sun,
  Globe,
  Sparkles,
  BarChart3,
  LayoutGrid,
  ChevronRight,
  Info,
  Shield,
  Bell,
  HelpCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  type: 'toggle' | 'select' | 'link';
  value?: boolean;
  options?: string[];
  selectedOption?: string;
}

const currencies = ['INR (?)', 'USD ($)', 'EUR (?)', 'GBP (�)', 'JPY (�)'];

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  
  const [settings, setSettings] = useState({
    smartPlanner: true,
    advancedCharts: false,
    compactLayout: false,
    notifications: true,
    currency: 'INR (?)',
  });

  const handleToggle = (key: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleCurrencyChange = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const currentIndex = currencies.indexOf(settings.currency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setSettings((prev) => ({ ...prev, currency: currencies[nextIndex] }));
  };

  const renderSettingItem = (
    icon: React.ComponentType<{ size: number; color: string }>,
    title: string,
    subtitle: string | undefined,
    type: 'toggle' | 'select' | 'link',
    value?: boolean,
    onPress?: () => void,
    selectedValue?: string
  ) => {
    const Icon = icon;
    return (
      <TouchableOpacity
        onPress={type !== 'toggle' ? onPress : undefined}
        activeOpacity={type === 'toggle' ? 1 : 0.7}
        style={[styles.settingItem, { borderBottomColor: borderColor }]}
      >
        <View style={[styles.settingIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
          <Icon size={20} color={colors.primary[500]} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: textPrimary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {type === 'toggle' && (
          <Switch
            value={value}
            onValueChange={onPress}
            trackColor={{ false: colors.slate[300], true: colors.primary[400] }}
            thumbColor={value ? colors.primary[500] : colors.slate[100]}
            ios_backgroundColor={colors.slate[300]}
          />
        )}
        {type === 'select' && (
          <View style={styles.selectValue}>
            <Text style={[styles.selectText, { color: colors.primary[500] }]}>
              {selectedValue}
            </Text>
            <ChevronRight size={18} color={textSecondary} />
          </View>
        )}
        {type === 'link' && <ChevronRight size={20} color={textSecondary} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <Text style={[styles.title, { color: textPrimary }]}>
            Budget Buddy Settings
          </Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            Customize your experience
          </Text>
        </Animated.View>

        {/* Appearance Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <SectionHeader title="Appearance" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
            {renderSettingItem(
              isDarkMode ? Moon : Sun,
              'Dark Mode',
              isDarkMode ? 'Currently using dark theme' : 'Currently using light theme',
              'toggle',
              isDarkMode,
              () => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                toggleDarkMode();
              }
            )}
            {renderSettingItem(
              Globe,
              'Currency',
              'Select your preferred currency',
              'select',
              undefined,
              handleCurrencyChange,
              settings.currency
            )}
          </View>
        </Animated.View>

        {/* Features Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SectionHeader title="Features" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
            {renderSettingItem(
              Sparkles,
              'Enable Smart Planner',
              'AI-powered budget recommendations',
              'toggle',
              settings.smartPlanner,
              () => handleToggle('smartPlanner')
            )}
            {renderSettingItem(
              BarChart3,
              'Show Advanced Charts',
              'Detailed financial visualizations',
              'toggle',
              settings.advancedCharts,
              () => handleToggle('advancedCharts')
            )}
            {renderSettingItem(
              LayoutGrid,
              'Use Compact Layout',
              'Show more information on screen',
              'toggle',
              settings.compactLayout,
              () => handleToggle('compactLayout')
            )}
          </View>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <SectionHeader title="Notifications" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
            {renderSettingItem(
              Bell,
              'Push Notifications',
              'Get alerts for important updates',
              'toggle',
              settings.notifications,
              () => handleToggle('notifications')
            )}
          </View>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <SectionHeader title="About" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
            {renderSettingItem(
              Shield,
              'Privacy Policy',
              undefined,
              'link',
              undefined,
              () => {}
            )}
            {renderSettingItem(
              Info,
              'Terms of Service',
              undefined,
              'link',
              undefined,
              () => {}
            )}
            {renderSettingItem(
              HelpCircle,
              'Help & Support',
              undefined,
              'link',
              undefined,
              () => {}
            )}
          </View>
        </Animated.View>

        {/* App Info */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.appInfo}
        >
          <Text style={[styles.appName, { color: textPrimary }]}>Budget Buddy</Text>
          <Text style={[styles.appVersion, { color: textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appTagline, { color: textSecondary }]}>
            Your personal finance companion
          </Text>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  settingSubtitle: {
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  appName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  appVersion: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  appTagline: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});


