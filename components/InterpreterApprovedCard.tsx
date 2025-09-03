// components/InterpreterApprovedCard.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, MD3Theme, Text } from "react-native-paper";
// import { PopulatedRequest } from "../app/data/mockBookingsDeaf";
import { Appointment } from "../utils/query";
import { useAppTheme } from "../hooks/useAppTheme";

const calculateDuration = (startTime: string, endTime: string): string => {
  const diffInMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  const totalMinutes = Math.round(diffInMs / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
};

interface InterpreterApprovedCardProps {
  appointment: Appointment;
}

export default function InterpreterApprovedCard({
  appointment,
}: InterpreterApprovedCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const appointmentDate = new Date(appointment.startTime);
  const duration = calculateDuration(appointment.startTime, appointment.endTime);

  return (
    <Card style={styles.appointmentCard}>
      <Card.Content>
        <View style={styles.appointmentHeader}>
          <Text variant="titleMedium" style={styles.appointmentDate}>
            {appointmentDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at{" "}
            {appointmentDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </Text>
          <Chip
            style={{ backgroundColor: "limegreen" }}
            textStyle={styles.statusText}
          >
            Approved
          </Chip>
        </View>
        <View style={styles.detailRow}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Client: {appointment.profile?.name}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="email-outline" size={18} color="#666" />
          <Text style={styles.detailText} selectable>
            {appointment.profile?.email}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={18}
            color="#666"
          />
          <Text style={styles.detailText}>
            Duration: {duration}
          </Text>
        </View>
        {appointment.hospitalName && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={18}
              color="#666"
            />
            <Text style={styles.detailText}>
              Hospital: {appointment.hospitalName}
            </Text>
          </View>
        )}
        <View style={[styles.appointmentActions, { marginTop: 16 }]}>
          <Button mode="contained" style={{ flex: 1 }}>
            Join Appointment
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    appointmentCard: {
      marginBottom: 16,
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
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    detailText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginLeft: 8,
      flexShrink: 1,
    },
  });