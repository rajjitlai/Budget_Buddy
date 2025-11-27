
import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Use a placeholder URL if Convex is not configured (for UI testing)
const baseURL = process.env.EXPO_PUBLIC_CONVEX_SITE_URL || "http://localhost:3000";

export const authClient = createAuthClient({
    baseURL,
    plugins: [
        anonymousClient(),
        ...(Platform.OS === "web"
            ? [crossDomainClient()]
            : [
                  expoClient({
                      scheme: Constants.expoConfig?.scheme as string,
                      storagePrefix: Constants.expoConfig?.scheme as string,
                      storage: SecureStore,
                  }),
              ]),
        // Only add convexClient if Convex URL is configured
        ...(process.env.EXPO_PUBLIC_CONVEX_URL ? [convexClient()] : []),
    ],
});
