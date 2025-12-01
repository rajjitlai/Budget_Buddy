import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { signIn } from '@/lib/services/auth';
import { useAppwrite } from '@/lib/AppwriteContext';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function LoginScreen() {
    const { backgroundColor, textPrimary, textSecondary, cardBackground } = useTheme();
    const { refreshUser } = useAppwrite();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await signIn(email.trim(), password);
            await refreshUser();
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.message || 'Invalid email or password. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(500)}
                        style={styles.header}
                    >
                        <Text style={[styles.title, { color: textPrimary }]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.subtitle, { color: textSecondary }]}>
                            Sign in to continue to Budget Buddy
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(200).duration(500)}
                        style={[styles.form, { backgroundColor: cardBackground }]}
                    >
                        <InputField
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            error={errors.email}
                            icon={<Mail size={18} color={textSecondary} />}
                        />

                        <InputField
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            error={errors.password}
                            icon={<Lock size={18} color={textSecondary} />}
                        />

                        <PrimaryButton
                            title="Sign In"
                            onPress={handleLogin}
                            disabled={loading}
                            fullWidth
                            size="lg"
                            icon={<LogIn size={20} color="#ffffff" />}
                            style={styles.loginButton}
                        />
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(300).duration(500)}
                        style={styles.footer}
                    >
                        <Text style={[styles.footerText, { color: textSecondary }]}>
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/signup')}>
                            <Text style={[styles.linkText, { color: colors.primary[500] }]}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing['3xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['3xl'],
    },
    title: {
        fontSize: typography.fontSizes['3xl'],
        fontWeight: typography.fontWeights.bold,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSizes.md,
        textAlign: 'center',
    },
    form: {
        padding: spacing.xl,
        borderRadius: borderRadius['2xl'],
        ...shadows.md,
    },
    loginButton: {
        marginTop: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        fontSize: typography.fontSizes.md,
    },
    linkText: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.semibold,
    },
});

