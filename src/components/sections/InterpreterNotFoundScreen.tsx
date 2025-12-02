import { useAppTheme } from "@/hooks/useAppTheme";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function InterpreterNotFoundScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        padding: 24,
      }}
    >
      <MaterialCommunityIcons
        name="account-question"
        size={72}
        color={theme.colors.error}
        style={{ marginBottom: 20 }}
      />
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: theme.colors.onBackground,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Interpreter Not Found
      </Text>
      <Text style={{ fontSize: 16, color: theme.colors.onSurfaceVariant, marginBottom: 24, textAlign: "center" }}>
        The interpreter you&apos;re looking for may have been removed or doesn&apos;t exist.
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => router.replace("/search")}
      >
        <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.onPrimary} style={{ marginRight: 8 }} />
        <Text style={{ color: theme.colors.onPrimary, fontWeight: "600", fontSize: 16 }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
