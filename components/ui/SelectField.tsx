

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ViewStyle,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from 'react-native-reanimated';
import { ChevronDown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface SelectOption {
    id: string;
    label: string;
    icon?: string;
}

interface SelectFieldProps {
    label: string;
    options: SelectOption[];
    value: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export function SelectField({
    label,
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    error,
    containerStyle,
}: SelectFieldProps) {
    const { isDarkMode, cardBackground, textPrimary, textSecondary, borderColor, backgroundColor } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const rotation = useSharedValue(0);

    const selectedOption = options.find((opt) => opt.id === value);

    const handleOpen = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setIsOpen(true);
        rotation.value = withSpring(180);
    };

    const handleClose = () => {
        setIsOpen(false);
        rotation.value = withSpring(0);
    };

    const handleSelect = (optionId: string) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onChange(optionId);
        handleClose();
    };

    const animatedChevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={[styles.label, { color: textSecondary }]}>{label}</Text>
            <TouchableOpacity

                onPress={handleOpen}
                activeOpacity={0.7}
                style={[
                    styles.selectButton,
                    {
                        backgroundColor: cardBackground,
                        borderColor: error ? colors.error : borderColor,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.selectText,
                        { color: selectedOption ? textPrimary : textSecondary },
                    ]}
                >
                    {selectedOption?.label || placeholder}
                </Text>
                <Animated.View style={animatedChevronStyle}>
                    <ChevronDown size={20} color={textSecondary} />
                </Animated.View>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={handleClose}
            >
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={handleClose}
                    />
                    <Animated.View
                        entering={SlideInDown.springify().damping(20)}
                        exiting={SlideOutDown.springify().damping(20)}
                        style={[
                            styles.modalContent,
                            { backgroundColor: isDarkMode ? colors.slate[800] : '#ffffff' },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textPrimary }]}>
                                {label}
                            </Text>
                            <View
                                style={[styles.modalHandle, { backgroundColor: borderColor }]}
                            />
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item.id)}
                                    style={[
                                        styles.optionItem,
                                        value === item.id && {
                                            backgroundColor: isDarkMode
                                                ? colors.primary[900]
                                                : colors.primary[50],
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            { color: textPrimary },
                                            value === item.id && { color: colors.primary[500] },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {value === item.id && (
                                        <Check size={20} color={colors.primary[500]} />
                                    )}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                            style={styles.optionsList}
                        />
                    </Animated.View>
                </Animated.View>
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
        marginBottom: spacing.sm,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        paddingHorizontal: spacing.lg,
        minHeight: 52,
    },
    selectText: {
        fontSize: typography.fontSizes.md,
        flex: 1,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSizes.sm,
        marginTop: spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius['3xl'],
        borderTopRightRadius: borderRadius['3xl'],
        maxHeight: '70%',
        ...shadows.xl,
    },
    modalHeader: {
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate[200],
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: typography.fontSizes.lg,
        fontWeight: typography.fontWeights.semibold,
    },
    optionsList: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        marginVertical: spacing.xs,
    },
    optionText: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.medium,
    },
});

