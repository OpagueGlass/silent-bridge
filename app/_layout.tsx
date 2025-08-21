import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { theme } from "@/theme/theme";
import { showError } from "@/utils/alert";

// function NavigationHandler() {
//   const { authState, userProfile, user } = useAuth();

//   useEffect(() => {
//     // Add delay to ensure root layout is mounted
//     const handleNavigation = () => {
//       if (!authState.isLoading && !userProfile) {

//         router.replace("/auth");
//         if (user && !userProfile) {
//           showError("Profile not found. Please complete your profile setup.");
//         }

//       }
//     };

//     const timeoutId = setTimeout(handleNavigation, 1);
//     return () => clearTimeout(timeoutId);
//   }, [userProfile, authState.isLoading]);

//   return null;
// }

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        {/* <NavigationHandler /> */}
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
