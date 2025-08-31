// components/ClientAppointmentsCard.tsx

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

export default function ClientAppointmentsCard({
  appointment,
  actions,
  getStatusColor,
}: ClientAppointmentsCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

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
            {new Date(appointment.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at {appointment.time}
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
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Interpreter: {appointment.interpreter.name}
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginBottom: 16,
          }}
        >
          {appointment.interpreter.email}
        </Text>
        {appointment.status === "Rejected" ? (
          <View style={styles.rejectedMessageContainer}>
            <Text style={styles.rejectedMessageText}>
              the interpreter is unable to accept this request
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
      marginBottom: 4,
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
  });