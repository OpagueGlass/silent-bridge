import LoadingScreen from "@/components/sections/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { initiateChat } from "@/utils/query";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";

export default function InterpreterLayout() {
  const { authState, profile } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleMessagePress = async () => {
    if (!id) return;
    const roomId = await initiateChat(id);
    if (roomId) {
      router.push({ pathname: "/(tabs)/chat/[id]", params: { id: roomId } });
    } else {
      console.error("Could not initiate chat.");
    }
  };

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to auth if no profile exists
  if (!profile) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Interpreter Profile" }} />
      <Stack.Screen name="book" options={{ title: "Book Appointment" }} />
      <Stack.Screen name="booking-success" options={{ title: "Booking Confirmed" }} />
    </Stack>
  );
}