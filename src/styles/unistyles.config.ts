import { Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const fonts = Platform.select({
  ios: {
    sans: "system-ui" as const,
    mono: "ui-monospace" as const,
    rounded: "ui-rounded" as const,
  },
  default: {
    sans: "normal" as const,
    mono: "monospace" as const,
    rounded: "normal" as const,
  },
});

const darkTheme = {
  colors: {
    background: "#08233E",
    surface: "#0D2F52",
    surfaceElevated: "#143E66",
    text: "#FFFFFF",
    textSecondary: "#A0BECF",
    textTertiary: "#5E8499",
    accent: "#F5A623",
    accentDim: "#F5A62333",
    border: "#1E4A70",
    error: "#FF6B6B",
    success: "#4ADE80",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    resultLarge: {
      fontSize: 52,
      fontWeight: "700" as const,
      fontFamily: fonts.mono,
    },
    codeLarge: {
      fontSize: 32,
      fontWeight: "700" as const,
      fontFamily: fonts.mono,
    },
    codeMedium: {
      fontSize: 18,
      fontWeight: "600" as const,
      fontFamily: fonts.mono,
    },
    heading: {
      fontSize: 28,
      fontWeight: "700" as const,
      fontFamily: fonts.sans,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: fonts.sans,
    },
    caption: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fonts.sans,
    },
    numpad: {
      fontSize: 28,
      fontWeight: "500" as const,
      fontFamily: fonts.sans,
    },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  fonts,
};

type AppThemes = {
  dark: typeof darkTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: {
    dark: darkTheme,
  },
  settings: {
    initialTheme: "dark",
  },
});
