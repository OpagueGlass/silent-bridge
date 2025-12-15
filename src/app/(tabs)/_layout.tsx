import AppDrawer from "@/components/navigation/Drawer";
import AppHeader from "@/components/navigation/Header";
import LoadingScreen from "@/components/sections/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Redirect, Tabs, useSegments } from "expo-router";

import { View } from "react-native";
import NotificationPopup from "@/components/modals/NotificationPopup";

export default function TabLayout() {
  const { authState, isInterpreter, profile } = useAuth();
  const { isOpen, open, close } = useDisclosure();
  const segments = useSegments();
  const isChatRoom = segments[1] === "chat" && segments[2] !== undefined;

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Redirect href="/auth" />;
  }

  const menuItems = isInterpreter
    ? [
        { name: "index", title: "Home", icon: "home" },
        { name: "request", title: "Requests", icon: "inbox" },
        { name: "chat", title: "Chat", icon: "message" },
        { name: "availability", title: "Manage Availability", icon: "calendar-check" },
        { name: "history", title: "History", icon: "history" },
        { name: "sign", title: "Sign Dictionary", icon: "hand-back-right" },
        { name: "settings", title: "Settings", icon: "cog" },
      ]
    : [
        { name: "index", title: "Home", icon: "home" },
        { name: "search", title: "Search", icon: "magnify" },
        { name: "chat", title: "Chat", icon: "message" },
        { name: "history", title: "History", icon: "history" },
        { name: "sign", title: "Sign Dictionary", icon: "hand-back-right" },
        { name: "settings", title: "Settings", icon: "cog" },
      ];

  return (
    <View style={{ flex: 1 }}>
      <NotificationPopup profile={profile} />
      {!isChatRoom && <AppHeader onMenuPress={open} />}
      {!isChatRoom && <AppDrawer visible={isOpen} onClose={close} profile={profile} menuItems={menuItems} />}

      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        {menuItems.map((item) => (
          <Tabs.Screen key={item.name} name={item.name} options={{ title: item.title }} />
        ))}
      </Tabs>
    </View>
  );
}
