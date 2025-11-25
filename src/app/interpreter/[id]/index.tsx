import { LANGUAGES, SPECIALISATION } from "@/constants/data";
import { getInterpreterProfile, getRatings, InterpreterProfile, Rating } from "@/utils/query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card, Chip, MD3Theme } from "react-native-paper";
import InterpreterNotFoundScreen from "../../../components/sections/InterpreterNotFoundScreen";
import LoadingScreen from "../../../components/sections/LoadingScreen";
import { useAppTheme } from "../../../hooks/useAppTheme";

export default function InterpreterDetailScreen() {
  const router = useRouter();

  const { id, date, time } = useLocalSearchParams();

  const [profile, setProfile] = useState<InterpreterProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const theme = useAppTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const fetchInterpreterData = async () => {
      const interpreterProfile = await getInterpreterProfile(id.toString());
      const interpreterRatings = await getRatings(id.toString());
      setProfile(interpreterProfile);
      setRatings(interpreterRatings);
      setIsLoading(false);
    };

    fetchInterpreterData();
  }, [id]);

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
  const fullStars = Math.floor(profile.avgRating ?? 0);

  return (
    <ScrollView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interpreter Profile</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* --- Profile Section --- */}
        <View style={styles.profileSection}>
          {/* <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient> */}
          <Image
            source={{
              uri: profile.photo,
            }}
            style={styles.avatarContainer}
          />

          <Text style={styles.name}>{profile.name}</Text>

          {/* --- Personal Info (Gender & Age) --- */}
          <View style={styles.personalInfoContainer}>
            <Text style={styles.subtitle}>{profile.gender}</Text>
            <Text style={styles.subtitle}>•</Text>
            <Text style={styles.subtitle}>{profile.ageRange}</Text>
          </View>

          {/* --- Rating --- */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <MaterialCommunityIcons
                  key={i}
                  name={i < fullStars ? "star" : "star-outline"}
                  size={20}
                  color="#FBBF24"
                />
              ))}
            </View>
            <Text style={styles.reviewText}>{profile.avgRating} (reviews)</Text>
          </View>

          {/* --- Mock Availability Status --- */}
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityDot} />
            <Text style={styles.availabilityText}>Available Now</Text>
          </View>
        </View>

        {/* --- Specialisations Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialisations</Text>
          <View style={styles.chipContainer}>
            {profile.interpreterSpecialisations.map((spec) => (
              <Chip key={spec} style={styles.chip} textStyle={styles.chipText}>
                {SPECIALISATION[spec]}
              </Chip>
            ))}
          </View>
        </View>

        {/* --- Languages Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.chipContainer}>
            {profile.interpreterLanguages.map((lang) => (
              <Chip key={lang} style={styles.chip} textStyle={styles.chipText}>
                {LANGUAGES[lang]}
              </Chip>
            ))}
          </View>
        </View>

        {/* --- Mock About Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {/* <Text style={styles.aboutText}>Certified interpreter with 8+ years of experience...</Text> */}
          <Text style={styles.aboutText}>Location: {profile.location}</Text>
          <Text style={styles.aboutText}>Email: {profile.email}</Text>
        </View>

        {/* --- Mock Recent Reviews Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {ratings.map((rating, index) => (
            <Card key={index} style={styles.reviewCard}>
              <Card.Content style={styles.reviewCardContent}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={{
                      uri: rating.photo,
                    }}
                    style={styles.reviewAvatar}
                  />
                  <Text style={styles.reviewName}>{rating.name}</Text>
                  <View style={styles.starsContainer}>
                    {[...Array(rating.score)].map((_, i) => (
                      <MaterialCommunityIcons key={i} name="star" size={14} color="#FBBF24" />
                    ))}
                  </View>
                </View>
                {rating.message && <Text style={styles.reviewBody}>{rating.message}</Text>}
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* --- Action Buttons Section --- */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, { marginBottom: 12 }]}
            onPress={() =>
              router.push({
                pathname: `/interpreter/[id]/book`,
                params: {
                  id: profile.id,
                  date,
                  time,
                },
              })
            }
          >
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Book Session</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={[styles.button, styles.buttonSecondary]}>
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Start Chat
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    // Styles for the main page layout and structure
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
    }, // Styles for the interpreter's main profile section
    profileSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarContainer: {
      width: 128,
      height: 128,
      borderRadius: 64,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    avatarText: {
      color: theme.colors.onPrimary,
      fontSize: 48,
      fontWeight: "bold",
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    personalInfoContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    starsContainer: {
      flexDirection: "row",
    },
    reviewText: {
      color: theme.colors.onSurfaceVariant,
      marginLeft: 8,
    },
    availabilityContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    availabilityDot: {
      width: 12,
      height: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
      marginRight: 8,
    },
    availabilityText: {
      color: theme.colors.primary,
      fontWeight: "500",
    }, // Styles for the sections (Specializations, About, Reviews)
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.secondaryContainer,
    },
    chipText: {
      color: theme.colors.onSecondaryContainer,
    },
    aboutText: {
      color: theme.colors.onSurfaceVariant,
      lineHeight: 22,
    },
    reviewCard: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      marginBottom: 12,
    },
    reviewCardContent: {
      padding: 16,
    },
    reviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    reviewAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: 12,
    },
    reviewName: {
      fontWeight: "500",
      color: theme.colors.onSurface,
    },
    reviewBody: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    }, // Styles for the action buttons at the bottom
    buttonSection: {
      gap: 12,
    },
    button: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 999,
      alignItems: "center",
    },
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "600",
    },
    buttonTextPrimary: {
      color: theme.colors.onPrimary,
    },
    buttonSecondary: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    buttonTextSecondary: {
      color: theme.colors.primary,
    }, // Default styles for the container when not found
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#f5f5f5",
      justifyContent: "center",
      alignItems: "center",
    },
  });
