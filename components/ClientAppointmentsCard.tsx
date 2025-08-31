// components/ClientAppointmentsCard.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, MD3Theme, Text } from "react-native-paper";
import { Appointment } from "../app/data/mockBookings";
import { useAppTheme } from "../hooks/useAppTheme";

interface ClientAppointmentsCardProps {
  appointment: Appointment;
  actions: React.ReactNode;
  getStatusColor: (status: Appointment["status"]) => string;
}

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

export default function ClientAppointmentsCard({
  appointment,
  actions,
  getStatusColor,
}: ClientAppointmentsCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const appointmentDate = new Date(appointment.startTime);
  const duration = calculateDuration(appointment.startTime, appointment.endTime);

  return (
    <Card
      style={[
        styles.appointmentCard,
        appointment.status === "Rejected" && styles.rejectedCard,
      ]}
    >
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
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(appointment.status) },
            ]}
            textStyle={styles.statusText}
          >
            {appointment.status}
          </Chip>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-tie" size={18} color="#666" />
          <Text style={styles.detailText}>
            Interpreter: {appointment.profile.name}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="email-outline" size={18} color="#666" />
          <Text style={styles.detailText}>
            {appointment.profile.email}
          </Text>
        </View>


        {appointment.status === "Rejected" ? (
          <View style={styles.rejectedMessageContainer}>
            <Text style={styles.rejectedMessageText}>
              sorry, the interpreter is unable to accept this request currently
            </Text>
          </View>
        ) : (
          <View style={styles.appointmentActions}>{actions}</View>
        )}
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
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
      marginBottom: 12,
    },
    appointmentDate: {
      fontWeight: "bold",
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
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    detailText: {
      marginLeft: 8,
      color: theme.colors.onSurfaceVariant,
    },
  });