
import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const authClient = createAuthClient({
    baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
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
        convexClient(),
    ],
});


