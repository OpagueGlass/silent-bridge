// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Platform } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Tab bar icon component with consistent styling
 */
function TabBarIcon({ 
  name, 
  color, 
  size = 24 
}: { 
  name: keyof typeof MaterialIcons.glyphMap; 
  color: string; 
  size?: number; 
}) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

/**
 * Loading component for tab layout
 */
function LoadingScreen() {
  const theme = useAppTheme();
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    }}>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={{ marginBottom: 16 }}
      />
      <Text 
        variant="bodyLarge"
        style={{ 
          color: theme.colors.onBackground,
          textAlign: 'center'
        }}
      >
        Loading your workspace...
      </Text>
    </View>
  );
}

/**
 * Main tab layout component
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useAppTheme();
  const { authState, userProfile, isInterpreter } = useAuth();

  console.log('TabLayout render:', {
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    hasProfile: !!userProfile,
    isInterpreter
  });

  // Show loading screen while authentication state is being determined
  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to auth if not authenticated
  if (!authState.isAuthenticated) {
    console.log('TabLayout: Not authenticated, redirecting to auth');
    return <Redirect href="/auth" />;
  }

  // Wait for user profile to load
  if (!userProfile) {
    return <LoadingScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        // Tab bar styling
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingTop: Platform.OS === 'ios' ? 0 : 4,
          paddingBottom: Platform.OS === 'ios' ? 20 : 4,
          height: Platform.OS === 'ios' ? 90 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: Platform.OS === 'ios' ? -4 : 0,
        },
        headerShown: false,
        
        // Tab animation
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />

      {/* Search/Requests Tab - Dynamic based on user type */}
      <Tabs.Screen
        name="search"
        options={{
          title: isInterpreter ? 'Requests' : 'Search',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon 
              name={isInterpreter ? 'assignment' : 'search'} 
              color={color} 
              size={size} 
            />
          ),
          tabBarAccessibilityLabel: isInterpreter ? 'Interpretation requests' : 'Search interpreters',
        }}
      />

      {/* Video Call Tab */}
      <Tabs.Screen
        name="videocall"
        options={{
          title: 'Video Call',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="videocam" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Start or join video call',
        }}
      />

      {/* Chat Tab */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="chat" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Chat messages',
          // Show badge for unread messages (you can implement this later)
          // tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />

      {/* Profile/Settings Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'User profile and settings',
        }}
      />

      {/* Settings Tab - Alternative if you want separate settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="settings" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'App settings',
          // Hide this tab if you want to combine with profile
          href: null, // This will hide the tab
        }}
      />
    </Tabs>
  );
}
