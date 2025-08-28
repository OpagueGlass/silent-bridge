/**
 * @file HomeScreen.tsx
 * Renders the main dashboard for both Deaf Users and Interpreters.
 * Displays upcoming appointments fetched using the new, corrected query function.
 */
"use client";

import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";
// Import the new, corrected function
import { Appointment, getUpcomingAppointmentsForUser } from "../../utils/query";
import AppointmentCard from "../../components/AppointmentCard";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { profile, isInterpreter } = useAuth();
  const isFocused = useIsFocused();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFocused && profile) {
      setIsLoading(true);
      // ** MODIFICATION: Calling the new, correct function **
      getUpcomingAppointmentsForUser(profile.id, isInterpreter)
        .then(setAppointments)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isFocused, profile, isInterpreter]);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.greeting}>
          Welcome back, {profile?.name || "User"}!
        </Text>
        <Text style={styles.subtitle}>
          {isInterpreter ? "Manage your interpreter services" : "Find your perfect interpreter"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Upcoming Appointments
        </Text>
        {isLoading ? (
          <ActivityIndicator animating={true} size="large" style={{ marginVertical: 20 }}/>
        ) : appointments.length > 0 ? (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userType={isInterpreter ? "interpreter" : "deaf"}
            />
          ))
        ) : (
          <Card style={styles.emptyStateCard}>
            <Card.Content>
              <Text style={styles.emptyStateText}>You have no upcoming appointments.</Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {isInterpreter && (
        <View style={styles.section}>
          <Card style={styles.availabilityCard}>
            <Card.Title
              title="Set Availability"
              subtitle="Update your schedule to receive requests"
              titleStyle={styles.cardTitle}
            />
            <Card.Actions>
              <Button onPress={() => router.push({ pathname: '/settings/availability' as any })} mode="contained">Set My Schedule</Button>
            </Card.Actions>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 24, paddingTop: 60, paddingBottom: 48, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: theme.colors.onPrimary },
    subtitle: { fontSize: 16, color: theme.colors.onPrimary, opacity: 0.9 },
    section: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: theme.colors.onSurface },
    emptyStateCard: { backgroundColor: theme.colors.surfaceVariant, borderRadius: 12 },
    emptyStateText: { textAlign: 'center', padding: 20, fontSize: 16, color: theme.colors.onSurfaceVariant },
    availabilityCard: { backgroundColor: theme.colors.surface, borderRadius: 12 },
    cardTitle: { fontWeight: 'bold' }
});

