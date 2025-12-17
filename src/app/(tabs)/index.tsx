"use client";

import ReviewSection from "@/components/sections/ReviewSection";
import UpcomingSection from "@/components/sections/UpcomingSection";
import Gradient from "@/components/ui/Gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  Appointment,
  getReviewInterpreterAppointments,
  getReviewUserAppointments,
  getUpcomingInterpreterAppointments,
  getUpcomingUserAppointments,
} from "@/utils/query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";

export default function HomeScreen() {
  const { profile, isInterpreter, getValidProviderToken } = useAuth();
  const theme = useAppTheme();
  const router = useRouter();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [reviewAppointments, setReviewAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nameOptions, setNameOptions] = useState<{ id: string; label: string }[]>([{ id: "0", label: "All" }]);

  const fetchUpcomingAppointments = useCallback(async () => {
    const upcomingData = isInterpreter
      ? await getUpcomingInterpreterAppointments(profile!.id)
      : await getUpcomingUserAppointments(profile!.id);
    setUpcomingAppointments(upcomingData);

    // Get unique profiles and sort by name
    const uniqueProfiles = Array.from(
      new Map(upcomingData.map((appointment) => [appointment.profile!.id, appointment.profile!])).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    setNameOptions([
      { id: "0", label: "All" },
      ...uniqueProfiles.map((profile) => ({
        id: profile.id,
        label: profile.name,
      })),
    ]);
  }, [profile?.id, isInterpreter]);

  const fetchAppointments = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const reviewData = isInterpreter
        ? await getReviewInterpreterAppointments(profile.id)
        : await getReviewUserAppointments(profile.id);
      setReviewAppointments(reviewData);
      await fetchUpcomingAppointments();
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, isInterpreter]);

  // Initial fetch on mount
  useEffect(() => {
    const refreshUpcomingAppointments = async () => {
      await fetchUpcomingAppointments();
    };
    window.addEventListener("refreshAppointments", refreshUpcomingAppointments);
    fetchAppointments();
    return () => window.removeEventListener("refreshAppointments", refreshUpcomingAppointments);
  }, [fetchAppointments, fetchUpcomingAppointments]);

  // Fetch appointments when the tab comes into focus only if a request was accepted
  useFocusEffect(
    useCallback(() => {
      const checkAndRefresh = async () => {
        const requestAccepted = await AsyncStorage.getItem("requestAccepted");
        if (requestAccepted === "true") {
          await AsyncStorage.removeItem("requestAccepted");
          await fetchAppointments();
        }
      };
      checkAndRefresh();
    }, [fetchAppointments])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAppointments} />}
      >
        {/* --- HEADER WITH CURVED BACKGROUND --- */}
        <Gradient style={styles.curvedHeader}>
          {isInterpreter ? (
            <TouchableOpacity
              onPress={() => {
                router.push("/availability");
              }}
            >
              <Searchbar
                value={""}
                placeholder="Manage Availability"
                style={styles.searchbar}
                pointerEvents="none"
                editable={false}
                icon="calendar-clock"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                AsyncStorage.setItem("quickSearch", "true");
                router.push("/search");
              }}
            >
              <Searchbar
                value={""}
                placeholder="Start your search"
                style={styles.searchbar}
                pointerEvents="none"
                editable={false}
              />
            </TouchableOpacity>
          )}
        </Gradient>

        {isLoading ? (
          <ActivityIndicator animating={true} style={{ marginTop: theme.spacing.md }} />
        ) : (
          <View style={{ padding: theme.spacing.md }}>
            <View style={{ marginBottom: theme.spacing.md }}>
              <Text variant="titleLarge" style={{ marginBottom: theme.spacing.sm }}>
                Review Sessions
              </Text>
              <ReviewSection
                profile={profile}
                reviewAppointments={reviewAppointments}
                isInterpreter={isInterpreter}
                setReviewAppointments={setReviewAppointments}
              />
            </View>

            <UpcomingSection
              profile={profile}
              upcomingAppointments={upcomingAppointments}
              setUpcomingAppointments={setUpcomingAppointments}
              nameOptions={nameOptions}
              isInterpreter={isInterpreter}
              getProviderToken={getValidProviderToken}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  curvedHeader: {
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  gradientOverlay: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  searchbar: {
    borderRadius: 12,
  },
});
