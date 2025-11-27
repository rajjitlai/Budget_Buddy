

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function ModalSheet({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}: ModalSheetProps) {
  const { isDarkMode, textPrimary, borderColor } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            entering={SlideInDown.springify().damping(20)}
            exiting={SlideOutDown.springify().damping(20)}
            style={[
              styles.content,
              {
                backgroundColor: isDarkMode ? colors.slate[800] : '#ffffff',
              },
            ]}
          >
            <View style={styles.header}>
              <View
                style={[styles.handle, { backgroundColor: borderColor }]}
              />
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: textPrimary }]}>
                  {title}
                </Text>
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={[
                      styles.closeButton,
                      {
                        backgroundColor: isDarkMode
                          ? colors.slate[700]
                          : colors.slate[100],
                      },
                    ]}
                  >
                    <X
                      size={20}
                      color={isDarkMode ? colors.slate[300] : colors.slate[600]}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    maxHeight: '90%',
    ...shadows.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
});

