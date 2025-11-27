import { MD3LightTheme as DefaultTheme } from "react-native-paper"

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "rgb(37, 89, 189)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(218, 226, 255)",
    onPrimaryContainer: "rgb(0, 25, 70)",
    secondary: "rgb(0, 99, 153)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(205, 229, 255)",
    onSecondaryContainer: "rgb(0, 29, 50)",
    tertiary: "rgb(0, 84, 214)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(218, 225, 255)",
    onTertiaryContainer: "rgb(0, 24, 73)",
    success: "#28A745",
    error: "#DC3545",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",
    background: "rgb(254, 251, 255)",
    onBackground: "rgb(27, 27, 31)",
    surface: "rgb(254, 251, 255)",
    onSurface: "rgb(27, 27, 31)",
    surfaceVariant: "rgb(225, 226, 236)",
    onSurfaceVariant: "rgb(68, 70, 79)",
    outline: "#E3E3E3",
    outlineVariant: "rgb(197, 198, 208)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(48, 48, 52)",
    inverseOnSurface: "rgb(242, 240, 244)",
    inversePrimary: "rgb(177, 197, 255)",
    elevation: {
      level0: "transparent",
      level1: "rgb(243, 243, 252)",
      level2: "rgb(237, 238, 250)",
      level3: "rgb(230, 233, 248)",
      level4: "rgb(228, 232, 247)",
      level5: "rgb(224, 228, 246)"
    },
    surfaceDisabled: "rgba(27, 27, 31, 0.12)",
    onSurfaceDisabled: "rgba(27, 27, 31, 0.38)",
    backdrop: "rgba(46, 48, 56, 0.4)"
  },
  roundness: 8,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const typography = {
  displayLarge: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: "600" as const,
    lineHeight: 36,
  },
  headlineLarge: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
  },
  headlineMedium: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  titleLarge: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 22,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
  },
}

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
}
