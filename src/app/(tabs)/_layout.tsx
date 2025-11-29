import AppDrawer from "@/components/navigation/Drawer";
import AppHeader from "@/components/navigation/Header";
import LoadingScreen from "@/components/sections/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  const { authState, isInterpreter, profile } = useAuth();
  const {isOpen, open, close} = useDisclosure();

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <Redirect href="/auth" />;
  }

  const menuItems = isInterpreter
    ? [
        { name: "index", title: "Home", icon: "home" },
        { name: "request", title: "Request", icon: "inbox" },
        { name: "chat", title: "Chat", icon: "message" },
        { name: "availability", title: "Manage Availability", icon: "calendar-check" },
        { name: "history", title: "History", icon: "history" },
        { name: "sign", title: "Sign", icon: "hand-back-right" },
        { name: "settings", title: "Settings", icon: "cog" },
      ]
    : [
        { name: "index", title: "Home", icon: "home" },
        { name: "search", title: "Search", icon: "magnify" },
        { name: "chat", title: "Chat", icon: "message" },
        { name: "history", title: "History", icon: "history" },
        { name: "sign", title: "Sign", icon: "hand-back-right" },
        { name: "settings", title: "Settings", icon: "cog" },
      ];

  return (
    <View style={{ flex: 1 }}>
      <AppHeader onMenuPress={open} />

      <AppDrawer
        visible={isOpen}
        onClose={close}
        profile={profile}
        menuItems={menuItems}
      />

      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        {menuItems.map((item) => (
          <Tabs.Screen
            key={item.name}
            name={item.name}
            options={{ title: item.title }}
          />
        ))}
      </Tabs>
    </View>
  );
}
