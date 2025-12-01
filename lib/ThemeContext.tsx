

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Appearance, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors } from './theme';

const THEME_STORAGE_KEY = 'budget_buddy_theme';

async function getStoredTheme(): Promise<'light' | 'dark' | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window?.localStorage) {
        const value = window.localStorage.getItem(THEME_STORAGE_KEY);
        return value === 'dark' || value === 'light' ? value : null;
      }
      return null;
    }

    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) return null;
    const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch (error) {
    console.warn('Failed to load theme preference:', error);
    return null;
  }
}

async function setStoredTheme(value: 'light' | 'dark') {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window?.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, value);
      }
      return;
    }

    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) return;
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, value);
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  getColor: (colorPath: string) => string;
  backgroundColor: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemPrefersDark = Appearance.getColorScheme() === 'dark';
  const [isDarkMode, setIsDarkMode] = useState(systemPrefersDark);

  useEffect(() => {
    let isMounted = true;
    const loadThemePreference = async () => {
      const storedTheme = await getStoredTheme();
      if (storedTheme && isMounted) {
        setIsDarkMode(storedTheme === 'dark');
      }
    };
    loadThemePreference();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setStoredTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const getColor = (colorPath: string): string => {
    const parts = colorPath.split('.');
    let result: unknown = colors;
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = (result as Record<string, unknown>)[part];
      }
    }
    return typeof result === 'string' ? result : '#000000';
  };

  const value: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
    getColor,

    backgroundColor: isDarkMode ? colors.background.dark : colors.background.light,
    cardBackground: isDarkMode ? colors.background.card.dark : colors.background.card.light,
    textPrimary: isDarkMode ? colors.text.primary.dark : colors.text.primary.light,
    textSecondary: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    textMuted: isDarkMode ? colors.text.muted.dark : colors.text.muted.light,
    borderColor: isDarkMode ? colors.slate[700] : colors.slate[200],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


