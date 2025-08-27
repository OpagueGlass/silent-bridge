"use client";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  MD3Theme,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import DatePickerInput from "../../components/DatePickerInput";
import TimePickerInput from "../../components/TimePickerInput";
import UserProfileModal from "../../components/UserProfileModal";
import { SPECIALISATION } from "../../constants/data";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";
import { interpreterAppointments } from "../data/mockBookingsDeaf";
import { interpreters } from "../data/mockData";

export default function SearchScreen() {
  const router = useRouter();
  const { isInterpreter } = useAuth();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const openProfileModal = (userId: number) => {
    setSelectedUserId(userId);
    setProfileModalVisible(true);
  };

  const [requests, setRequests] = useState(interpreterAppointments);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const handleUpdateRequestStatus = (
    requestId: number,
    newStatus: "Approved" | "Rejected"
  ) => {
    setRequests((currentRequests) =>
      currentRequests.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const processedRequests = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return requests
      .filter((r) => r.status !== "Completed")
      .filter((r) => {
        const [year, month, day] = r.date.split("-").map(Number);
        const requestDate = new Date(year, month - 1, day);
        return requestDate >= today;
      })
      .filter((r) => {
        return statusFilter === "All" || r.status === statusFilter;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [requests, statusFilter]);

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "limegreen";
      case "Pending":
        return theme.colors.tertiary;
      case "Rejected":
        return theme.colors.error;
      case "Cancelled":
        return theme.colors.onSurfaceDisabled;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const [searchMode, setSearchMode] = useState<"filter" | "name">("filter");

  const [searchQuery, setSearchQuery] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [duration, setDuration] = useState("00:15");
  const [durationMenuVisible, setDurationMenuVisible] = useState(false);
  const openMenu = () => setDurationMenuVisible(true);
  const closeMenu = () => setDurationMenuVisible(false);
  const durationOptions = [
    "00:15", "00:30", "00:45",
    "01:00", "01:15", "01:30",
    "01:45", "02:00"
  ];
  const [selectedLanguage, setSelectedLanguage] = useState("Any");
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const openLanguageMenu = () => setLanguageMenuVisible(true);
  const closeLanguageMenu = () => setLanguageMenuVisible(false);
  const [selectedSpecs, setSelectedSpecs] = useState(
    new Array(SPECIALISATION.length).fill(false)
  );
  const languageOptions = ["Any", "English", "Malay", "Mandarin", "Tamil"];
  const [selectedGender, setSelectedGender] = useState("Any");
  const [ageRange, setAgeRange] = useState("Any");
  const [minRating, setMinRating] = useState(3);

  const [hasSearched, setHasSearched] = useState(false);
  const [displayedInterpreters, setDisplayedInterpreters] = useState<
    typeof interpreters
  >([]);
  const handleSearch = () => {
    let results = [];
    if (searchMode === "name") {
      if (!searchQuery) {
        alert("Please enter a name to search.");
        return;
      }
      results = interpreters.filter((interpreter) => {
        const cleanedQuery = searchQuery.trim().toLowerCase();
        const nameWords = interpreter.name.toLowerCase().split(" ");
        const queryWords = cleanedQuery.split(" ");
        return queryWords.every((queryWord) =>
          nameWords.some((nameWord) => nameWord.startsWith(queryWord))
        );
      });
    } else {
      if (!appointmentDate || !appointmentTime) {
        alert("Please select a date and time.");
        return;
      }
      results = interpreters.filter((interpreter) => {
        const dateAndTimeMatch =
          interpreter.availability
            ?.find((day) => day.date === appointmentDate)
            ?.slots.includes(appointmentTime) ?? false;
        const languageMatch = selectedLanguage === "Any" || interpreter.languages.includes(selectedLanguage);
        const specMatch = (() => {
          const chosenSpecs = SPECIALISATION.filter(
            (_, index) => selectedSpecs[index]
          );
          if (chosenSpecs.length === 0) {
            return true;
          }
          return chosenSpecs.some(spec => interpreter.specialisation.includes(spec));
        })();
        const genderMatch =
          selectedGender === "Any" || interpreter.gender === selectedGender;
        const ageMatch =
          ageRange === "Any"
            ? true
            : interpreter.age >= parseInt(ageRange.split("-")[0]) &&
              interpreter.age <= parseInt(ageRange.split("-")[1]);
        const ratingMatch = interpreter.rating >= minRating;

        return (
          dateAndTimeMatch &&
          languageMatch &&
          specMatch &&
          genderMatch &&
          ageMatch &&
          ratingMatch
        );
      });
    }
    setDisplayedInterpreters(results);
    setHasSearched(true);
  };

  const handleToggleSearchMode = () => {
    const newMode = searchMode === "filter" ? "name" : "filter";
    setSearchMode(newMode);

    if (newMode === "name") {
      setAppointmentDate("");
      setAppointmentTime("");
      setDuration("00:15");
      setSelectedLanguage("Any");
      setSelectedSpecs(new Array(SPECIALISATION.length).fill(false));
      setSelectedGender("Any");
      setAgeRange("Any");
      setMinRating(3);
    } else {
      setSearchQuery("");
    }
    setHasSearched(false);
    setDisplayedInterpreters([]);
  };

  if (isInterpreter) {
    return (
      <View style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.title}>Manage Appointment Requests</Text>
          </View>

          <View style={styles.section}>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setStatusMenuVisible(true)}
                  style={{ marginBottom: 20 }}
                  icon="chevron-down"
                  contentStyle={{ flexDirection: "row-reverse" }}
                >
                  Filter by: {statusFilter}
                </Button>
              }
            >
              {["All", "Pending", "Approved", "Rejected", "Cancelled"].map(status => (
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

            {processedRequests.length > 0 ? (
              processedRequests.map((request) => (
                <Card key={request.id} style={styles.requestCard}>
                  <Card.Content>
                    <View style={styles.requestHeader}>
                      <View style={styles.requestInfo}>
                        <Text style={styles.clientName}>
                          {request.clientName}
                        </Text>
                        <Text style={styles.requestDateTime}>
                          {new Date(request.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })} • {request.time}
                        </Text>
                      </View>
                      <Chip
                        style={{ backgroundColor: getStatusChipColor(request.status) }}
                        textStyle={{ color: 'white', fontSize: 12 }}
                      >
                        {request.status}
                      </Chip>
                    </View>

                    <View style={styles.detailsContainer}>
                      <View style={styles.requestDetailRow}>
                        <MaterialCommunityIcons name="email-outline" size={18} color="#666" />
                        <Text style={styles.requestDetailText} selectable>{request.clientEmail}</Text>
                      </View>
                      <View style={styles.requestDetailRow}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color="#666" />
                        <Text style={styles.requestDetailText}>Duration: {request.duration}</Text>
                      </View>
                      {request.doctorLanguage && (
                        <View style={styles.requestDetailRow}>
                          <MaterialCommunityIcons name="translate" size={18} color="#666" />
                          <Text style={styles.requestDetailText}>Doctor's Language: {request.doctorLanguage}</Text>
                        </View>
                      )}
                      <View style={styles.requestDetailRow}>
                        <MaterialCommunityIcons name="hospital-building" size={18} color="#666" />
                        <Text style={styles.requestDetailText}>Hospital: {request.location}</Text>
                      </View>
                    </View>

                    <View style={styles.requestActions}>
                      <Button
                        mode="text"
                        onPress={() => openProfileModal(request.id)}
                        disabled={request.status === 'Rejected' || request.status === 'Cancelled'}
                      >
                        Profile
                      </Button>
                      
                      {request.status === "Pending" && (
                        <View style={styles.rightActionButtons}>
                          <Button
                            mode="outlined"
                            style={[styles.rejectButton, styles.actionButton]}
                            textColor="#F44336"
                            onPress={() => handleUpdateRequestStatus(request.id, "Rejected")}
                          >
                            Reject
                          </Button>
                          <Button
                            mode="contained"
                            style={styles.actionButton}
                            onPress={() => handleUpdateRequestStatus(request.id, "Approved")}
                          >
                            Accept
                          </Button>
                        </View>
                      )}
                      {request.status === "Approved" && (
                        <Button
                          mode="contained"
                          style={styles.actionButton}
                          onPress={() => alert(`Joining appointment with ${request.clientName}...`)}
                        >
                          Join Appointment
                        </Button>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
                No requests found for the selected filter.
              </Text>
            )}
          </View>
        </ScrollView>

        <UserProfileModal
          visible={isProfileModalVisible}
          userId={selectedUserId}
          onClose={() => setProfileModalVisible(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title}>Interpreter Discovery</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={handleToggleSearchMode}
          >
            <MaterialCommunityIcons
              name={searchMode === "filter" ? "account-search" : "tune"}
              size={18}
              color="white"
            />
            <Text style={styles.toggleButtonText}>
              {searchMode === "filter" ? "Search by Name" : "Filter Search"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {searchMode === "name" ? (
          <>
            <Text style={styles.filterLabel}>Search by Interpreter Name</Text>
            <TextInput
              style={styles.nameSearchInput}
              label="Enter interpreter's name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
            />
          </>
        ) : (
          <>
            {/* --- SEARCH BY DATE AND TIME --- */}
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeField}>
                <Text style={styles.filterLabel}>Appointment Date</Text>
                <DatePickerInput
                  label=""
                  value={appointmentDate}
                  onChange={setAppointmentDate}
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.dateTimeField}>
                <Text style={styles.filterLabel}>Appointment Time</Text>
                <TimePickerInput
                  label=""
                  value={appointmentTime}
                  onChange={setAppointmentTime}
                  style={styles.dateTimeInput}
                />
              </View>
            </View>

            <View style={styles.durationLanguageRow}>
              {/* --- DURATION --- */}
              <View style={{ flex: 1 }}>
                <Text style={styles.filterLabel}>Duration</Text>
                <Menu
                  visible={durationMenuVisible}
                  onDismiss={closeMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openMenu}
                      style={styles.dropdownAnchor}
                    >
                      <Text style={styles.dropdownText}>{duration}</Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} />
                    </TouchableOpacity>
                  }
                >
                  {durationOptions.map((option) => (
                    <Menu.Item
                      key={option}
                      onPress={() => {
                        setDuration(option);
                        closeMenu();
                      }}
                      title={option}
                    />
                  ))}
                </Menu>
              </View>

              {/* --- DOCTOR'S LANGUAGE --- */}
              <View style={{ flex: 1 }}>
                <Text style={styles.filterLabel}>Doctor's Language</Text>
                <Menu
                  visible={languageMenuVisible}
                  onDismiss={closeLanguageMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openLanguageMenu}
                      style={styles.dropdownAnchor}
                    >
                      <Text style={styles.dropdownText}>
                        {selectedLanguage}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} />
                    </TouchableOpacity>
                  }
                >
                  {languageOptions.map((option) => (
                    <Menu.Item
                      key={option}
                      onPress={() => {
                        setSelectedLanguage(option);
                        closeLanguageMenu();
                      }}
                      title={option}
                    />
                  ))}
                </Menu>
              </View>
            </View>

            {/* --- SPECIALISATIONS --- */}
            <Text style={styles.filterLabel}>Specialisation</Text>
            <Card style={styles.checkboxCard}>
              <Card.Content>
                <View style={styles.checkboxGrid}>
                  {SPECIALISATION.map((spec, index) => (
                    <View key={spec} style={styles.checkboxItem}>
                      <Checkbox
                        status={selectedSpecs[index] ? "checked" : "unchecked"}
                        onPress={() => {
                          const newSpecs = [...selectedSpecs];
                          newSpecs[index] = !newSpecs[index];
                          setSelectedSpecs(newSpecs);
                        }}
                      />
                      <Text style={styles.checkboxLabel}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>

            {/* --- GENDER --- */}
            <Text style={styles.filterLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {[
                {
                  value: "Any",
                  icon: (
                    <MaterialCommunityIcons name="account-group" size={22} />
                  ),
                  label: "Any",
                },
                {
                  value: "Male",
                  icon: <MaterialCommunityIcons name="face-man" size={22} />,
                  label: "Male",
                },
                {
                  value: "Female",
                  icon: <MaterialCommunityIcons name="face-woman" size={22} />,
                  label: "Female",
                },
              ].map((option) => {
                const isSelected = selectedGender === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      isSelected && styles.genderOptionSelected,
                    ]}
                    onPress={() => setSelectedGender(option.value)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.genderIcon}>{option.icon}</Text>
                    <Text
                      style={[
                        styles.genderLabel,
                        isSelected && styles.genderLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* --- AGE --- */}
            <Text style={styles.filterLabel}>Age</Text>
            <View style={styles.genderRow}>
              {[
                { value: "Any", label: "Any" },
                { value: "18-24", label: "18 - 24" },
                { value: "25-44", label: "25 - 44" },
                { value: "45-60", label: "45 - 60" },
              ].map((option) => {
                const isSelected = ageRange === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      isSelected && styles.genderOptionSelected,
                    ]}
                    onPress={() => setAgeRange(option.value)}
                    activeOpacity={0.9}
                  >
                    <Text
                      style={[
                        styles.genderLabel,
                        isSelected && styles.genderLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* --- Rating --- */}
            <View style={styles.sliderContainer}>
              <Text style={styles.filterLabel}>Interpreter's Ratings</Text>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setMinRating(i)}>
                    <MaterialCommunityIcons
                      name={i <= minRating ? "star" : "star-outline"}
                      size={32}
                      color={i <= minRating ? "#f8d706db" : "#64748B"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.dateTimeRow}
              label="Enter hospital's name... (Optional)"
              mode="outlined"
            />
          </>
        )}

        <Button
          mode="contained"
          onPress={handleSearch}
          style={styles.searchButton}
          buttonColor="#E0E0E0"
          textColor="#000000"
        >
          Search
        </Button>
      </View>

      {/* --- SEARCH RESULT --- */}
      {hasSearched && (
        <View style={styles.section}>
          {displayedInterpreters.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Top Matches</Text>

              {displayedInterpreters.slice(0, 5).map((interpreter) => (
                <Card key={interpreter.id} style={styles.interpreterCard}>
                  <Card.Content>
                    <View style={styles.interpreterHeader}>
                      <Image
                        source={{ uri: interpreter.avatar }}
                        style={styles.interpreterAvatar}
                      />
                      <View style={styles.interpreterInfo}>
                        <Text style={styles.interpreterName}>
                          {interpreter.name}
                        </Text>
                        <Text style={styles.interpreterSpecialisation}>
                          {interpreter.specialisation}
                        </Text>
                        <View style={styles.interpreterMeta}>
                          <Text style={styles.interpreterRating}>
                            ⭐ {interpreter.rating}
                          </Text>
                        </View>
                        <View style={styles.interpreterTags}>
                          <Chip style={styles.tag} textStyle={styles.tagText}>
                            {interpreter.gender}
                          </Chip>
                          <Chip style={styles.tag} textStyle={styles.tagText}>
                            {interpreter.age}
                          </Chip>
                        </View>
                      </View>
                    </View>

                    <View style={styles.interpreterActions}>
                      <Button
                        mode="outlined"
                        style={styles.profileButton}
                        onPress={() => {
                          router.push({
                            pathname: "/interpreter/[id]",
                            params: {
                              id: interpreter.id,
                              date: appointmentDate,
                              time: appointmentTime,
                            },
                          });
                        }}
                      >
                        Profile
                      </Button>

                      <Button
                        mode="contained"
                        style={styles.bookButton}
                        onPress={() => {
                          if (searchMode === "filter") {
                            router.push({
                              pathname: `/interpreter/[id]/book`,
                              params: {
                                id: interpreter.id,
                                date: appointmentDate,
                                time: appointmentTime,
                              },
                            });
                          } else {
                            router.push({
                              pathname: `/interpreter/[id]/book`,
                              params: {
                                id: interpreter.id,
                              },
                            });
                          }
                        }}
                      >
                        Book Now
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </>
          ) : (
            <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              No interpreters found matching your criteria.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    // Styles for the main container and the Interpreter view
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    header: {
      padding: 20,
      backgroundColor: "#2196F3",
      paddingTop: 60,
      overflow: "visible",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: 15,
    },
    section: {
      padding: 20,
    },
    requestCard: {
      marginBottom: 15,
    },
    requestHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 15,
    },
    clientAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
    },
    requestInfo: {
      flex: 1,
    },
    requestLocationRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    requestLocationText: {
      fontSize: 14,
      color: "#666",
      marginLeft: 4,
    },
    clientName: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 2,
    },
    requestType: {
      fontSize: 14,
      color: "#666",
      marginBottom: 2,
    },
    requestDateTime: {
      fontSize: 14,
      color: "#333",
    },
    detailsContainer: {
      marginBottom: 15,
    },
    requestDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    requestDetailText: {
      fontSize: 14,
      color: "#333",
      marginLeft: 8,
      flexShrink: 1,
    },
    requestActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderColor: "#eee",
    },
    rightActionButtons: {
      flex: 1,
      flexDirection: 'row',
      gap: 8,
    },
    decisionButton: {
      minWidth: 100,
      justifyContent: 'center',
    },
    profileTextButton: {
      marginRight: 8,
    },
    actionButton: {
      flex: 1,
      justifyContent: 'center',
    },
    rejectButton: {
      borderColor: "#F44336",
    },
    // Styles for the Client (search) view header
    headerTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    toggleButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    toggleButtonText: {
      color: "white",
      fontWeight: "500",
      marginLeft: 6,
    },

    // Styles for the filter/search input area
    filterContainer: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
      color: "#333",
    },
    nameSearchInput: {
      flex: 1,
    },
    dateTimeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      zIndex: 10,
      marginBottom: 10,
    },
    durationLanguageRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 10,
    },
    dateTimeField: {
      flex: 1,
      minWidth: 150,
    },
    filterLabel: {
      fontSize: 16,
      fontWeight: "bold",
    },
    dateTimeInput: {
      height: 50,
      justifyContent: "center",
    },
    genderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    genderOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      marginHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#fff",
      elevation: 1,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      height: 50,
    },
    genderOptionSelected: {
      backgroundColor: "#E3F2FD",
      borderColor: "#2196F3",
      shadowOpacity: 0.15,
      elevation: 3,
    },
    genderIcon: {
      fontSize: 20,
      marginRight: 6,
    },
    genderLabel: {
      fontSize: 15,
      color: "#444",
      fontWeight: "500",
    },
    genderLabelSelected: {
      color: "#2196F3",
      fontWeight: "600",
    },
    sliderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    starContainer: {
      flexDirection: "row",
    },
    searchButton: {
      marginTop: 32,
      paddingVertical: 6,
    },

    // Styles for the search results area
    interpreterCard: {
      marginBottom: 15,
    },
    interpreterHeader: {
      flexDirection: "row",
      marginBottom: 15,
    },
    interpreterAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 15,
    },
    interpreterInfo: {
      flex: 1,
    },
    interpreterName: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 5,
    },
    interpreterSpecialisation: {
      fontSize: 14,
      color: "#666",
      marginBottom: 5,
    },
    interpreterMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    interpreterRating: {
      fontSize: 14,
      color: "#333",
    },
    interpreterTags: {
      flexDirection: "row",
      gap: 5,
    },
    tag: {
      backgroundColor: "#E3F2FD",
      height: 25,
    },
    tagText: {
      fontSize: 12,
      color: "#2196F3",
    },
    interpreterActions: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    profileButton: {
      flex: 0.48,
    },
    bookButton: {
      flex: 0.48,
    },
    dropdownContainer: {
      marginVertical: 10,
    },
    dropdownAnchor: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: "#ccc",
    },
    dropdownText: {
      fontSize: 16,
    },
    checkboxCard: {
      marginBottom: 20,
      backgroundColor: "#ffff",
      borderRadius: 12,
    },
    checkboxGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    checkboxItem: {
      flexDirection: "row",
      alignItems: "center",
      width: "50%",
    },
    checkboxLabel: {
      marginLeft: 2,
      fontSize: 15,
      color: "#333",
    },
  });
