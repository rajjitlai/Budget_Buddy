import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDown, Check, X, Wallet } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/ThemeContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme';

export interface SelectOption {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
}: SelectFieldProps) {
  const { isDarkMode, cardBackground, textPrimary, textSecondary, borderColor } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isModalVisible) {
      scale.value = withSpring(1, { damping: 24, stiffness: 280, mass: 0.7 });
      opacity.value = withTiming(1, { duration: 180 });
    } else {
      scale.value = withTiming(0.92, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [isModalVisible]);

  // Android back button handling
  useEffect(() => {
    if (!isModalVisible) return;
    const onBack = () => {
      handleClose();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [isModalVisible]);

  const selectedOption = options.find((opt) => opt.id === value);

  const handleSelect = (optionId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(optionId);
    handleClose();
  };

  const handleOpen = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const modalWidth = Math.min(width - spacing.xl * 2, 460);
  const maxModalHeight = Math.min(height - (insets.top + insets.bottom + 48), 580);

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: textPrimary }]}>{label}</Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.selectContainer,
          {
            backgroundColor: cardBackground,
            borderColor: error ? colors.error : isModalVisible ? colors.primary[500] : borderColor,
          },
        ]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <View style={styles.selectedContent}>
          {selectedOption?.icon ? (
            <Text style={{ fontSize: 18, marginRight: spacing.sm }}>{selectedOption.icon}</Text>
          ) : null}
          <Text
            style={[
              styles.selectText,
              {
                color: selectedOption ? textPrimary : textSecondary,
                fontWeight: selectedOption ? '600' : 'normal',
              },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <ChevronDown size={18} color={textSecondary} />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {/* Centered Popup Grid Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <TouchableOpacity
              style={styles.backdropTouchable}
              activeOpacity={1}
              onPress={handleClose}
            />
          </Animated.View>

          {/* Centered Card */}
          <View
            style={[
              styles.centerWrapper,
              {
                paddingTop: insets.top + spacing.md,
                paddingBottom: insets.bottom + spacing.md,
              },
            ]}
            pointerEvents="box-none"
          >
            <Animated.View
              style={[
                styles.popupCard,
                {
                  width: modalWidth,
                  maxHeight: maxModalHeight,
                  backgroundColor: cardBackground,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)',
                },
                cardAnimStyle,
              ]}
            >
              {/* Header */}
              <View
                style={[
                  styles.modalHeader,
                  {
                    borderBottomColor: isDarkMode
                      ? 'rgba(255, 255, 255, 0.08)'
                      : colors.slate[200],
                  },
                ]}
              >
                <Text style={[styles.modalTitle, { color: textPrimary }]}>
                  {label || 'Select Account'}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: isDarkMode
                        ? 'rgba(255, 255, 255, 0.06)'
                        : colors.slate[100],
                    },
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <X size={18} color={textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Grid Content */}
              <ScrollView
                style={styles.gridScroll}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <View style={styles.gridRow}>
                  {options.map((item) => {
                    const isSelected = value === item.id;
                    const itemColor = item.color || colors.primary[500];

                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleSelect(item.id)}
                        activeOpacity={0.75}
                        style={[
                          styles.gridCard,
                          {
                            backgroundColor: isSelected
                              ? `${itemColor}15`
                              : isDarkMode
                              ? 'rgba(255, 255, 255, 0.03)'
                              : colors.slate[50],
                            borderColor: isSelected ? itemColor : borderColor,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.iconRing,
                            {
                              backgroundColor: `${itemColor}18`,
                              borderColor: `${itemColor}35`,
                            },
                          ]}
                        >
                          {item.icon ? (
                            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                          ) : (
                            <Wallet size={20} color={itemColor} />
                          )}
                        </View>

                        <Text
                          style={[
                            styles.cardLabel,
                            {
                              color: isSelected ? itemColor : textPrimary,
                              fontWeight: isSelected ? 'bold' : '600',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>

                        {isSelected && (
                          <View
                            style={[
                              styles.checkBadge,
                              { backgroundColor: itemColor },
                            ]}
                          >
                            <Check size={12} color="#ffffff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    minHeight: 48,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectText: {
    fontSize: typography.fontSizes.md,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
  },
  modalRoot: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdropTouchable: {
    flex: 1,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  popupCard: {
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  gridContent: {
    padding: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 90,
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  cardLabel: {
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
