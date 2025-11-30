import LoadingScreen from "@/components/sections/LoadingScreen";
import Gradient from "@/components/ui/Gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { InterpreterProfile, Rating, getAvailabilities, getInterpreterProfile, getRatings } from "@/utils/query";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";

interface InterpreterContextType {
  interpreter: InterpreterProfile | null;
  availability: { day_id: number; start_time: string; end_time: string }[];
  ratings: Rating[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const InterpreterContext = createContext<InterpreterContextType | undefined>(undefined);

export function useInterpreter() {
  const context = useContext(InterpreterContext);
  if (!context) {
    throw new Error("useInterpreter must be used within InterpreterLayout");
  }
  return context;
}

export function BackButton() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <Gradient style={styles.backButtonContainer}>
      <IconButton
        icon="arrow-left"
        iconColor={theme.colors.onPrimary}
        size={24}
        onPress={() => router.back()}
      />
    </Gradient>
  );
}

export default function InterpreterLayout() {
  const { authState, profile } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [interpreter, setInterpreter] = useState<InterpreterProfile | null>(null);
  const [availability, setAvailability] = useState<{ day_id: number; start_time: string; end_time: string }[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterpreterData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [profileData, availabilityData, ratingsData] = await Promise.all([
        getInterpreterProfile(id),
        getAvailabilities(id),
        getRatings(id),
      ]);

      setInterpreter(profileData);
      setAvailability(availabilityData);
      setRatings(ratingsData);
    } catch (error) {
      console.error("Failed to fetch interpreter data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInterpreterData();
  }, [fetchInterpreterData]);

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to auth if no profile exists
  if (!profile) {
    return <Redirect href="/auth" />;
  }

  const contextValue = {
    interpreter,
    availability,
    ratings,
    isLoading,
    refreshData: fetchInterpreterData,
  };

  return (
    <InterpreterContext.Provider value={contextValue}>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="index" options={{ title: "Interpreter Profile" }} />
        <Stack.Screen name="book" options={{ title: "Book Appointment" }} />
        <Stack.Screen name="booking-success" options={{ title: "Booking Confirmed" }} />
      </Stack>
    </InterpreterContext.Provider>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    paddingLeft: 4,
    paddingTop: 4,
    backgroundColor: "transparent",
  },
});
