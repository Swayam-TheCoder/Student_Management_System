export interface ColorTheme {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  podiumGold: string;
  podiumSilver: string;
  podiumBronze: string;
  inputBackground: string;
  placeholder: string;
  statusBar: 'light' | 'dark';
}

export const lightColors: ColorTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  primary: '#4f46e5',
  primaryLight: '#eef2ff',
  secondary: '#0ea5e9',
  accent: '#8b5cf6',
  success: '#10b981',
  successLight: '#ecfdf5',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  danger: '#ef4444',
  dangerLight: '#fef2f2',
  podiumGold: '#f59e0b',
  podiumSilver: '#94a3b8',
  podiumBronze: '#b45309',
  inputBackground: '#f1f5f9',
  placeholder: '#94a3b8',
  statusBar: 'dark',
};

export const darkColors: ColorTheme = {
  background: '#0b0f19',
  surface: '#151d30',
  card: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  border: '#334155',
  primary: '#6366f1',
  primaryLight: '#312e81',
  secondary: '#38bdf8',
  accent: '#a78bfa',
  success: '#34d399',
  successLight: '#064e3b',
  warning: '#fbbf24',
  warningLight: '#78350f',
  danger: '#f87171',
  dangerLight: '#7f1d1d',
  podiumGold: '#fbbf24',
  podiumSilver: '#cbd5e1',
  podiumBronze: '#d97706',
  inputBackground: '#0f172a',
  placeholder: '#64748b',
  statusBar: 'light',
};

