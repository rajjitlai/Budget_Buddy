import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { ChevronDown, Check, Wallet } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/ThemeContext';
import { colors, spacing, typography, borderRadius } from '@/lib/theme';
import { ModalSheet } from './ModalSheet';

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
  const [isModalVisible, setIsModalVisible] = useState(false);

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

      <ModalSheet
        visible={isModalVisible}
        onClose={handleClose}
        title={label || 'Select Account'}
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
      </ModalSheet>
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
