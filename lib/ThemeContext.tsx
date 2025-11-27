

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors } from './theme';

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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


