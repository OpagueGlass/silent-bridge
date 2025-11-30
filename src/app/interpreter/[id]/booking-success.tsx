import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, MD3Theme, Text } from "react-native-paper";
import AppointmentDetailsSection from "../../../components/sections/AppointmentDetailsSection";
import InterpreterNotFoundScreen from "../../../components/sections/InterpreterNotFoundScreen";
import LoadingScreen from "../../../components/sections/LoadingScreen";
import Gradient from "../../../components/ui/Gradient";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { useInterpreter } from "./_layout";

export default function BookingSuccessScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { interpreter, isLoading } = useInterpreter();
  const [appointmentDetails, setAppointmentDetails] = useState<{
    startTime: string;
    endTime: string;
    id: number | null;
    deaf_user_id: string;
    hospital_name: string | null;
  } | null>(null);

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
      <Stack.Screen options={{ title: "Booking Confirmed" }} />
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
          {/* Success Message */}
          <View style={styles.successCard}>
            <View style={styles.checkmarkContainer}>
              <MaterialCommunityIcons name="check" size={48} color={theme.colors.primary} />
            </View>
            <Text variant="headlineSmall" style={{ fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>
              Booking Request Sent!
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
              Your request has been successfully sent to the interpreter.
            </Text>
          </View>

          {/* Appointment Details */}
          <AppointmentDetailsSection appointmentDetails={appointmentDetails!} />

          {/* What Happens Next */}
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              What Happens Next?
            </Text>
            <View style={styles.infoCard}>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <MaterialCommunityIcons
                  name="numeric-1-circle"
                  size={24}
                  color={theme.colors.onTertiaryContainer}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: "500", marginBottom: 4 }}>
                    Request Review
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Your interpreter will either accept or decline your booking request shortly.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <MaterialCommunityIcons
                  name="numeric-2-circle"
                  size={24}
                  color={theme.colors.onTertiaryContainer}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: "500", marginBottom: 4 }}>
                    Confirmation
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    You'll receive a notification once the interpreter confirms your booking.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row" }}>
                <MaterialCommunityIcons
                  name="numeric-3-circle"
                  size={24}
                  color={theme.colors.onTertiaryContainer}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: "500", marginBottom: 4 }}>
                    Appointment Day
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    You'll connect with your interpreter once the appointment starts.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Button
              mode="contained"
              icon="home"
              onPress={() => router.push("/")}
              contentStyle={{ paddingVertical: 8 }}
            >
              Go to Home
            </Button>
            <Button
              mode="outlined"
              icon="account-search"
              onPress={() => {
                router.back();
                router.back();
              }}
              contentStyle={{ paddingVertical: 8 }}
            >
              Find Other Interpreters
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      paddingTop: 24,
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
    successCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      alignItems: "center",
    },
    checkmarkContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      marginBottom: 12,
      color: theme.colors.onSurface,
    },
    infoCard: {
      backgroundColor: theme.colors.tertiaryContainer,
      borderRadius: 12,
      padding: 16
    },
    footer: {
      paddingTop: 8,
      paddingBottom: 16,
      gap: 12,
    },
  });
