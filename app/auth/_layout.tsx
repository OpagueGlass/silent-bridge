import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="deaf-user-form" />
      <Stack.Screen name="interpreter-form" />
    </Stack>
  );
}
