"use client";
import RequestCard, { handleRequest } from "@/components/cards/RequestCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getRequests, Request } from "@/utils/query";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import { Redirect } from "expo-router";

import { useDisclosure } from "@/hooks/useDisclosure";
import { theme } from "@/theme/theme";
import { useAuth } from "@/contexts/AuthContext";
import WarningDialog from "@/components/modals/WarningDialog";

function getOverlappingDetails(request: Request) {
  let confirmMessage = `Are you sure you want to accept this request?`;

  if (request.hasOverlap && request.overlappingAppointments && request.overlappingAppointments.length > 0) {
    const overlapDetails = request.overlappingAppointments
      .map((overlap) => {
        const startTime = new Date(overlap.startTime).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
        const endTime = new Date(overlap.endTime).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `\n• ${overlap.userName} (${startTime} - ${endTime})`;
      })
      .join("");

    confirmMessage = `Are you sure you want to accept this request?\n\nThis will automatically reject ${request.overlappingAppointments.length} overlapping request(s):${overlapDetails}`;
  }
  return confirmMessage;
}

export default function RequestScreen() {
  const theme = useAppTheme();
  const { profile, isInterpreter, getValidProviderToken: getToken, signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const { isOpen: acceptDialog, open: openAcceptDialog, close: closeAcceptDialog } = useDisclosure();
  const { isOpen: rejectDialog, open: openRejectDialog, close: closeRejectDialog } = useDisclosure();
  const { isOpen: errorDialog, open: openErrorDialog, close: closeErrorDialog } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const openAccept = (request: Request) => {
    setSelectedRequest(request);
    openAcceptDialog();
  };

  const openReject = (request: Request) => {
    setSelectedRequest(request);
    openRejectDialog();
  };

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

  const fetchRequests = useCallback(async () => {
    if (profile) {
      try {
        const id = profile.id;
        const requests = await getRequests(id);
        setRequests(requests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    }
  }, [profile]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const { acceptRequest, rejectRequest } = handleRequest(profile, getToken, setLoading, setRequests, openErrorDialog);

  if (!isInterpreter) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.elevation.level1 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRequests} />}
    >
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Requests
        </Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              acceptRequest={() => openAccept(request)}
              rejectRequest={() => openReject(request)}
            />
          ))
        ) : (
          <Surface style={styles.emptyState}>
            <Text style={{ textAlign: "center", color: theme.colors.onSurface }}>No pending requests at this time</Text>
          </Surface>
        )}
      </View>
      <WarningDialog
        visible={acceptDialog}
        title="Accept Request"
        message={
          selectedRequest ? getOverlappingDetails(selectedRequest) : "Are you sure you want to accept this request?"
        }
        onConfirm={() => acceptRequest(selectedRequest!)}
        onDismiss={closeAcceptDialog}
      />
      <WarningDialog
        visible={rejectDialog}
        title="Reject Request"
        message="Are you sure you want to reject this request?"
        onConfirm={() => rejectRequest(selectedRequest!)}
        onDismiss={closeRejectDialog}
      />
      <WarningDialog
        visible={errorDialog}
        title="Error Accepting Request"
        message="Please sign in again and grant access to Google Calendar to accept this request."
        onConfirm={() => {
          signIn()
          closeErrorDialog();
        }}
        onDismiss={closeErrorDialog}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: theme.colors.onBackground,
  },
  content: {
    paddingHorizontal: 16,
  },
  emptyState: {
    height: 144,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
