import { InterpreterProfile, createAppointment, createRequest } from "@/utils/query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, MD3Theme, Text, TextInput } from "react-native-paper";
import WarningDialog from "../../../components/modals/WarningDialog";
import AppointmentDetailsSection from "../../../components/sections/AppointmentDetailsSection";
import InterpreterNotFoundScreen from "../../../components/sections/InterpreterNotFoundScreen";
import LoadingScreen from "../../../components/sections/LoadingScreen";
import Gradient from "../../../components/ui/Gradient";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { useDisclosure } from "../../../hooks/useDisclosure";
import { BackButton, useInterpreter } from "./_layout";

async function confirmBooking(
  appointmentDetails: {
    startTime: string;
    endTime: string;
    id: number | null;
    deaf_user_id: string;
    hospital_name: string | null;
  },
  profile: InterpreterProfile | null,
  notes: string,
  setError: Dispatch<SetStateAction<{ title: string; message: string } | null>>,
  onCreate: () => void
) {
  try {
    if (appointmentDetails) {
      const { startTime, endTime, id: appointment_id, deaf_user_id, hospital_name } = appointmentDetails;
      if (appointment_id) {
        await createRequest(appointment_id, profile!.id, notes);
        onCreate();
      } else {
        const appointment_id = await createAppointment(
          deaf_user_id,
          new Date(startTime),
          new Date(endTime),
          hospital_name
        );
        if (appointment_id >= 0) {
          AsyncStorage.setItem(
            "appointmentDetails",
            JSON.stringify({
              ...appointmentDetails,
              id: appointment_id,
            })
          );
        }
        await createRequest(appointment_id, profile!.id, notes);
        onCreate();
      }
    }
  } catch (error) {
    setError({ title: "Booking Error", message: `Error during booking: ${error}` });
  }
}

export default function BookingScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { isOpen, open, close } = useDisclosure(false);
  const [notes, setNotes] = useState("");
  const { interpreter, isLoading } = useInterpreter();
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<{
    startTime: string;
    endTime: string;
    id: number | null;
    deaf_user_id: string;
    hospital_name: string | null;
  } | null>(null);

  const handleBooking = () => {
    open();
  };

  const onCreate = () => {
    close();
    router.push(`/interpreter/${interpreter?.id}/booking-success`);
  };

  useEffect(() => {
    const fetchInterpreterProfile = async () => {
        const storedDetails = await AsyncStorage.getItem("appointmentDetails").then((data) =>
          data ? JSON.parse(data) : null
        );
        setAppointmentDetails(storedDetails);
    };
    fetchInterpreterProfile();
  }, []);

  if (isLoading || !appointmentDetails) {
    return <LoadingScreen />;
  } else if (!interpreter) {
    return <InterpreterNotFoundScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.elevation.level1 }}>
      <BackButton />
      <ScrollView>
        <Gradient style={styles.header}>
          <View style={styles.headerContent}>
            <Avatar.Image size={80} source={{ uri: interpreter.photo }} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text variant="headlineSmall" style={{ color: theme.colors.surface, fontWeight: "bold" }}>
                {interpreter.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.surface }}>
                  {interpreter.avgRating ? `⭐ ${interpreter.avgRating.toFixed(1)}` : "No ratings yet"}
                </Text>
              </View>
            </View>
          </View>
        </Gradient>

        <View style={styles.content}>
          <AppointmentDetailsSection appointmentDetails={appointmentDetails!} />
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Additional Notes (Optional)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Leave a note for the interpreter..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
              outlineStyle={{ borderRadius: 12 }}
            />
          </View>
          <View style={styles.footer}>
            <Button mode="contained" icon="check-circle" onPress={handleBooking} contentStyle={{ paddingVertical: 8 }}>
              Confirm Booking
            </Button>
          </View>
        </View>
      </ScrollView>

      <WarningDialog
        visible={isOpen}
        title="Confirm Booking"
        message={`Are you sure you want to book an appointment with ${interpreter.name}?`}
        onDismiss={close}
        onConfirm={() => confirmBooking(appointmentDetails!, interpreter, notes, setError, onCreate)}
      />

      <WarningDialog
        visible={error !== null}
        title={error?.title || "Error"}
        message={error?.message || "An unexpected error occurred."}
        onDismiss={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      paddingBottom: 12,
      paddingHorizontal: 16,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      marginBottom: 12,
      color: theme.colors.onSurface,
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    notesInput: {
      backgroundColor: theme.colors.surface,
    },
    footer: {
      paddingTop: 8,
      paddingBottom: 16,
    },
  });
