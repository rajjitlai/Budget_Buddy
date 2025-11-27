

import React from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AppwriteProvider } from "@/lib/AppwriteContext";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <AppwriteProvider>
                <ThemeProvider>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </ThemeProvider>
            </AppwriteProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});


