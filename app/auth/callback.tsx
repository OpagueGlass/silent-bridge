import { useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { View, Text } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ActivityIndicator } from "react-native-paper";

export default function AuthCallback() {
  const theme = useAppTheme();
  const router = useRouter();
  const { loadProfile } = useAuth();
  
  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const profile = await loadProfile(user);
      if (profile) {
        router.push("/");
      } else {
        router.push("/auth/account-type");
      }
    };
    handleCallback();
  }, []);

  return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
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