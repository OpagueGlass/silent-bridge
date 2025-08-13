// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../hooks/useAppTheme';

/**
 * Navigation Handler Component
 * Handles automatic navigation based on authentication state
 */
function NavigationHandler() {
  const { authState, userProfile, user } = useAuth();

  useEffect(() => {
    const handleNavigation = () => {
      console.log('Navigation check:', {
        isLoading: authState.isLoading,
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!user,
        hasProfile: !!userProfile
      });

      // Only redirect when loading is complete
      if (!authState.isLoading) {
        if (!authState.isAuthenticated || !user) {
          // Not authenticated, redirect to auth
          console.log('Redirecting to auth - not authenticated');
          router.replace("/auth");
        } else if (authState.isAuthenticated && user && userProfile) {
          // Fully authenticated with profile, redirect to main app
          console.log('User authenticated, ensuring on main tabs');
          router.replace("/(tabs)");
        }
        // If authenticated but no profile, stay on current screen
        // (might be in profile setup process)
      }
    };

    // Small delay to ensure proper mounting
    const timeoutId = setTimeout(handleNavigation, 100);
    return () => clearTimeout(timeoutId);
  }, [authState.isAuthenticated, authState.isLoading, user, userProfile]);

  return null;
}

/**
 * Root Layout with Auth Provider
 */
function RootLayoutWithAuth() {
  const theme = useAppTheme();

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <AuthProvider>
          <NavigationHandler />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
              name="index" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="auth" 
              options={{ 
                headerShown: false,
                gestureEnabled: false // Prevent swipe back on auth screen
              }} 
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                gestureEnabled: false // Prevent swipe back from main app
              }} 
            />
            <Stack.Screen 
              name="videocall" 
              options={{ 
                headerShown: true,
                title: 'Video Call',
                presentation: 'fullScreenModal'
              }} 
            />
            <Stack.Screen 
              name="+not-found" 
              options={{ 
                headerShown: true,
                title: 'Page Not Found'
              }} 
            />
          </Stack>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutWithAuth />;
}
