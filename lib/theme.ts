

// Budget Buddy Theme Configuration

export const colors = {
  // Primary palette - Deep slate with emerald accents
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main emerald
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Neutral backgrounds
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Background colors
  background: {
    light: '#f8fafc',
    dark: '#0f172a',
    card: {
      light: '#ffffff',
      dark: '#1e293b',
    },
  },

  // Text colors
  text: {
    primary: {
      light: '#0f172a',
      dark: '#f8fafc',
    },
    secondary: {
      light: '#64748b',
      dark: '#94a3b8',
    },
    muted: {
      light: '#94a3b8',
      dark: '#64748b',
    },
  },

  // Gradient presets
  gradients: {
    emerald: ['#10b981', '#059669'],
    slate: ['#334155', '#1e293b'],
    purple: ['#8b5cf6', '#7c3aed'],
    blue: ['#3b82f6', '#2563eb'],
    orange: ['#f97316', '#ea580c'],
    pink: ['#ec4899', '#db2777'],
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
};

/**
 * Sophisticated layered shadows for premium depth
 * Using multiple layers to simulate natural light falloff
 */
export const shadows = {
  sm: {
    boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.04), 0px 4px 8px rgba(15, 23, 42, 0.02)',
    elevation: 2,
  },
  md: {
    boxShadow: '0px 4px 8px rgba(15, 23, 42, 0.06), 0px 8px 16px rgba(15, 23, 42, 0.04)',
    elevation: 4,
  },
  lg: {
    boxShadow: '0px 8px 16px rgba(15, 23, 42, 0.08), 0px 16px 32px rgba(15, 23, 42, 0.06)',
    elevation: 8,
  },
  xl: {
    boxShadow: '0px 12px 24px rgba(15, 23, 42, 0.12), 0px 24px 48px rgba(15, 23, 42, 0.08)',
    elevation: 12,
  },
};

/**
 * Glassmorphism Utility
 */
export const glass = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
  borderWidth: 1,
  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.05)',
  backdropFilter: 'blur(20px)', // For web support if needed
});

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;


