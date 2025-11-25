import LoadingScreen from "@/components/sections/LoadingScreen";
import { Redirect, Stack, usePathname } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthLayout() {
  const { authState, session, profile } = useAuth();
  const pathname = usePathname();

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // Only redirect if not logged in and not already on the auth page
  if (!session && pathname !== "/auth") {
    return <Redirect href="/auth" />;
  }

  if (session && profile) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="deaf-user-form" />
      <Stack.Screen name="interpreter-form" />
    </Stack>
  );
}
