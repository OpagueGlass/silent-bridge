import { MD3LightTheme as DefaultTheme } from "react-native-paper"

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6366F1", // Modern indigo
    secondary: "#10B981", // Emerald green
    tertiary: "#F59E0B", // Amber
    surface: "#FFFFFF",
    surfaceVariant: "#F8FAFC",
    background: "#F1F5F9",
    error: "#EF4444",
    onSurface: "#1E293B",
    onSurfaceVariant: "#64748B",
    outline: "#E2E8F0",
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
