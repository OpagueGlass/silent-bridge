"use client";

import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Menu, Portal, Text, TextInput } from "react-native-paper";
import ClientAppointmentsCard from "../../components/ClientAppointmentsCard";
import ClientReviewCard from "../../components/ClientReviewCard";
import InterpreterApprovedCard from "../../components/InterpreterApprovedCard";
import InterpreterReviewCard from "../../components/InterpreterReviewCard";
import ReviewModal from "../../components/ReviewModal";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";
import { joinAppointment } from "../../utils/helper";
// import {
//   Appointment,
//   appointments as userAppointments,
// } from "../data/mockBookings";
// import {
//   PopulatedRequest,
//   requests as interpreterRequests,
// } from "../data/mockBookingsDeaf";
import {
  Appointment,
  getReviewUserAppointments,
  getUpcomingUserAppointments,
  getReviewInterpreterAppointments,
  getUpcomingInterpreterAppointments,
  submitRating,
} from "../../utils/query";
import { showAlert } from "@/utils/alert";

export default function HomeScreen() {
  {
    /* --- INTERPRETER & CLIENT --- */
  }
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

  {
    /* --- CLIENT --- */
  }
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInterpreter && profile?.id) {
      const fetchClientData = async () => {
        setIsLoading(true);
        try {
          const [completedData, upcomingData] = await Promise.all([
            getReviewUserAppointments(profile.id),
            getUpcomingUserAppointments(profile.id),
          ]);

          setCompletedAppointments(completedData);
          setUpcomingAppointments(upcomingData);
        } catch (error) {
          console.error("Failed to fetch client data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchClientData();
    } else if (!isInterpreter) {
      setIsLoading(false);
    }
  }, [profile?.id, isInterpreter]);

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
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (selectedAppointment) {
      if (rating < 1 || rating > 5) {
        showAlert("Invalid Rating", "Please provide a rating between 1 and 5 stars.");
        return;
      }
      await submitRating(selectedAppointment.id, profile!.id, selectedAppointment.profile!.id,rating, comment)
      .catch((error) => {
        console.error("Failed to submit review:", error);
        showAlert("Submission Failed", "There was an error submitting your review. Please try again.");
      });
      setCompletedAppointments((prev) =>
        prev.filter((app) => app.id !== selectedAppointment.id)
      );
    }
    handleCloseReviewModal();
    showAlert("Appointment Reviewed", "Thank you for your review!");
  };

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("Approved");
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const [isCancelDialogVisible, setCancelDialogVisible] = useState(false);

  const filteredUpcomingAppointments = useMemo(() => {
    const now = new Date();
    const timeFilteredAppointments = upcomingAppointments.filter((appointment) => {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      if (appointment.status === "Approved") {
        return endTime > now;
      }
      return startTime > now;
    });
    return timeFilteredAppointments.filter((a) => {
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
      const interpreterName = a.profile?.name.toLowerCase() || "";
      const queryMatch = displayDate.includes(formattedQuery) || interpreterName.includes(formattedQuery);
      return statusMatch && queryMatch;
    });
  }, [upcomingAppointments, searchQuery, statusFilter]);

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogVisible(true);
  };
  const performCancel = () => {
    if (!selectedAppointment) return;
    setUpcomingAppointments((prev) =>
      prev.map((app) => (app.id === selectedAppointment.id ? { ...app, status: "Cancelled" } : app))
    );
    setCancelDialogVisible(false);
    setSelectedAppointment(null);
  };
  const hideCancelDialog = () => {
    setCancelDialogVisible(false);
    setSelectedAppointment(null);
  };

  const renderUserAppointmentActions = (status: Appointment["status"], appointment: Appointment) => {
    switch (status) {
      case "Approved":
        return (
          <>
            <Button mode="contained" style={{ flex: 1 }} onPress={() => joinAppointment(appointment)}>
              Join Appointment
            </Button>
          </>
        );
      case "Pending":
        return (
          <>
            <Button mode="contained" disabled style={styles.actionButtonPrimary}>
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

  {
    /* --- INTERPRETER --- */
  }
  const [approvedInterpreterAppointments, setApprovedInterpreterAppointments] = useState<Appointment[]>([]);
  const [completedInterpreterAppointments, setCompletedInterpreterAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        if (isInterpreter) {
          const [completedData, approvedData] = await Promise.all([
            getReviewInterpreterAppointments(profile.id),
            getUpcomingInterpreterAppointments(profile.id),
          ]);
          setCompletedInterpreterAppointments(completedData);
          setApprovedInterpreterAppointments(approvedData);
        } else {
          const [completedData, upcomingData] = await Promise.all([
            getReviewUserAppointments(profile.id),
            getUpcomingUserAppointments(profile.id),
          ]);
          setCompletedAppointments(completedData);
          setUpcomingAppointments(upcomingData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.id, isInterpreter]);

  const [isClientReviewVisible, setClientReviewVisible] = useState(false);
  const [appointmentToReview, setAppointmentToReview] = useState<Appointment | null>(null);

  const handleOpenClientReview = (appointment: Appointment) => {
    setAppointmentToReview(appointment);
    setClientReviewVisible(true);
  };
  const handleCloseClientReview = () => {
    setClientReviewVisible(false);
    setAppointmentToReview(null);
  };
  const handleSubmitClientReview = (rating: number, comment: string) => {
    if (appointmentToReview) {
      console.log(`Interpreter reviewing client: ${appointmentToReview.profile?.name}`);
      console.log(`Rating: ${rating}, Comment: "${comment}"`);
    }
    handleCloseClientReview();
  };

  const [interpreterSearchQuery, setInterpreterSearchQuery] = useState("");

  const filteredInterpreterApproved = useMemo(() => {
    return approvedInterpreterAppointments
      .filter((a) => a.status === "Approved")
      .filter((a) => {
        const formattedQuery = interpreterSearchQuery.trim().toLowerCase();
        if (formattedQuery === "") return true;

        const displayDate = new Date(a.startTime)
          .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .toLowerCase();
        const clientName = a.profile?.name.toLowerCase() || "";

        return displayDate.includes(formattedQuery) || clientName.includes(formattedQuery);
      });
  }, [approvedInterpreterAppointments, interpreterSearchQuery]);

  {
    /* --- INTERPRETER UI --- */
  }
  if (isInterpreter) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* --- HEADER --- */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          
          <Text variant="headlineMedium" style={styles.greeting}>
            Welcome back, {profile?.name || "Interpreter"}!
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Manage your scheduled appointments
          </Text>

          <Button
            mode="contained"
            onPress={() => router.push('/interpreter/availability')}
            style={{ marginTop: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            icon="calendar-clock"
          >
            Manage Availability
          </Button>     
       
        </View>

        {isLoading ? (
          <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
        ) : (
          <>
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
              {completedInterpreterAppointments.length > 0 ? (
                completedInterpreterAppointments.map((appointment) => (
                  <InterpreterReviewCard
                    key={appointment.id}
                    appointment={appointment}
                    onReview={handleOpenClientReview}
                  />
                ))
              ) : (
                <Text>No recent sessions to review.</Text>
              )}
            </View>

            {/* --- APPROVED APPOINTMENTS --- */}
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Approved Appointments
              </Text>

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

              {filteredInterpreterApproved.length > 0 ? (
                filteredInterpreterApproved.map((appointment) => (
                  <InterpreterApprovedCard key={appointment.id} appointment={appointment} />
                ))
              ) : (
                <Text>No approved appointments found.</Text>
              )}
            </View>
          </>
        )}

        {/* --- REVIEW POP UP --- */}
        {appointmentToReview && (
          <ReviewModal
            visible={isClientReviewVisible}
            onDismiss={handleCloseClientReview}
            onSubmit={handleSubmitClientReview}
            targetName={appointmentToReview.profile?.name || ""}
            sessionDate={appointmentToReview.startTime}
            placeholderText="Share your experience with this client..."
          />
        )}
      </ScrollView>
    );
  }

  {
    /* --- CLIENT UI --- */
  }
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* --- HEADER --- */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back, {profile?.name || "User"}!
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Find the right interpreter for your needs
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Review Completed Sessions
              </Text>
              <Button mode="text" compact>
                View All
              </Button>
            </View>
            {completedAppointments.length > 0 ? (
              completedAppointments.map((appointment) => (
                <ClientReviewCard key={appointment.id} appointment={appointment} onReview={handleOpenReviewModal} />
              ))
            ) : (
              <Text>No recent sessions to review.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Appointments
            </Text>
            <View style={styles.filterContainer}>
              <TextInput
                mode="outlined"
                placeholder="Search by date or interpreter..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
              />
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
                {["All", "Approved", "Pending", "Rejected", "Cancelled"].map((status) => (
                  <Menu.Item
                    key={status}
                    onPress={() => {
                      setStatusFilter(status);
                      setStatusMenuVisible(false);
                    }}
                    title={status}
                  />
                ))}
              </Menu>
            </View>
            {filteredUpcomingAppointments.length > 0 ? (
              filteredUpcomingAppointments.map((appointment) => (
                <ClientAppointmentsCard
                  key={appointment.id}
                  appointment={appointment}
                  getStatusColor={getStatusColor}
                  actions={renderUserAppointmentActions(appointment.status, appointment)}
                />
              ))
            ) : (
              <Text>No upcoming appointments found.</Text>
            )}
          </View>
        </>
      )}

      {/* --- REVIEW POP UP --- */}
      <ReviewModal
        visible={isReviewModalVisible}
        onDismiss={handleCloseReviewModal}
        onSubmit={handleSubmitReview}
        targetName={selectedAppointment?.profile?.name || ""}
        sessionDate={selectedAppointment?.startTime || ""}
        placeholderText="Share your experience with this interpreter..."
      />

      {/* --- CANCEL POP UP --- */}
      <Portal>
        <Dialog visible={isCancelDialogVisible} onDismiss={hideCancelDialog}>
          <Dialog.Title>Cancel Request</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to cancel this appointment request?</Text>
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
