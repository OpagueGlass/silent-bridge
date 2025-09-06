// components/ClientReviewCard.tsx

import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, MD3Theme, Text } from "react-native-paper";
// import { Appointment } from "../app/data/mockBookings";
import { Appointment } from "../utils/query";
import { useAppTheme } from "../hooks/useAppTheme";

interface ClientReviewCardProps {
  appointment: Appointment;
  onReview: (appointment: Appointment) => void;
}

export default function ClientReviewCard({
  appointment,
  onReview,
}: ClientReviewCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

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
          Review
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