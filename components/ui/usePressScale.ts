import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface UsePressScaleOptions {
  /** Scale factor while pressed (default 0.95) */
  scaleTo?: number;
  /** Spring stiffness (default 400) */
  stiffness?: number;
}

export function usePressScale({ scaleTo = 0.95, stiffness = 400 }: UsePressScaleOptions = {}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleTo, { damping: 15, stiffness });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness });
  };

  return { scale, animatedStyle, handlePressIn, handlePressOut };
}
