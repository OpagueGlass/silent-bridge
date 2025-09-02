/**
 * @file search.tsx
 * @description Provides the core discovery and interaction features of the app.
 * For Interpreters, it displays a list of real-time, pending appointment requests
 * with full accept/reject functionality.
 */
"use client";

import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import { ActivityIndicator, Button, Card, Avatar, Text, useTheme, MD3Theme } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { getPendingRequests, acceptRequest, PendingRequest } from "../../utils/query";

export default function SearchScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { profile, isInterpreter } = useAuth();
  const isFocused = useIsFocused();

  // State for the Interpreter view
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isAccepting, setIsAccepting] = useState<number | null>(null); // Track which request is being processed

  // Fetch pending requests when the screen is focused for an interpreter
  useEffect(() => {
    if (isInterpreter && isFocused && profile) {
      setIsLoadingRequests(true);
      getPendingRequests(profile.id).then(data => {
        setRequests(data);
        setIsLoadingRequests(false);
      });
    }
  }, [isInterpreter, isFocused, profile]);

  /**
   * Handles the logic when an interpreter clicks the "Accept" button.
   */
  const handleAcceptRequest = async (request: PendingRequest) => {
    if (!profile) return;
    
    setIsAccepting(request.id); // Show loading state on the button
    
    // Call the database function
    const success = await acceptRequest(request.id, request.appointment.id, profile.id);

    if (success) {
      Alert.alert("Request Accepted", "The appointment has been confirmed and the meeting URL has been created.");
      // Refresh the UI by removing the accepted request from the list
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } else {
      Alert.alert("Error", "Failed to accept the request. Please check your connection and try again.");
    }

    setIsAccepting(null); // Reset loading state
  };

  // --- Render the Interpreter's "Appointment Requests" View ---
  if (isInterpreter) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Appointment Requests</Text>
        </View>
        <View style={styles.section}>
          {isLoadingRequests ? (
            <ActivityIndicator animating={true} size="large" />
          ) : requests.length > 0 ? (
            requests.map((request) => {
              const { appointment } = request;
              const client = appointment.clientProfile;
              if (!client) return null; // Safety check for missing client profile
              
              const startTime = new Date(appointment.startTime);
              const displayDate = startTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const displayTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

              return (
                <Card key={request.id} style={styles.requestCard}>
                  <Card.Title
                    title={client.name}
                    subtitle={appointment.hospitalName || "Online Meeting"}
                    left={(props) => <Avatar.Image {...props} source={{ uri: client.photo || 'https://www.gravatar.com/avatar/?d=mp' }} />}
                  />
                  <Card.Content>
                    <Text variant="bodyMedium">{displayDate} at {displayTime}</Text>
                    {request.note && <Text style={styles.noteText}>Note: {request.note}</Text>}
                  </Card.Content>
                  <Card.Actions style={styles.requestActions}>
                    <Button mode="outlined" style={styles.rejectButton} textColor={theme.colors.error} disabled={isAccepting === request.id}>Reject</Button>
                    <Button 
                      mode="contained" 
                      onPress={() => handleAcceptRequest(request)}
                      loading={isAccepting === request.id}
                      disabled={isAccepting === request.id}
                    >
                      Accept
                    </Button>
                  </Card.Actions>
                </Card>
              );
            })
          ) : (
            <Text style={styles.emptyText}>You have no pending requests.</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  // --- Render the Deaf User's "Find an Interpreter" View ---
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find an Interpreter</Text>
      </View>
       <View style={styles.section}>
        <Text>Search functionality for users is under construction.</Text>
       </View>
    </ScrollView>
  );
}

const createStyles = (theme: MD3Theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: theme.colors.primary },
    title: { fontSize: 24, fontWeight: "bold", color: theme.colors.onPrimary },
    section: { padding: 20, gap: 16 },
    requestCard: { backgroundColor: theme.colors.surface, borderRadius: 12 },
    requestActions: { justifyContent: 'flex-end', paddingTop: 8 },
    rejectButton: { borderColor: theme.colors.error, marginRight: 8 },
    noteText: { marginTop: 8, fontStyle: 'italic', color: theme.colors.onSurfaceVariant },
    emptyText: { textAlign: 'center', color: theme.colors.onSurfaceVariant, marginTop: 20, fontSize: 16, padding: 16 }
});
