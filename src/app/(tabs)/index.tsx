"use client";

import AppointmentCard from "@/components/cards/AppointmentCard";
import { DateRangePickerInput, getValidRange } from "@/components/inputs/DatePickerInput";
import { DropdownInput } from "@/components/inputs/DropdownInput";
import ReviewSection from "@/components/sections/ReviewSection";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Searchbar, Surface, Text } from "react-native-paper";
import {
  Appointment,
  getReviewInterpreterAppointments,
  getReviewUserAppointments,
  getUpcomingInterpreterAppointments,
  getUpcomingUserAppointments,
} from "../../utils/query";


function NameDropdown({
  nameOptions,
  option,
  setOption,
}: {
  nameOptions: { id: string; label: string }[];
  option: number;
  setOption: (index: number) => void;
}) {
  return <DropdownInput container={nameOptions.map((opt) => opt.label)} option={option} setOption={setOption} />;
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
      setNameOptions([
        { id: "0", label: "All" },
        ...upcomingData.map((appointment) => ({
          id: appointment.profile!.id,
          label: appointment.profile!.name,
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
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchAppointments} />
      }
    >
      {/* --- HEADER WITH CURVED BACKGROUND --- */}
      <View style={[styles.curvedHeader, { backgroundColor: theme.colors.primary }]}>
        {isInterpreter ? (
          <TouchableOpacity onPress={() => router.push("/availability")}>
            <Searchbar
              value={""}
              placeholder="Manage Availability"
              style={styles.searchbar}
              pointerEvents="none"
              icon="calendar-clock"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Searchbar value={""} placeholder="Start your search" style={styles.searchbar} pointerEvents="none" />
          </TouchableOpacity>
        )}
      </View>

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
                  paddingVertical: theme.spacing.sm,
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  searchbar: {
    borderRadius: 12,
  },
});
