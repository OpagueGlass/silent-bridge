/**
 * @file AppointmentCard.tsx
 * A reusable component to display details of a single appointment.
 * It adapts its actions and displayed info based on the user type.
 */
"use client";

import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Card, Button, Chip, Menu, Text, Avatar, useTheme, MD3Theme } from "react-native-paper";
import * as Calendar from "expo-calendar";
import * as Linking from "expo-linking";
import { Appointment } from "../utils/query";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AppointmentCardProps {
  appointment: Appointment;
  userType: "deaf" | "interpreter";
  onStatusChange?: (appointmentId: number, newStatus: string) => void;
}

export default function AppointmentCard({ appointment, userType, onStatusChange }: AppointmentCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  const otherUser = appointment.otherUserProfile;
  
  // Format date and time for display
  const startDate = new Date(appointment.startTime);
  const displayDate = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const displayTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved": return { backgroundColor: theme.colors.primaryContainer, color: theme.colors.primary };
      case "Pending": return { backgroundColor: '#FFDDC1', color: '#F26D00' }; // Custom orange
      case "Completed": return { backgroundColor: theme.colors.secondaryContainer, color: theme.colors.onSecondaryContainer };
      default: return { backgroundColor: theme.colors.surfaceDisabled, color: theme.colors.onSurfaceDisabled };
    }
  };
  const statusStyle = getStatusStyle(appointment.status);
  
  const addToCalendar = async () => { /* ... (implementation unchanged) ... */ };
  
  const joinMeeting = () => {
    if (appointment.meetingUrl) {
      Linking.openURL(appointment.meetingUrl);
    } else {
      Alert.alert("No Meeting Link", "The meeting link for this appointment has not been set yet.");
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
                {appointment.hospitalName || "Online Interpretation"}
            </Text>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusStyle.backgroundColor }]} 
              textStyle={[styles.statusText, { color: statusStyle.color }]}>
                {appointment.status}
            </Chip>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name="calendar-clock" size={18} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.rowText}>{displayDate} at {displayTime}</Text>
        </View>
        
        {otherUser && (
            <View style={styles.participantInfo}>
                <Avatar.Image size={40} source={{ uri: otherUser.photo || 'https://www.gravatar.com/avatar/?d=mp' }} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.participantRole}>{userType === 'deaf' ? 'Interpreter' : 'Client'}</Text>
                    <Text style={styles.participantName}>{otherUser.name}</Text>
                </View>
            </View>
        )}
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button icon="calendar-plus" onPress={addToCalendar} compact>Add to Calendar</Button>
        {appointment.status === "Approved" && (
          <Button mode="contained" icon="video" onPress={joinMeeting}>Join Call</Button>
        )}
      </Card.Actions>
    </Card>
  );
}

const createStyles = (theme: MD3Theme) => StyleSheet.create({
    card: { 
        marginBottom: 16, 
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        elevation: 2,
    },
    header: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 12 
    },
    title: { 
        fontWeight: "bold", 
        color: theme.colors.onSurface,
        flex: 1,
    },
    statusChip: { 
        height: 28, 
        alignItems: 'center',
        borderRadius: 8,
        marginLeft: 8,
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 8 
    },
    rowText: { 
        fontSize: 14, 
        marginLeft: 10, 
        color: theme.colors.onSurfaceVariant 
    },
    participantInfo: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 12, 
        paddingTop: 12, 
        borderTopWidth: 1, 
        borderTopColor: theme.colors.surfaceVariant
    },
    participantRole: { 
        fontSize: 12, 
        color: theme.colors.onSurfaceVariant 
    },
    participantName: { 
        fontSize: 16, 
        fontWeight: '500', 
        color: theme.colors.onSurface 
    },
    actions: { 
        justifyContent: 'flex-end', 
        paddingHorizontal: 8,
        paddingBottom: 8
    },
});
