import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Stack, Tabs, useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import LoadingScreen from "../../components/sections/LoadingScreen";

export default function TabLayout() {
  const theme = useAppTheme();
  const { authState, isInterpreter, profile } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Redirect href="/auth" />;
  }

  const menuItems = isInterpreter
    ? [
        { name: "index", title: "Home", icon: "home" },
        { name: "search", title: "Requests", icon: "inbox" },
        { name: "history", title: "History", icon: "history" },
        { name: "availability", title: "Availability", icon: "calendar-today" },
        { name: "settings", title: "Settings", icon: "settings" },
      ]
    : [
        { name: "index", title: "Home", icon: "home" },
        { name: "search", title: "Search", icon: "search" },
        { name: "sign", title: "Sign", icon: "sign-language" },
        { name: "history", title: "History", icon: "history" },
        { name: "settings", title: "Settings", icon: "settings" },
      ];

  return (
    <>
      <View style={styles.hamburgerWrapper}>
        <Pressable
          onPress={() => setMenuVisible(true)}
          style={styles.hamburger}
          accessibilityLabel="Open menu"
          accessibilityHint="Opens navigation menu"
        >
          <MaterialIcons name="menu" size={28} color={theme.colors.outline} />
        </Pressable>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
            <View style={styles.menu}>
              {menuItems.map(({ name, title, icon }) => (
                <TouchableOpacity
                  key={name}
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    const route =
                      name === "index"
                        ? "/(tabs)"
                        : name === "search"
                        ? "/(tabs)/search"
                        : name === "sign"
                        ? "/(tabs)/sign"
                        : name === "history"
                        ? "/(tabs)/history"
                        : name === "availability"
                        ? "/(tabs)/availability"
                        : "/(tabs)/settings";
                    router.push(route as any);
                  }}
                >
                  <MaterialIcons name={icon as any} size={20} color={theme.colors.primary} />
                  <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>{title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>

      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tabs.Screen name="index"/>
        <Tabs.Screen name="search" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="sign" />
        <Tabs.Screen name="settings" />
        {isInterpreter && <Tabs.Screen name="availability" />}
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  hamburgerWrapper: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  hamburger: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  menu: {
    backgroundColor: "#fff",
    width: 240,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 60,
    marginLeft: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});