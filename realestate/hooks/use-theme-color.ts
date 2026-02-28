/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeColors = typeof Colors.light;

// Overload 1: called with no args → returns the full theme object (typed)
export function useThemeColor(): ThemeColors;
// Overload 2: called with props/colorName → returns a string
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof ThemeColors
): string;
// Overload 3: called with just colorName → returns a string
export function useThemeColor(
  props: undefined,
  colorName: keyof ThemeColors
): string;

// Implementation
export function useThemeColor(
  props?: { light?: string; dark?: string },
  colorName?: keyof ThemeColors
): ThemeColors | string {
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme] as ThemeColors;

  if (props) {
    const colorFromProps = props[theme];
    if (colorFromProps) return colorFromProps;
  }

  if (colorName) {
    return themeColors[colorName];
  }

  return themeColors;
}

/**
 * Convenience hook that always returns the full typed theme color object.
 * Use this when you need access to multiple colors from the current theme.
 *
 * @example
 * const colors = useTheme();
 * <View style={{ backgroundColor: colors.background }} />
 */
export function useTheme(): ThemeColors {
  const theme = useColorScheme() ?? 'light';
  return Colors[theme] as ThemeColors;
}
