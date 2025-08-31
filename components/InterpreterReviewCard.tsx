// components/InterpreterReviewCard.tsx

import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, MD3Theme, Text } from "react-native-paper";
import { InterpreterRequest } from "../app/data/mockBookingsDeaf";
import { useAppTheme } from "../hooks/useAppTheme";

interface InterpreterReviewCardProps {
  session: InterpreterRequest;
  onReview: (session: InterpreterRequest) => void;
}

export default function InterpreterReviewCard({
  session,
  onReview,
}: InterpreterReviewCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Card style={styles.reviewCard}>
      <Card.Content style={styles.reviewContent}>
        <View style={styles.reviewInfo}>
          <Text variant="titleMedium" style={styles.appointmentDate}>
            {new Date(session.date).toLocaleDateString("en-US", {
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
            {session.clientName} • {session.duration}
          </Text>
        </View>
        <Button mode="contained" onPress={() => onReview(session)}>
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