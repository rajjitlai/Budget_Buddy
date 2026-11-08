import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeContext';
import { borderRadius, shadows } from '@/lib/theme';

type EnteringAnimation = React.ComponentProps<typeof Animated.View>['entering'];
type ExitingAnimation = React.ComponentProps<typeof Animated.View>['exiting'];

export interface CardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  entering?: EnteringAnimation;
  exiting?: ExitingAnimation;
  /** Inner padding (default 0) */
  padding?: number;
  /** Corner radius token (default '2xl') */
  radius?: keyof typeof borderRadius;
  /** 1px themed border (default true) */
  bordered?: boolean;
  /** Shadow token, or 'none' (default 'sm') */
  shadow?: keyof typeof shadows | 'none';
}

/** Standard card shell: themed background + border + radius + shadow. */
export function Card({
  children,
  style,
  entering,
  exiting,
  padding = 0,
  radius = '2xl',
  bordered = true,
  shadow = 'sm',
}: CardProps) {
  const { cardBackground, borderColor } = useTheme();

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={[
        {
          backgroundColor: cardBackground,
          borderRadius: borderRadius[radius],
          borderWidth: bordered ? 1 : 0,
          borderColor: bordered ? borderColor : undefined,
          padding,
          ...(shadow !== 'none' ? shadows[shadow] : undefined),
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
