

import React from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { UserProvider, useUser } from "@/lib/UserContext";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function ThemedStatusBar() {
    const { isDarkMode } = useTheme();
    return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}

function RootLayoutNav() {
    const { user, loading } = useUser();
    const router = useRouter();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={styles.container}>
                <UserProvider>
                    <ThemeProvider>
                        <ThemedStatusBar />
                        <RootLayoutNav />
                    </ThemeProvider>
                </UserProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
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


