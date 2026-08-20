import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    primary: '#0D9488', // Teal
    primaryLight: '#CCFBF1',
    primaryDark: '#0F766E',
    secondary: '#4F46E5', // Indigo
    secondaryLight: '#EEF2FF',
    accent: '#06B6D4', // Cyan
    accentLight: '#ECFEFF',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    success: '#10B981',
    successLight: '#D1FAE5',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    tint: '#0D9488',
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#0D9488',
    glassBackground: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    background: '#090D16',
    card: '#131B2E',
    cardBorder: '#1E293B',
    primary: '#14B8A6',
    primaryLight: '#115E59',
    primaryDark: '#0D9488',
    secondary: '#818CF8',
    secondaryLight: '#312E81',
    accent: '#22D3EE',
    accentLight: '#164E63',
    warning: '#FBBF24',
    warningLight: '#78350F',
    success: '#34D399',
    successLight: '#065F46',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
    tint: '#14B8A6',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#14B8A6',
    glassBackground: 'rgba(19, 27, 46, 0.85)',
    glassBorder: 'rgba(30, 41, 59, 0.8)',
    shadowColor: '#000000',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
