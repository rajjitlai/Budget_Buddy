import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { usePressScale } from './usePressScale';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedScaleProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
}

export function AnimatedScale({
  children,
  scaleTo = 0.95,
  haptic = 'light',
  onPress,
  style,
  ...props
}: AnimatedScaleProps) {
  const { animatedStyle, handlePressIn: pressIn, handlePressOut } = usePressScale({
    scaleTo,
    stiffness: 300,
  });

  const handlePressIn = () => {
    pressIn();
    if (haptic !== 'none' && Platform.OS !== 'web') {
      switch (haptic) {
        case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
        case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
        case 'heavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
        case 'selection': Haptics.selectionAsync(); break;
      }
    }
  };

  return (
    <AnimatedTouchable
      {...props}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
}
