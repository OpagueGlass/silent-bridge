"use client";

import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, IconButton, Text, TextInput } from "react-native-paper";
import AppointmentCard from "@/components/AppointmentCard";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";
import { MD3Theme } from "react-native-paper";
import {
  Appointment,
  getReviewUserAppointments,
  getUpcomingUserAppointments,
  getReviewInterpreterAppointments,
  getUpcomingInterpreterAppointments,
} from "../../utils/query";
import ReviewSection from "@/components/ReviewSection";

export default function HomeScreen() {
  const { profile, isInterpreter } = useAuth();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [reviewAppointments, setReviewAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    if (profile?.id) {
      const fetchAppointments = async () => {
        setIsLoading(true);
        try {
          const [reviewData, upcomingData] = isInterpreter
            ? await Promise.all([
                getReviewInterpreterAppointments(profile.id),
                getUpcomingInterpreterAppointments(profile.id),
              ])
            : await Promise.all([getReviewUserAppointments(profile.id), getUpcomingUserAppointments(profile.id)]);
          setReviewAppointments(reviewData);
          setUpcomingAppointments(upcomingData);
        } catch (error) {
          console.error("Failed to fetch appointments:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAppointments();
    } else {
      setIsLoading(false);
    }
  }, [profile?.id, isInterpreter]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* --- HEADER --- */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back, {profile?.name || "User"}!
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Manage your scheduled appointments
        </Text>

        {isInterpreter && (
          <Button
            mode="contained"
            onPress={() => router.push("/interpreter/availability")}
            style={{ marginTop: 20, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            icon="calendar-clock"
          >
            Manage Availability
          </Button>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
      ) : (
        <>
          {/* --- REVIEW COMPLETED SESSION --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Review Completed Sessions
              </Text>
            </View>
            <ReviewSection
              profile={profile}
              reviewAppointments={reviewAppointments}
              isInterpreter={isInterpreter}
              setReviewAppointments={setReviewAppointments}
              router={router}
            />
          </View>

          {/* --- APPROVED APPOINTMENTS --- */}
          <View style={[styles.section]}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Upcoming Appointments
            </Text>

            <View style={styles.filterContainer}>
              <TextInput
                mode="outlined"
                placeholder="Search by date and name"
                value={name}
                onChangeText={setName}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
              />
            </View>

            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isInterpreter={isInterpreter}
                  router={router}
                />
              ))
            ) : (
              <Text>No upcoming appointments found.</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingTop: 80,
      paddingBottom: 20,
    },
    greeting: {
      color: "#ffffff",
      marginBottom: 8,
    },
    subtitle: {
      color: "#ffffff",
      opacity: 0.9,
    },
    section: {
      padding: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 0,
    },
    sectionTitle: {
      fontWeight: "bold",
    },
    reviewCard: {
      marginBottom: 12,
    },
    reviewContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    reviewInfo: {
      flex: 1,
      marginRight: 8,
    },
    filterContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    searchInput: {
      flex: 1,
    },
    filterButton: {
      justifyContent: "center",
    },
    appointmentCard: {
      marginBottom: 16,
    },
    rejectedCard: {
      backgroundColor: "#FFF1F2",
      borderColor: "lightred",
      borderWidth: 1,
    },
    rejectedMessageContainer: {
      marginTop: 8,
      padding: 12,
      backgroundColor: "#FEE2E2",
      borderRadius: 8,
    },
    rejectedMessageText: {
      color: "#991B1B",
      textAlign: "center",
      fontWeight: "500",
    },
    appointmentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    appointmentDate: {
      fontWeight: "bold",
    },
    appointmentType: {
      marginBottom: 8,
      fontWeight: "500",
    },
    statusChip: {},
    statusText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "bold",
    },
    appointmentActions: {
      flexDirection: "row",
      justifyContent: "flex-start",
      gap: 12,
      marginTop: 8,
    },
    actionButtonPrimary: {
      flexShrink: 1,
    },
    actionButtonSecondary: {
      flexShrink: 1,
    },
    cancelButton: {
      borderColor: "red",
    },
    cancelButtonLabel: {
      color: "red",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    detailIcon: {
      marginRight: 8,
      color: "#6B7280",
    },
    detailText: {
      fontSize: 14,
      color: "#333",
      marginLeft: 8,
      flexShrink: 1,
    },
  });
