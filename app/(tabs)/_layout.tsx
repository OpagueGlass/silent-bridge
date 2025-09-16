import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import LoadingScreen from "../../components/LoadingScreen";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useAppTheme();
  const { authState, isInterpreter, profile } = useAuth();

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: isInterpreter ? "Requests" : "Search",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name={isInterpreter ? "assignment" : "search"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="chat" size={size} color={color} />,
          href: null,
        }}
      />
      <Tabs.Screen 
        name="sign" 
          options={{ 
            title: "Signs",
            tabBarIcon: ({ color, size }) => <MaterialIcons name="sign-language" size={size} color={color} />,
          }} 
      /> 
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
