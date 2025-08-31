// components/InterpreterApprovedCard.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, MD3Theme, Text } from "react-native-paper";
import { InterpreterRequest } from "../app/data/mockBookingsDeaf";
import { useAppTheme } from "../hooks/useAppTheme";

interface InterpreterApprovedCardProps {
  appointment: InterpreterRequest;
}

export default function InterpreterApprovedCard({
  appointment,
}: InterpreterApprovedCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Card style={styles.appointmentCard}>
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
              Client: {appointment.clientName}
            </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="email-outline" size={18} color="#666" />
          <Text style={styles.detailText} selectable>
            {appointment.clientEmail}
          </Text>
        </View>
        {appointment.duration && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color="#666"
            />
            <Text style={styles.detailText}>
              Duration: {appointment.duration}
            </Text>
          </View>
        )}
        {appointment.doctorLanguage && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="translate" size={18} color="#666" />
            <Text style={styles.detailText}>
              Doctor's Language: {appointment.doctorLanguage}
            </Text>
          </View>
        )}
        {appointment.location && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={18}
              color="#666"
            />
            <Text style={styles.detailText}>
              Hospital: {appointment.location}
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