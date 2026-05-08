

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronDown,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { AIInsight } from '@/lib/types';

interface AIInsightCardProps {
  insight: AIInsight;
  onActionPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AIInsightCard({ insight, onActionPress }: AIInsightCardProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const getTypeConfig = () => {
    switch (insight.type) {
      case 'recommendation':
        return {
          icon: Lightbulb,
          color: colors.primary[500],
          bgColor: isDarkMode ? colors.primary[900] : colors.primary[50],
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: colors.warning,
          bgColor: isDarkMode ? '#78350f' : '#fef3c7',
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: colors.success,
          bgColor: isDarkMode ? colors.primary[900] : colors.primary[50],
        };
      case 'info':
      default:
        return {
          icon: Info,
          color: colors.info,
          bgColor: isDarkMode ? '#1e3a5f' : '#dbeafe',
        };
    }
  };

  const getPriorityBadge = () => {
    switch (insight.priority) {
      case 'high':
        return { label: 'High Priority', color: colors.error };
      case 'medium':
        return { label: 'Medium', color: colors.warning };
      case 'low':
        return { label: 'Low', color: colors.slate[400] };
    }
  };

  const config = getTypeConfig();
  const priority = getPriorityBadge();
  const IconComponent = config.icon;

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 180);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={handleToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.container,
        { backgroundColor: cardBackground },
        animatedCardStyle,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: config.bgColor }]}
        >
          <IconComponent size={20} color={config.color} />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: textPrimary }]}
              numberOfLines={1}
            >
              {insight.title}
            </Text>
            <View
              style={[styles.priorityBadge, { backgroundColor: `${priority.color}20` }]}
            >
              <Text style={[styles.priorityText, { color: priority.color }]}>
                {priority.label}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.description, { color: textSecondary }]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {insight.description}
          </Text>
        </View>
        <Animated.View style={animatedChevronStyle}>
          <ChevronDown size={20} color={textSecondary} />
        </Animated.View>
      </View>

      {isExpanded && insight.action && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.actionContainer}>
          <TouchableOpacity
            onPress={onActionPress}
            style={[styles.actionButton, { backgroundColor: config.bgColor }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: config.color }]}>
              {insight.action}
            </Text>
            <ArrowRight size={16} color={config.color} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
    marginBottom: spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  priorityText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  description: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  actionContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
});


