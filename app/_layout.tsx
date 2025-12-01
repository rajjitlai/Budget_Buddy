

import React from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { AppwriteProvider, useAppwrite } from "@/lib/AppwriteContext";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useEffect } from "react";

function ThemedStatusBar() {
    const { isDarkMode } = useTheme();
    return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}

function RootLayoutNav() {
    const { isAuthenticated, loading } = useAppwrite();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === "(tabs)";

        if (!isAuthenticated && inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace("/login");
        } else if (isAuthenticated && !inAuthGroup) {
            // Redirect to tabs if authenticated
            router.replace("/(tabs)");
        }
    }, [isAuthenticated, loading, segments]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <AppwriteProvider>
                <ThemeProvider>
                    <ThemedStatusBar />
                    <RootLayoutNav />
                </ThemeProvider>
            </AppwriteProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});


