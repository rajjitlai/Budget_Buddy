

import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { ThemeProvider } from "@/lib/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

// Create Convex client only if URL is provided (for future Appwrite migration)
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
const convex = convexUrl 
    ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
    : null;

// Wrapper component to conditionally render Convex providers
function AppProviders({ children }: { children: React.ReactNode }) {
    if (convex) {
        return (
            <ConvexBetterAuthProvider client={convex} authClient={authClient}>
                {children}
            </ConvexBetterAuthProvider>
        );
    }
    // Without Convex, just render children (UI testing mode)
    return <>{children}</>;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <AppProviders>
                <ThemeProvider>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </ThemeProvider>
            </AppProviders>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});


