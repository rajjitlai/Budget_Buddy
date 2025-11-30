import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ChevronDown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/ThemeContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme';

export interface SelectOption {
  id: string;
  label: string;
  icon?: string;
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
  const { isDarkMode, cardBackground, textPrimary, textSecondary, borderColor, backgroundColor } =
    useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedOption = options.find((opt) => opt.id === value);

  const borderColorStyle = error
    ? colors.error
    : isFocused
    ? colors.primary[500]
    : borderColor;

  const handleSelect = (optionId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(optionId);
    setIsModalVisible(false);
    setIsFocused(false);
  };

  const handleOpen = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsModalVisible(true);
    setIsFocused(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setIsFocused(false);
  };

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
            borderColor: borderColorStyle,
          },
        ]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            {
              color: selectedOption ? textPrimary : textSecondary,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color={textSecondary} />
      </TouchableOpacity>
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[styles.modalContent, { backgroundColor: cardBackground }]}
          >
            <SafeAreaView edges={['bottom']}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textPrimary }]}>
                  {label}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={[styles.modalClose, { color: colors.primary[500] }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = value === item.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        isSelected && { backgroundColor: `${colors.primary[500]}10` },
                      ]}
                      onPress={() => handleSelect(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: isSelected ? colors.primary[500] : textPrimary,
                            fontWeight: isSelected
                              ? typography.fontWeights.semibold
                              : typography.fontWeights.normal,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <Check size={20} color={colors.primary[500]} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                style={styles.optionsList}
              />
            </SafeAreaView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: spacing.xs,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  selectText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '70%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  modalClose: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  optionText: {
    fontSize: typography.fontSizes.md,
    flex: 1,
  },
});
