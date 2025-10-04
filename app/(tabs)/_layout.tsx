import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet } from "react-native";
import LoadingScreen from "../../components/LoadingScreen";
import { BottomTabBar } from "@react-navigation/bottom-tabs";

export default function TabLayout() {
  const theme = useAppTheme();
  const { authState, isInterpreter, profile } = useAuth();
  const isWeb = Platform.OS === "web";

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      tabBar={(props) => (
        <View style={styles.tabBarWrapper}>
          <View style={styles.left}>
            <Text style={styles.brand}>SILENT BRIDGE</Text>
          </View>
          <View style={styles.right}>
            <BottomTabBar {...props} />
          </View>
        </View>
      )}
      screenOptions={{
        tabBarPosition: "top",
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "600",
          textTransform: "none",
          flexShrink: 0,
        },
        tabBarItemStyle: {
          minWidth: 100,
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "transparent",
          elevation: 0,
          borderBottomWidth: 0,
        },
        tabBarIconStyle: {
          marginRight: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: isInterpreter ? "Requests" : "Search",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name={isInterpreter ? "assignment" : "search"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" size={size} color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="sign"
        options={{
          title: "Signs",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sign-language" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
  },
  brand: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});
