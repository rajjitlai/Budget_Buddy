import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, radius = borderRadius.md, style }: SkeletonProps) {
  const { isDarkMode } = useTheme();
  const shimmerValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
  });

  return (
    <View 
      style={[
        styles.container, 
        { 
          width, 
          height, 
          borderRadius: radius,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' 
        }, 
        style
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={[
            'transparent',
            isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
            'transparent'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
