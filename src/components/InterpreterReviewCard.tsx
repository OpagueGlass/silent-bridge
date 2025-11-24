// components/InterpreterReviewCard.tsx

import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, MD3Theme, Text } from "react-native-paper";
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

interface InterpreterReviewCardProps {
  appointment: Appointment;
  onReview: (appointment: Appointment) => void;
}

export default function InterpreterReviewCard({
  appointment,
  onReview,
}: InterpreterReviewCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const duration = calculateDuration(appointment.startTime, appointment.endTime);

  return (
    <Card style={styles.reviewCard}>
      <Card.Content style={styles.reviewContent}>
        <View style={styles.reviewInfo}>
          <Text variant="titleMedium" style={styles.appointmentDate}>
            {new Date(appointment.startTime).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            Session
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {appointment.profile?.name} 
          </Text>
        </View>
        <Button mode="contained" onPress={() => onReview(appointment)}>
          Review Client
        </Button>
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
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
    appointmentDate: {
      fontWeight: "bold",
    },
  });