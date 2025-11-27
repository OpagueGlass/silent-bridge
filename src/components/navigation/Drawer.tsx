import { useAppTheme } from "@/hooks/useAppTheme";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Avatar, Drawer, Text } from "react-native-paper";
import Gradient from "../ui/Gradient";

interface Profile {
  photo?: string;
  name?: string;
}

interface MenuItem {
  name: string;
  title: string;
  icon: string;
}

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  profile: Profile | null;
  menuItems: MenuItem[];
}

export default function AppDrawer({ visible, onClose, profile, menuItems }: AppDrawerProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -280,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (name: string) => {
    onClose();
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
  };

  return (
    <>
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <Gradient style={styles.drawerHeader}>
          <View style={styles.drawerHeaderContent}>
            {profile?.photo ? (
              <Avatar.Image source={{ uri: profile.photo }} size={48} />
            ) : (
              <Avatar.Icon icon="account" size={48} style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
            )}
            <View style={styles.drawerHeaderText}>
              <Text variant="titleMedium" style={styles.drawerTitle}>
                Silent Bridge
              </Text>
              <Text variant="bodySmall" style={styles.drawerSubtitle}>
                {profile?.name}
              </Text>
            </View>
          </View>
        </Gradient>

        <Drawer.Section style={styles.drawerContent} showDivider={false}>
          {menuItems.map(({ name, title, icon }) => (
            <Drawer.Item
              key={name}
              label={title}
              icon={icon}
              onPress={() => handleNavigate(name)}
              style={styles.drawerItem}
            />
          ))}
        </Drawer.Section>
      </Animated.View>

      {visible && (
        <Animated.View
          style={[styles.overlay, { opacity: fadeAnim }]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={onClose}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    zIndex: 1000,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawerHeader: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  drawerHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  drawerHeaderText: {
    flex: 1,
  },
  drawerTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  drawerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  drawerContent: {
    paddingTop: 8,
  },
  drawerItem: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
});
