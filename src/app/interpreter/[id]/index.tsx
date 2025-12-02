"use client";

import { launchChat } from "@/components/cards/MessageButton";
import RatingCard from "@/components/cards/RatingCard";
import InterpreterNotFoundScreen from "@/components/sections/InterpreterNotFoundScreen";
import LoadingScreen from "@/components/sections/LoadingScreen";
import Gradient from "@/components/ui/Gradient";
import InfoChips from "@/components/ui/InfoChips";
import { LANGUAGES, SPECIALISATION } from "@/constants/data";
import { useAppTheme } from "@/hooks/useAppTheme";
import { toTimeRange } from "@/utils/time";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, DataTable, Text } from "react-native-paper";
import { TabScreen, Tabs, TabsProvider } from "react-native-paper-tabs";
import { BackButton, useInterpreter } from "./_layout";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function InfoChipsSection({ container, title }: { container: string[]; title: string }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      <InfoChips items={container} />
    </View>
  );
}

function AvailabilityTable({
  availability,
}: {
  availability: { day_id: number; start_time: string; end_time: string }[];
}) {
  const theme = useAppTheme();
  const [sortBy, setSortBy] = useState<"day" | "time">("day");
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");

  const handleSort = (column: "day" | "time") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "ascending" ? "descending" : "ascending");
    } else {
      setSortBy(column);
      setSortDirection("ascending");
    }
  };

  const sortedAvailability = [...availability].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "day") {
      comparison = a.day_id - b.day_id;
    } else {
      comparison = a.start_time.localeCompare(b.start_time);
    }
    return sortDirection === "ascending" ? comparison : -comparison;
  });

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Availability
      </Text>
      {availability.length > 0 ? (
        <View style={{ borderRadius: 12, overflow: "hidden" }}>
          <DataTable>
            <DataTable.Header style={{ backgroundColor: theme.colors.primaryContainer, height: 48 }}>
              <DataTable.Title
                sortDirection={sortBy === "day" ? sortDirection : undefined}
                onPress={() => handleSort("day")}
                textStyle={{ fontWeight: "bold", color: theme.colors.onPrimaryContainer, fontSize: 14 }}
              >
                Day
              </DataTable.Title>
              <DataTable.Title
                sortDirection={sortBy === "time" ? sortDirection : undefined}
                onPress={() => handleSort("time")}
                textStyle={{ fontWeight: "bold", color: theme.colors.onPrimaryContainer, fontSize: 14 }}
              >
                Time
              </DataTable.Title>
            </DataTable.Header>
            {sortedAvailability.map((slot, index) => (
              <DataTable.Row
                key={slot.day_id}
                style={{
                  backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.elevation.level2,
                  minHeight: 52,
                }}
              >
                <DataTable.Cell textStyle={{ fontSize: 14, fontWeight: "500" }}>{DAYS[slot.day_id - 1]}</DataTable.Cell>
                <DataTable.Cell textStyle={{ fontSize: 14 }}>
                  {toTimeRange(slot.start_time, slot.end_time)}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      ) : (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          No availability set
        </Text>
      )}
    </View>
  );
}

export default function InterpreterProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const router = useRouter();
  const { interpreter, availability, ratings, isLoading } = useInterpreter();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!interpreter) {
    return <InterpreterNotFoundScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.elevation.level1 }}>
      <BackButton />
      <ScrollView>
        <Gradient style={styles.header}>
          <View style={styles.headerContent}>
            <Avatar.Image size={80} source={{ uri: interpreter.photo }} />
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Text variant="headlineSmall" style={{ color: theme.colors.surface, fontWeight: "bold" }}>
                {interpreter.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.surface }}>
                  {interpreter.avgRating
                    ? `⭐ ${interpreter.avgRating.toFixed(1)} (${ratings.length} reviews)`
                    : "No ratings yet"}
                </Text>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.surface, marginTop: 4 }}>
                {interpreter.gender} • {interpreter.ageRange} • {interpreter.location}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: theme.spacing.md }}>
            <Button
              mode="contained-tonal"
              icon="message"
              onPress={() => launchChat(id!)}
              style={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}
            >
              Message
            </Button>
          </View>
        </Gradient>

        <TabsProvider defaultIndex={0}>
          <Tabs style={{ backgroundColor: theme.colors.surface }}>
            <TabScreen label="Details" icon="information">
              <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md }}>
                <InfoChipsSection
                  container={interpreter.interpreterSpecialisations.map((specIndex) => SPECIALISATION[specIndex])}
                  title="Specialisations"
                />
                <InfoChipsSection
                  container={interpreter.interpreterLanguages.map((langIndex) => LANGUAGES[langIndex])}
                  title="Languages"
                />
                <AvailabilityTable availability={availability} />
              </View>
            </TabScreen>

            <TabScreen label="Reviews" icon="star">
              <View
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingTop: theme.spacing.md,
                  paddingBottom: theme.spacing.sm,
                }}
              >
                {ratings.length > 0 ? (
                  ratings.map((rating, index) => <RatingCard key={index} rating={rating} index={index} />)
                ) : (
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    No reviews yet
                  </Text>
                )}
              </View>
            </TabScreen>
          </Tabs>
        </TabsProvider>
      </ScrollView>

      {/* Book Appointment Button */}
      <View style={{ padding: theme.spacing.md, backgroundColor: theme.colors.surface }}>
        <Button
          mode="contained"
          icon="calendar-check"
          onPress={() => router.push(`/interpreter/${id}/book`)}
          contentStyle={{ paddingVertical: 8 }}
        >
          Book Appointment
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    padding: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    // marginBottom: 16,
  },
  sectionTitle: {
    // fontWeight: "bold",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // infoLabel: {
  //   color: "#616161",
  // },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dayLabel: {
    fontWeight: "500",
    width: 100,
  },
});
