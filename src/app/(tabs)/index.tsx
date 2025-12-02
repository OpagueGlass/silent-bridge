"use client";

import AppointmentCard from "@/components/cards/AppointmentCard";
import { getCalendarId } from "@/components/cards/RequestCard";
import { DateRangePickerInput, getValidRange } from "@/components/inputs/DatePickerInput";
import { DropdownIndex } from "@/components/inputs/DropdownInput";
import ReviewSection from "@/components/sections/ReviewSection";
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
import { Searchbar, Surface, Text } from "react-native-paper";

function NameDropdown({
  nameOptions,
  option,
  setOption,
}: {
  nameOptions: { id: string; label: string }[];
  option: number;
  setOption: (index: number) => void;
}) {
  return <DropdownIndex container={nameOptions.map((opt) => opt.label)} option={option} setOption={setOption} />;
}

export default function HomeScreen() {
  const { profile, isInterpreter } = useAuth();
  const theme = useAppTheme();
  const router = useRouter();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [reviewAppointments, setReviewAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [option, setOption] = useState(0);
  const [dateRange, setDateRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [nameOptions, setNameOptions] = useState<{ id: string; label: string }[]>([{ id: "0", label: "All" }]);

  const fetchAppointments = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [reviewData, upcomingData] = isInterpreter
        ? await Promise.all([
            getReviewInterpreterAppointments(profile.id),
            getUpcomingInterpreterAppointments(profile.id),
          ])
        : await Promise.all([getReviewUserAppointments(profile.id), getUpcomingUserAppointments(profile.id)]);
      setReviewAppointments(reviewData);
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
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, isInterpreter]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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

          {/* --- APPROVED APPOINTMENTS --- */}
          <View>
            <Text variant="titleLarge">Upcoming Appointments</Text>
            <View
              style={{ flexDirection: "row", gap: 12, marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }}
            >
              <View style={{ flex: 1 }}>
                <NameDropdown nameOptions={nameOptions} option={option} setOption={setOption} />
              </View>
              <DateRangePickerInput dateRange={dateRange} setDateRange={setDateRange} validRange={getValidRange()} />
            </View>

            {upcomingAppointments.length > 0 ? (
              <Surface
                mode="flat"
                style={{
                  paddingTop: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.sm,
                  borderRadius: theme.roundness,
                }}
              >
                {upcomingAppointments
                  .filter((appointment) => {
                    const matchesName = option === 0 || appointment.profile?.id === nameOptions[option].id;
                    const { startTime } = appointment;
                    const matchesDateRange =
                      dateRange.startDate && dateRange.endDate
                        ? new Date(startTime) >= dateRange.startDate && new Date(startTime) <= dateRange.endDate
                        : true;
                    return matchesName && matchesDateRange;
                  })
                  .map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} isInterpreter={isInterpreter} />
                  ))}
              </Surface>
            ) : (
              <Surface
                mode="flat"
                style={{
                  height: 160,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: theme.spacing.xs,
                  borderRadius: theme.roundness,
                }}
              >
                <Text style={{ color: theme.colors.onSurfaceVariant }}>No upcoming appointments found</Text>
              </Surface>
            )}
          </View>
        </View>
      )}
    </ScrollView>
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
