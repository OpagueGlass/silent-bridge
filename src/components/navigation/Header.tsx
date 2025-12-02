import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Appbar, Icon, Text } from "react-native-paper";
import Gradient from "../ui/Gradient";

interface AppHeaderProps {
  onMenuPress: () => void;
}

export default function AppHeader({ onMenuPress }: AppHeaderProps) {
  const router = useRouter();

  return (
    <Gradient style={styles.header}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon="menu" onPress={onMenuPress} color="#fff" />
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={styles.logoContainer}>
          <Icon source={require("@/assets/images/favicon.svg")} size={40} />
          <Text variant="titleLarge" style={styles.appName}>
            Silent Bridge
          </Text>
        </TouchableOpacity>
      </Appbar.Header>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  header: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  appbar: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  appName: {
    color: "#fff",
    fontWeight: "bold",
  },
});
