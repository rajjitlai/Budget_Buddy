

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, borderRadius, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function InputField({
  label,
  error,
  icon,
  containerStyle,
  ...props
}: InputFieldProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary, borderColor } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
  };

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColorValue = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [borderColor, colors.primary[500]]
    );
    return {
      borderColor: borderColorValue,
      borderWidth: focusAnimation.value === 1 ? 2 : 1,
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      focusAnimation.value,
      [0, 1],
      [textSecondary, colors.primary[500]]
    ),
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.label, animatedLabelStyle]}>
        {label}
      </Animated.Text>
      <AnimatedView
        style={[
          styles.inputContainer,
          { backgroundColor: cardBackground },
          animatedBorderStyle,
          error && styles.errorBorder,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: textPrimary },
            icon ? styles.inputWithIcon : undefined,
          ]}
          placeholderTextColor={isDarkMode ? colors.slate[500] : colors.slate[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </AnimatedView>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    paddingVertical: spacing.md,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  errorBorder: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
});

