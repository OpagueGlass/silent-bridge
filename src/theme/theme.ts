import { MD3LightTheme as DefaultTheme } from "react-native-paper"

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // primary: "#23408e",
    // secondary: "#385399",
    // tertiary: "#F59E0B",
    // background: "#F1F5F9",
    // surface: "rgba(251, 253, 255, 1)",
    // surfaceVariant: "#F8FAFC",
    // error: "#ed1b24",
    // onSurface: "#1E293B",
    // onSurfaceVariant: "#64748B",
    // outline: "#cccccc",
  
    // primary: "#2E4A70",
    // secondary: "#73C7E3",
    // tertiary: "#CF8A40",
    // background: "#F0F2F2",
    // surface: "#FFF9F0",
    // surfaceVariant: "#F8FAFC",
    // error: "#EF4444",
    // success: "#10B981",
    // onSurface: "#2E4A70",
    // onSurfaceVariant: "#64748B",
    // outline: "#E2E8F0",

    primary: "#2D6A9E",
    secondary: "#34959E",
    tertiary: "#F0B429",
    background: "#F4F7FA",
    surface: "#FFFFFF",
    surfaceVariant: "#E8EEF3",
    error: "#E57373",
    success: "#65C18C",
    onSurface: "#273240",
    onSurfaceVariant: "#606F81",
    outline: "#DDE3EA",
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
