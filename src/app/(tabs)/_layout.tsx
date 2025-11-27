import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Tabs } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import AppDrawer from "@/components/navigation/Drawer";
import AppHeader from "@/components/navigation/Header";
import LoadingScreen from "@/components/sections/LoadingScreen";

export default function TabLayout() {
  const { authState, isInterpreter, profile } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

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
        { name: "availability", title: "Manage Availability", icon: "calendar-check" },
        { name: "history", title: "History", icon: "history" },
        { name: "sign", title: "Sign", icon: "hand-back-right" },
        { name: "settings", title: "Settings", icon: "cog" },
      ]
    : [
        { name: "index", title: "Home", icon: "home" },
        { name: "search", title: "Search", icon: "magnify" },
        { name: "history", title: "History", icon: "history" },
        { name: "sign", title: "Sign", icon: "hand-back-right" },
        { name: "settings", title: "Settings", icon: "cog" },
      ];

  return (
    <View style={{ flex: 1 }}>
      <AppHeader onMenuPress={() => setDrawerVisible(true)} />

      <AppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        profile={profile}
        menuItems={menuItems}
      />

      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        {menuItems.map((item) => (
          <Tabs.Screen key={item.name} name={item.name} options={{ title: item.title }} />
        ))}
      </Tabs>
    </View>
  );
}
