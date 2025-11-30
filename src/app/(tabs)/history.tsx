"use client";

import HistoryCard from "@/components/cards/HistoryCard";
import { DateRangePickerInput, getToday } from "@/components/inputs/DatePickerInput";
import { DropdownIndex } from "@/components/inputs/DropdownInput";
import Gradient from "@/components/ui/Gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Appointment, getPastAppointments } from "@/utils/query";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";

function NameDropdown({
  nameOptions,
  option,
  setOption,
  colour,
}: {
  nameOptions: { id: string; label: string }[];
  option: number;
  setOption: (index: number) => void;
  colour?: string;
}) {
  return (
    <DropdownIndex
      container={nameOptions.map((opt) => opt.label)}
      option={option}
      setOption={setOption}
      style={{ backgroundColor: colour }}
    />
  );
}

export default function HistoryScreen() {
  const { profile, isInterpreter } = useAuth();
  const theme = useAppTheme();
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [option, setOption] = useState(0);
  const [dateRange, setDateRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [nameOptions, setNameOptions] = useState<{ id: string; label: string }[]>([{ id: "0", label: "All" }]);

  const fetchPastAppointments = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getPastAppointments(profile.id, isInterpreter);
      setPastAppointments(data);

      // Get unique profiles and sort by name
      const uniqueProfiles = Array.from(
        new Map(
          data.filter((apt) => apt.profile).map((appointment) => [appointment.profile!.id, appointment.profile!])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name));

      setNameOptions([
        { id: "0", label: "All" },
        ...uniqueProfiles.map((profile) => ({
          id: profile.id,
          label: profile.name,
        })),
      ]);
    } catch (error) {
      console.error("Failed to fetch past appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, isInterpreter]);

  useEffect(() => {
    fetchPastAppointments();
  }, [fetchPastAppointments]);

  const filteredAppointments = pastAppointments.filter((appointment) => {
    // Filter by name dropdown
    const matchesName = option === 0 || appointment.profile?.id === nameOptions[option].id;

    // Filter by date range
    const { startTime } = appointment;
    const matchesDateRange =
      dateRange.startDate && dateRange.endDate
        ? new Date(startTime) >= dateRange.startDate && new Date(startTime) <= dateRange.endDate
        : true;

    return matchesName && matchesDateRange;
  });

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.elevation.level1 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchPastAppointments} />}
    >
      <Gradient style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <NameDropdown
              nameOptions={nameOptions}
              option={option}
              setOption={setOption}
              colour={theme.colors.elevation.level3}
            />
          </View>
          <DateRangePickerInput
            dateRange={dateRange}
            setDateRange={setDateRange}
            validRange={{ startDate: undefined, endDate: getToday() }}
          />
        </View>
      </Gradient>

      <View style={{ padding: theme.spacing.sm }}>
        {isLoading ? (
          <ActivityIndicator animating={true} style={{ marginTop: theme.spacing.md }} />
        ) : filteredAppointments.length > 0 ? (
          <Surface
            mode="flat"
            style={{
              paddingTop: theme.spacing.md,
              paddingHorizontal: theme.spacing.sm,
              borderRadius: theme.roundness,
            }}
          >
            {filteredAppointments.map((appointment) => (
              <HistoryCard key={appointment.id} appointment={appointment} isInterpreter={isInterpreter} />
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
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {pastAppointments.length === 0 ? "No past appointments found" : "No appointments match your filters"}
            </Text>
          </Surface>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerContent: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
    marginHorizontal: 12,
  },
});
