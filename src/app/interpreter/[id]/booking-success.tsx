import { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Pressable, Image } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MD3Theme } from "react-native-paper";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getInterpreterProfile, InterpreterProfile } from "@/utils/query";
import { SPECIALISATION } from "@/constants/data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDate, getStartTime } from "@/utils/helper";
import LoadingScreen from "../../../components/LoadingScreen";
import InterpreterNotFoundScreen from "../../../components/InterpreterNotFoundScreen";

export default function BookingSuccessScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [profile, setProfile] = useState<InterpreterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const fetchInterpreterProfile = async () => {
      const interpreterProfile = await getInterpreterProfile(id.toString());
      setProfile(interpreterProfile);
      const storedDetails = await AsyncStorage.getItem("appointmentDetails").then((data) =>
        data ? JSON.parse(data) : null
      );
      if (storedDetails) {
        setDate(getDate(storedDetails));
        setTime(getStartTime(storedDetails));
      }
      setIsLoading(false);
    };

    fetchInterpreterProfile();
  }, [id]);

  const [isHovering, setIsHovering] = useState(false);
  const handleEmailPress = async () => {
    if (!profile?.email) return;

    const subject = `Inquiry Regarding Booking Request`;
    const url = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Cannot open email", "No email app is available.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  } else if (!profile) {
    return <InterpreterNotFoundScreen />;
  }

  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  return (
    <ScrollView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/search")} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <MaterialCommunityIcons name="check" size={48} color="white" />
          </View>
          <Text style={styles.successTitle}>Request Sent!</Text>
          <Text style={styles.successSubtitle}>Waiting for your interpreter to accept your request</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.interpreterRow}>
            {/* <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient> */}
            <Image
              source={{
                uri: profile.photo,
              }}
              style={styles.avatarContainer}
            />

            <View style={styles.interpreterInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.interpreterName}>{profile.name}</Text>
                <View>
                  <Pressable onHoverIn={() => setIsHovering(true)} onHoverOut={() => setIsHovering(false)}>
                    <TouchableOpacity onPress={handleEmailPress}>
                      <MaterialCommunityIcons name="email-fast" size={20} color="darkblue" />
                    </TouchableOpacity>
                  </Pressable>

                  {isHovering && (
                    <View style={styles.customTooltip}>
                      <Text style={styles.customTooltipText}>{profile.email}</Text>
                    </View>
                  )}
                </View>
              </View>

              {
                <Text style={styles.interpreterSubtitle}>
                  {profile.interpreterSpecialisations.map((spec) => SPECIALISATION[spec]).join(", ")}
                </Text>
              }
            </View>
          </View>

          <View style={styles.divider} />

          <View style={[styles.statusBadge, styles.statusBadgePending]}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#9D5200" />
            <Text style={styles.statusText}>Pending Approval</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-blank" size={20} style={styles.infoIcon} />
            <Text style={styles.infoText}>{date}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} style={styles.infoIcon} />
            <Text style={styles.infoText}>{time}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What happens next?</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>{profile.name} reviews your request</Text>
              <Text style={styles.stepBody}>Your interpreter will accept or decline shortly</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>You'll get notified</Text>
              <Text style={styles.stepBody}>We'll send you an instant notification with the response</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Start your session</Text>
              <Text style={styles.stepBody}>If accepted, you can chat and join your appointment</Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          {/* <TouchableOpacity style={[styles.button, styles.buttonPrimary]}>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={20}
              color={theme.colors.onPrimary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              Message {interpreter.name.split(" ")[0]}
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.replace("/(tabs)/search")}
          >
            <MaterialCommunityIcons
              name="find-replace"
              size={20}
              color={theme.colors.primary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Find Other Interpreters</Text>
          </TouchableOpacity>
        </View>

        {/* --- Mock Session Details --- */}
        {/* <View style={[styles.section, { paddingVertical: 30 }]}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          <View style={styles.sessionDetailsContainer}>
            <View style={styles.sessionDetailsRow}>
              <Text style={styles.sessionDetailsLabel}>Booking ID:</Text>
              <Text style={styles.sessionDetailsValue}>#IC-2024-0115</Text>
            </View>
            <View style={styles.sessionDetailsRow}>
              <Text style={styles.sessionDetailsLabel}>Session Type:</Text>
              <Text style={styles.sessionDetailsValue}>Video Call</Text>
            </View>
            <View style={styles.sessionDetailsRow}>
              <Text style={styles.sessionDetailsLabel}>Status:</Text>
              <Text style={[styles.sessionDetailsValue, styles.statusPending]}>
                Pending Approval
              </Text>
            </View>
          </View>
        </View> */}

        {/* --- Changed Your Mind --- */}
        <View style={styles.changedMindContainer}>
          <Text style={styles.changedMindText}>Changed your mind?</Text>
          <View style={styles.linksContainer}>
            <TouchableOpacity>
              <Text style={[styles.linkText, styles.cancelLink]}>Cancel Request</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.linkText, styles.supportLink]}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 24,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    contentContainer: {
      padding: 24,
    },
    successContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    successCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    successSubtitle: {
      color: theme.colors.onSurfaceVariant,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 24,
      marginBottom: 24,
    },
    interpreterRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatarContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    avatarText: {
      color: theme.colors.onPrimary,
      fontSize: 24,
      fontWeight: "bold",
    },
    interpreterInfo: {
      flex: 1,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    customTooltip: {
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: [{ translateX: -50 }],
      backgroundColor: "#616161",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginBottom: 8,
    },
    customTooltipText: {
      color: "white",
      fontSize: 12,
    },
    interpreterName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginRight: 8, // Adds space between the name and the separator
    },
    interpreterSubtitle: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    starsContainer: {
      flexDirection: "row",
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.surfaceVariant,
      marginVertical: 16,
      opacity: 0.5,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    infoIcon: {
      marginRight: 12,
      color: theme.colors.onSurfaceVariant,
    },
    infoText: {
      color: theme.colors.onSurface,
      fontSize: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    stepNumberContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      marginTop: 4,
    },
    stepNumberText: {
      color: theme.colors.onPrimary,
      fontWeight: "bold",
    },
    stepTextContainer: {
      flex: 1,
    },
    stepTitle: {
      fontWeight: "500",
      color: theme.colors.onSurface,
    },
    stepBody: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    button: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 999,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    buttonSecondary: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "600",
    },
    buttonTextPrimary: {
      color: theme.colors.onPrimary,
    },
    buttonTextSecondary: {
      color: theme.colors.primary,
    },
    buttonIcon: {
      marginRight: 8,
    },
    sessionDetailsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 24,
    },
    sessionDetailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sessionDetailsLabel: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 16,
    },
    sessionDetailsValue: {
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: "600",
    },
    statusPending: {
      color: "#E5A743", // Example color for pending status
    },
    changedMindContainer: {
      alignItems: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    changedMindText: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
      fontSize: 14,
    },
    linksContainer: {
      flexDirection: "row",
    },
    linkText: {
      fontWeight: "600",
      fontSize: 16,
    },
    cancelLink: {
      color: theme.colors.error,
      marginRight: 24,
    },
    supportLink: {
      color: theme.colors.primary,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 999,
      alignSelf: "flex-start",
      marginBottom: 16,
    },
    statusBadgePending: {
      backgroundColor: "#FFEFCF",
    },
    statusText: {
      marginLeft: 6,
      color: "#9D5200",
      fontWeight: "600",
      fontSize: 14,
    },
  });
