import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/lib/ThemeContext';
import { colors, spacing } from '@/lib/theme';

interface RefreshButtonProps {
  onPress: () => void;
  refreshing?: boolean;
  size?: number;
}

export function RefreshButton({ onPress, refreshing = false, size = 20 }: RefreshButtonProps) {
  const { textSecondary } = useTheme();
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [refreshing]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.7}
      disabled={refreshing}
    >
      <Animated.View style={animatedStyle}>
        <RefreshCw size={size} color={refreshing ? colors.primary[500] : textSecondary} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
});

