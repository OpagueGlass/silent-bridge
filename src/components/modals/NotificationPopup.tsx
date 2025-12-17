import useNotification from "@/hooks/useNotification";
import { ActiveProfile } from "@/utils/query";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function NotificationPopup({ profile }: { profile: ActiveProfile }) {
  const { notification, setNotification } = useNotification(profile);
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  useEffect(() => {
    if (notification.visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setNotification({ ...notification, visible: false }));
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      slideAnim.setValue(-100);
    }
  }, [notification.visible]);

  return (
    notification.visible && (
      <Animated.View
        style={[
          styles.notificationPopup,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => {
            notification.action();
            setNotification({ ...notification, visible: false });
          }}
          activeOpacity={0.9}
        >
          <Image source={{ uri: notification.photo }} style={styles.notificationIcon} />
          <View style={styles.notificationText}>
            <Text variant="titleSmall" style={{ fontWeight: "600" }}>
              {notification.title ? notification.title : "Notification"}
            </Text>
            <Text variant="bodyMedium" numberOfLines={2}>
              {notification.body}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setNotification({ ...notification, visible: false })}
            style={styles.closeButton}
          >
            <Text style={{ fontSize: 20, color: theme.colors.onSurface }}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    )
  );
}

const styles = StyleSheet.create({
  notificationPopup: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
