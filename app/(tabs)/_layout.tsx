import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Pressable,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import { useRouter } from "expo-router";

type MaterialIconName =
  | "home"
  | "search"
  | "assignment"
  | "chat"
  | "sign-language"
  | "settings";

export default function TabLayout() {
  const theme = useAppTheme();
  const { authState, isInterpreter, profile } = useAuth();
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Redirect href="/auth" />;
  }

  // Tabs data with typed icons
  const tabs: {
    name: string;
    title: string;
    icon: MaterialIconName;
  }[] = [
    { name: "index", title: "Home", icon: "home" },
    {
      name: "search",
      title: isInterpreter ? "Requests" : "Search",
      icon: isInterpreter ? "assignment" : "search",
    },
    { name: "chat", title: "Chat", icon: "chat" },
    { name: "sign", title: "Signs", icon: "sign-language" },
    { name: "settings", title: "Settings", icon: "settings" },
  ];

  return (
    <Tabs
      tabBar={(props) => (
        <View style={styles.tabBarWrapper}>
          <View style={styles.left}>
            <Text style={styles.brand}>SILENT BRIDGE</Text>
          </View>

          {isMobile ? (
            <>
              <Pressable
                onPress={() => setMenuVisible(true)}
                style={styles.hamburger}
                accessibilityLabel="Open menu"
                accessibilityHint="Opens navigation menu"
              >
                <MaterialIcons name="menu" size={28} color="#000" />
              </Pressable>

              <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
              >
                <Pressable
                  style={styles.overlay}
                  onPress={() => setMenuVisible(false)}
                >
                  <View style={styles.menu}>
                    {tabs.map(({ name, title, icon }) => (
                      <TouchableOpacity
                        key={name}
                        style={styles.menuItem}
                        onPress={() => {
                          setMenuVisible(false);
                          router.push(
                            name === "index"
                              ? "/"
                              : name === "chat"
                              ? "/(tabs)/chat"
                              : name === "search"
                              ? "/(tabs)/search"
                              : name === "sign"
                              ? "/(tabs)/sign"
                              : name === "settings"
                              ? "/(tabs)/settings"
                              : "/"
                          );
                        }}
                      >
                        <MaterialIcons name={icon} size={20} color={theme.colors.primary} />
                        <Text
                          style={[
                            styles.menuItemText,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </>
          ) : (
            <View style={styles.right}>
              <BottomTabBar {...props} />
            </View>
          )}
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
      {tabs.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={icon} size={size} color={color} />
            ),
            href: name === "chat" ? null : undefined,
          }}
        />
      ))}
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
  hamburger: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menu: {
    backgroundColor: "#fff",
    width: 220,
    paddingVertical: 16,
    borderRadius: 6,
    marginTop: 60,
    marginRight: 16,
    elevation: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
