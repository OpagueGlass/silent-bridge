import LoadingScreen from "@/components/sections/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Stack } from "expo-router";

export default function InterpreterLayout() {
  const { authState, profile } = useAuth();

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to auth if no profile exists
  if (!profile) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/book" />
      <Stack.Screen name="[id]/booking-success" />
    </Stack>
  );
}