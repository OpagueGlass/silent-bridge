"use client";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getDuration, getMeetLink, getStartTime } from "@/utils/helper";
import {
  addAppointmentMeetingURL,
  getRequests,
  initiateChat,
  InterpreterProfile,
  Profile,
  Request,
  searchInterpreters,
  updateRequest,
} from "@/utils/query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Card, MD3Theme, Menu, Text } from "react-native-paper";
import { showConfirmAlert, showValidationError } from "../../utils/alert";
import RequestCard, { handleRequest } from "@/components/cards/RequestCard";

import { theme } from "@/theme/theme";


export default function RequestScreen({
  profile,
  getToken,
}: {
  profile: Profile | null;
  getToken: () => Promise<string | null>;
}) {
  const router = useRouter();
  const theme = useAppTheme();

  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (profile) {
        try {
          const id = profile.id;
          const requests = await getRequests(id);
          setRequests(requests);
        } catch (error) {
          console.error("Error fetching requests:", error);
        }
      }
    };

    fetchRequests();
  }, [profile]);

  const { acceptRequest, rejectRequest } = handleRequest(profile, getToken, setLoading, setRequests);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.elevation.level1 }}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <Text variant="titleLarge" style={styles.title}>
            Requests
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              acceptRequest={acceptRequest}
              rejectRequest={rejectRequest}
            />
          ))
        ) : (
          <Text style={{ textAlign: "center", color: theme.colors.onSurface, marginTop: 40 }}>
            No pending requests at this time
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: theme.colors.onPrimary,
    fontWeight: "bold",
    marginLeft: 42,
  },
  content: {
    padding: 16,
    gap: 12,
  },
});
