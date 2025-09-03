"use client";

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  Menu,
  Portal,
  Text,
  TextInput
} from "react-native-paper";
import ClientAppointmentsCard from "../../components/ClientAppointmentsCard";
import ClientReviewCard from "../../components/ClientReviewCard";
import InterpreterApprovedCard from "../../components/InterpreterApprovedCard";
import InterpreterReviewCard from "../../components/InterpreterReviewCard";
import ReviewModal from "../../components/ReviewModal";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  Appointment,
  appointments as userAppointments,
} from "../data/mockBookings";
import {
  PopulatedRequest,
  requests as interpreterRequests,
} from "../data/mockBookingsDeaf";

export default function HomeScreen() {
  { /* --- INTERPRETER & CLIENT --- */ }
  const { profile, isInterpreter } = useAuth();
  const theme = useAppTheme();
  const router = useRouter();
  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "Approved":
        return "limegreen";
      case "Pending":
        return theme.colors.tertiary;
      case "Rejected":
        return theme.colors.error;
      case "Completed":
        return theme.colors.secondary;
      case "Cancelled":
        return theme.colors.onSurfaceDisabled;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  { /* --- CLIENT --- */ }
  const [appointments, setAppointments] = useState(userAppointments);

  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const handleOpenReviewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReviewModalVisible(true);
  };
  const handleCloseReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedAppointment(null);
  };
  const handleSubmitReview = (rating: number, comment: string) => {
    if (selectedAppointment) {
      console.log(
        `Submitting review for appointment ID: ${selectedAppointment.id}`
      );
      console.log(`Rating: ${rating}`);
      console.log(`Comment: "${comment}"`);
    }
    handleCloseReviewModal();
    ("Thank you for your review!");
  };

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("Approved");
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const [isCancelDialogVisible, setCancelDialogVisible] = useState(false);

  const { completedAppointments, upcomingAppointments } = useMemo(() => {
    const completed = appointments
      .filter((a) => a.status === "Completed")
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = appointments
      .filter((a) => a.status !== "Completed")
      .filter((a) => new Date(a.startTime) >= today)
      .filter((a) => {
        const statusMatch = statusFilter === "All" || a.status === statusFilter;
        const formattedQuery = searchQuery.trim().toLowerCase();
        if (formattedQuery === "") {
          return statusMatch;
        }

        const displayDate = new Date(a.startTime)
          .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .toLowerCase();
        const interpreterName = a.profile.name.toLowerCase();
        const queryMatch =
          displayDate.includes(formattedQuery) ||
          interpreterName.includes(formattedQuery);

        return statusMatch && queryMatch;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return { completedAppointments: completed, upcomingAppointments: upcoming };
  }, [appointments, searchQuery, statusFilter]);

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogVisible(true);
  };
  const performCancel = () => {
    if (!selectedAppointment) return;
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === selectedAppointment.id
          ? { ...app, status: "Cancelled" }
          : app
      )
    );
    setCancelDialogVisible(false);
    setSelectedAppointment(null);
  };
  const hideCancelDialog = () => {
    setCancelDialogVisible(false);
    setSelectedAppointment(null);
  };

  const renderUserAppointmentActions = (
    status: Appointment["status"],
    appointment: Appointment
  ) => {
    switch (status) {
      case "Approved":
        return (
          <>
            <Button mode="contained" style={{ flex: 1 }}>
              Join Appointment
            </Button>
          </>
        );
      case "Pending":
        return (
          <>
            <Button
              mode="contained"
              disabled
              style={styles.actionButtonPrimary}
            >
              Awaiting Approval
            </Button>
            <Button
              mode="outlined"
              style={[styles.actionButtonSecondary, styles.cancelButton]}
              labelStyle={styles.cancelButtonLabel}
              onPress={() => handleCancelAppointment(appointment)}
            >
              Cancel
            </Button>
          </>
        );
      case "Rejected":
      case "Cancelled":
        return null;
      default:
        return null;
    }
  };

  { /* --- INTERPRETER --- */ }
  const [requests, setRequests] = useState<PopulatedRequest[]>(interpreterRequests);

  const [isClientReviewVisible, setClientReviewVisible] = useState(false);
  const [requestToReview, setRequestToReview] = useState<PopulatedRequest | null>(null);
  const handleOpenClientReview = (request: PopulatedRequest) => {
    setRequestToReview(request);
    setClientReviewVisible(true);
  };
  const handleCloseClientReview = () => {
    setClientReviewVisible(false);
    setRequestToReview(null);
  };
  const handleSubmitClientReview = (rating: number, comment: string) => {
    if (requestToReview) {
      console.log(
        `Interpreter reviewing client: ${requestToReview.appointment.clientProfile.name}`
      );
      console.log(`Rating: ${rating}, Comment: "${comment}"`);
    }
    handleCloseClientReview();
  };

  const [interpreterSearchQuery, setInterpreterSearchQuery] = useState(""); 

  const { interpreterCompleted, interpreterApproved } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // filter for completed sessions
    const completed = requests
      .filter((r) => r.appointment.status === "Completed")
      .sort(
        (a, b) =>
          new Date(b.appointment.startTime).getTime() -
          new Date(a.appointment.startTime).getTime()
      );

    // filter for upcoming, approved sessions
    const approved = requests
      .filter((r) => r.appointment.status === "Approved")
      .filter((r) => new Date(r.appointment.startTime) >= today)
      .filter((r) => {
        const formattedQuery = interpreterSearchQuery.trim().toLowerCase();
        if (formattedQuery === "") return true;

        const displayDate = new Date(r.appointment.startTime)
          .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .toLowerCase();
        const clientName = r.appointment.clientProfile.name.toLowerCase();

        return (
          displayDate.includes(formattedQuery) || clientName.includes(formattedQuery)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.appointment.startTime).getTime() -
          new Date(b.appointment.startTime).getTime()
      );

    return { interpreterCompleted: completed, interpreterApproved: approved };
  }, [requests, interpreterSearchQuery]);

  { /* --- INTERPRETER UI --- */ }
  if (isInterpreter) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* --- HEADER --- */}
        <View
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <Text variant="headlineMedium" style={styles.greeting}>
            Welcome back, {profile?.name || "Interpreter"}!
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Manage your scheduled appointments
          </Text>
        </View>

        {/* --- REVIEW COMPLETED SESSION --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Review Completed Sessions
            </Text>
            <Button mode="text" compact>
              View All
            </Button>
          </View>
          {interpreterCompleted.map((request) => (
            <InterpreterReviewCard
              key={request.requestId}
              request={request}
              onReview={handleOpenClientReview}
            />
          ))}
        </View>

        {/* --- APPROVED APPOINTMENTS --- */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Approved Appointments
          </Text>

          {/* --- SEARCH INPUT --- */}
          <View style={styles.filterContainer}>
            <TextInput
              mode="outlined"
              placeholder="Search by date or client..."
              value={interpreterSearchQuery}
              onChangeText={setInterpreterSearchQuery}
              style={styles.searchInput}
              left={<TextInput.Icon icon="magnify" />}
            />
          </View>

          {/* --- RESULTS --- */}
          {interpreterApproved.map((request) => (
            <InterpreterApprovedCard
              key={request.requestId}
              request={request}
            />
          ))}
        </View>

        {/* --- REVIEW POP UP --- */}
        {requestToReview && (
          <ReviewModal
            visible={isClientReviewVisible}
            onDismiss={handleCloseClientReview}
            onSubmit={handleSubmitClientReview}
            targetName={requestToReview.appointment.clientProfile.name}
            sessionDate={requestToReview.appointment.startTime}
            placeholderText="Share your experience with this client..."
          />
        )}

      </ScrollView>
    );
  }

  { /* --- CLIENT UI --- */ }
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* --- HEADER --- */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back, {profile?.name || "User"}!
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Find the right interpreter for your needs
        </Text>
      </View>

      {/* --- REVIEW COMPLETED SESSION --- */}  
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Review Completed Sessions
          </Text>
          <Button mode="text" compact>
            View All
          </Button>
        </View>
        {completedAppointments.map((appointment) => (
          <ClientReviewCard
            key={appointment.id}
            appointment={appointment}
            onReview={handleOpenReviewModal}
          />
        ))}
      </View>

      {/* --- APPOINTMENTS --- */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Appointments
        </Text>

        {/* --- SEARCH INPUT --- */}
        <View style={styles.filterContainer}>
          <TextInput
            mode="outlined"
            placeholder="Search by date or interpreter..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
          />

          {/* --- RESULTS --- */}
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setStatusMenuVisible(true)}
                style={styles.filterButton}
                icon="chevron-down"
                contentStyle={{ flexDirection: "row-reverse" }}
              >
                {statusFilter}
              </Button>
            }
          >
            {["All", "Approved", "Pending", "Rejected", "Cancelled"].map(
              (status) => (
                <Menu.Item
                  key={status}
                  onPress={() => {
                    setStatusFilter(status);
                    setStatusMenuVisible(false);
                  }}
                  title={status}
                />
              )
            )}
          </Menu>
        </View>

        {upcomingAppointments.map((appointment) => (
          <ClientAppointmentsCard
            key={appointment.id}
            appointment={appointment}
            getStatusColor={getStatusColor}
            actions={renderUserAppointmentActions(
              appointment.status,
              appointment
            )}
          />
        ))}
      </View>

      {/* --- REVIEW POP UP --- */}
      <ReviewModal
        visible={isReviewModalVisible}
        onDismiss={handleCloseReviewModal}
        onSubmit={handleSubmitReview}
        targetName={selectedAppointment?.profile.name || ''}
        sessionDate={selectedAppointment?.startTime || ''}
        placeholderText="Share your experience with this interpreter..."
      />

      {/* --- CANCEL POP UP --- */}
      <Portal>
        <Dialog visible={isCancelDialogVisible} onDismiss={hideCancelDialog}>
          <Dialog.Title>Cancel Request</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to cancel this appointment request?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideCancelDialog}>No</Button>
            <Button onPress={performCancel} textColor={theme.colors.error}>
              Yes, Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    color: "#ffffff",
    opacity: 0.9,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
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
  filterContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    justifyContent: "center",
  },
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
  appointmentType: {
    marginBottom: 8,
    fontWeight: "500",
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
  actionButtonPrimary: {
    flexShrink: 1,
  },
  actionButtonSecondary: {
    flexShrink: 1,
  },
  cancelButton: {
    borderColor: "red",
  },
  cancelButtonLabel: {
    color: "red",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
    color: "#6B7280",
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flexShrink: 1,
  },
});
