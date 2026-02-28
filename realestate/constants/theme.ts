const tintColorLight = '#1B2B4B';
const tintColorDark = '#E8A87C';

const lightColors = {
    primary: '#1B2B4B',
    primaryLight: '#2E4270',
    accent: '#C97B4B',
    accentLight: '#E8A87C',
    accentSoft: '#F5E6D8',
    background: '#FAF8F5',
    surface: '#FFFFFF',
    surfaceAlt: '#F2EDE6',
    text: '#1A1A1A',
    textSecondary: '#6B6560',
    textMuted: '#A09890',
    border: '#E8E0D5',
    borderLight: '#F0EAE1',
    success: '#2D7A4F',
    successLight: '#E8F5EE',
    error: '#C0392B',
    errorLight: '#FDEDEC',
    warning: '#D4820A',
    warningLight: '#FEF3E2',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(27, 43, 75, 0.5)',
    shadow: 'rgba(27, 43, 75, 0.12)',
    tint: tintColorLight,
    icon: '#1A1A1A',
    tabIconDefault: '#6B6560',
    tabIconSelected: tintColorLight,
  };

const darkColors = {
    primary: '#F0EAE1',
    primaryLight: '#D1C8B8',
    accent: '#E8A87C',
    accentLight: '#F5E6D8',
    accentSoft: '#4A3324',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceAlt: '#2C2C2C',
    text: '#EFEFEF',
    textSecondary: '#B0B0B0',
    textMuted: '#7A7A7A',
    border: '#333333',
    borderLight: '#444444',
    success: '#4ADE80',
    successLight: '#143823',
    error: '#F87171',
    errorLight: '#421E1E',
    warning: '#FBBF24',
    warningLight: '#45350E',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    tint: tintColorDark,
    icon: '#EFEFEF',
    tabIconDefault: '#7A7A7A',
    tabIconSelected: tintColorDark,
  };

export const Colors = {
  ...lightColors,
  light: lightColors,
  dark: darkColors,
};

export const Typography = {
  // Display sizes
  display: { fontSize: 36, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.8 },
  button: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.3 },
};

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};

export const Shadow = {
  sm: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
};