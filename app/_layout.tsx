

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { ThemeProvider } from "@/lib/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
});

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <ConvexBetterAuthProvider client={convex} authClient={authClient}>
                <ThemeProvider>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </ThemeProvider>
            </ConvexBetterAuthProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});


