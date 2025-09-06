import { useAppTheme } from "@/hooks/useAppTheme";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { Stack } from "expo-router";


export default function LoadingScreen() {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text
        style={{
          marginTop: 16,
          color: theme.colors.onBackground,
        }}
      >
        Loading...
      </Text>
    </View>
  );
}
