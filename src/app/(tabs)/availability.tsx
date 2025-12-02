"use client";

import TimePickerInput from "@/components/inputs/TimePickerInput";
import WarningDialog from "@/components/modals/WarningDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDisclosure } from "@/hooks/useDisclosure";
import { getAvailabilities, updateAvailabilities } from "@/utils/query";
import { toTime } from "@/utils/time";
import { Redirect, useRouter } from "expo-router";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Calendar } from "react-native-big-calendar";
import { Button, IconButton, Modal, Portal, Text } from "react-native-paper";

const getDayKey = (date: Date) => {
  return date.getDay() || 7;
};

const getCurrentWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Calculate Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const createEvent = (
  date: Date,
  startTime: { hours: number; minutes: number },
  endTime: { hours: number; minutes: number }
) => {
  const start = new Date(date);
  start.setHours(startTime.hours, startTime.minutes, 0, 0);
  const end = new Date(date);
  end.setHours(endTime.hours, endTime.minutes, 0, 0);
  return { title: "Free", start, end };
};

const handleCellPress =
  (
    setSelectedDate: Dispatch<SetStateAction<Date | null>>,
    availabilities: { [key: number]: { start: Date; end: Date } },
    setStartTime: Dispatch<SetStateAction<{ hours: number | undefined; minutes: number | undefined }>>,
    setEndTime: Dispatch<SetStateAction<{ hours: number | undefined; minutes: number | undefined }>>,
    open: () => void
  ) =>
  (date: Date) => {
    setSelectedDate(date);
    const dayKey = getDayKey(date);
    const availability = availabilities[dayKey];

    if (availability) {
      setStartTime({ hours: availability.start.getHours(), minutes: availability.start.getMinutes() });
      setEndTime({ hours: availability.end.getHours(), minutes: availability.end.getMinutes() });
    } else {
      setStartTime({ hours: undefined, minutes: undefined });
      setEndTime({ hours: undefined, minutes: undefined });
    }
    open();
  };

function updateEvent(
  selectedDate: Date | null,
  startTime: { hours: number | undefined; minutes: number | undefined },
  endTime: { hours: number | undefined; minutes: number | undefined },
  events: { title: string; start: Date; end: Date }[],
  setEvents: Dispatch<SetStateAction<{ title: string; start: Date; end: Date }[]>>,
  availabilities: { [key: number]: { start: Date; end: Date } },
  setAvailabilities: Dispatch<SetStateAction<{ [key: number]: { start: Date; end: Date } }>>,
  setValidationError: Dispatch<SetStateAction<{ title: string; message: string } | null>>,
  close: () => void
) {
  if (!selectedDate) {
    return;
  }

  if (startTime.hours === undefined || startTime.minutes === undefined) {
    setValidationError({ title: "Invalid Start Time", message: "Please select a start time for your availability." });
    return;
  }

  if (endTime.hours === undefined || endTime.minutes === undefined) {
    setValidationError({ title: "Invalid End Time", message: "Please select an end time for your availability." });
    return;
  }

  const startMinutes = startTime.hours * 60 + startTime.minutes;
  const endMinutes = endTime.hours * 60 + endTime.minutes;

  if (endMinutes <= startMinutes) {
    setValidationError({ title: "Invalid Time Range", message: "End time must be after start time." });
    return;
  }

  const newEvent = createEvent(
    selectedDate,
    startTime as { hours: number; minutes: number },
    endTime as { hours: number; minutes: number }
  );
  const dayKey = getDayKey(selectedDate);

  // Update availability map
  const newAvailability = { ...availabilities };
  newAvailability[dayKey] = { start: newEvent.start, end: newEvent.end };
  setAvailabilities(newAvailability);

  // Update events for calendar display
  const newEvents = [...events];
  const index = newEvents.findIndex((event) => getDayKey(event.start) === dayKey);

  if (index !== -1) {
    // Replace existing event
    newEvents[index] = newEvent;
  } else {
    // Add new event
    newEvents.push(newEvent);
  }

  setEvents(newEvents);
  close();
}

function deleteEvent(
  selectedDate: Date | null,
  events: { title: string; start: Date; end: Date }[],
  setEvents: Dispatch<SetStateAction<{ title: string; start: Date; end: Date }[]>>,
  availabilities: { [key: number]: { start: Date; end: Date } },
  setAvailabilities: Dispatch<SetStateAction<{ [key: number]: { start: Date; end: Date } }>>,
  close: () => void
) {
  if (!selectedDate) return;
  const dayKey = getDayKey(selectedDate);
  const newAvailabilities = { ...availabilities };
  delete newAvailabilities[dayKey];
  setAvailabilities(newAvailabilities);
  const newEvents = events.filter((event) => getDayKey(event.start) !== dayKey);
  setEvents(newEvents);
  close();
}

export default function AvailabilityScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { profile, isInterpreter } = useAuth();
  const [availabilities, setAvailabilities] = useState<{ [key: number]: { start: Date; end: Date } }>({});
  const [events, setEvents] = useState<{ title: string; start: Date; end: Date }[]>([]);
  const { isOpen: modal, open: openModal, close: closeModal } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<{ hours: number | undefined; minutes: number | undefined }>({
    hours: undefined,
    minutes: undefined,
  });
  const [endTime, setEndTime] = useState<{ hours: number | undefined; minutes: number | undefined }>({
    hours: undefined,
    minutes: undefined,
  });
  const [validationError, setValidationError] = useState<{ title: string; message: string } | null>(null);
  const { isOpen: confirmDialog, open: openConfirmDialog, close: closeConfirmDialog } = useDisclosure();

  const fetchAvailabilities = useCallback(async () => {
    if (profile) {
      const data = await getAvailabilities(profile.id);
      const formattedData = data.map((availability) => ({
        day_id: availability.day_id,
        start_time: toTime(availability.start_time),
        end_time: toTime(availability.end_time),
      }));
      const events = formattedData.map((availability) => {
        const date = getCurrentWeekStart();
        date.setDate(date.getDate() + availability.day_id - 1); // day_id: 1 (Mon) to 7 (Sun)
        return createEvent(
          date,
          { hours: availability.start_time.getHours(), minutes: availability.start_time.getMinutes() },
          { hours: availability.end_time.getHours(), minutes: availability.end_time.getMinutes() }
        );
      });
      setEvents(events);
      setAvailabilities(
        formattedData.reduce(
          (acc, curr) => {
            acc[curr.day_id] = { start: curr.start_time, end: curr.end_time };
            return acc;
          },
          {} as { [key: number]: { start: Date; end: Date } }
        )
      );
    }
  }, [profile]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  // Redirect if not an interpreter
  if (!isInterpreter) {
    return <Redirect href="/" />;
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={{ paddingVertical: theme.spacing.md, paddingBottom: 0, flex: 1 }}>
        <Text variant="headlineSmall" style={{ marginBottom: theme.spacing.md, paddingHorizontal: theme.spacing.md }}>
          Manage Availability
        </Text>

        <View style={{ flex: 1, marginBottom: theme.spacing.md }}>
          <Calendar
            events={events}
            height={600}
            mode="week"
            swipeEnabled={false}
            showTime={true}
            weekStartsOn={1}
            hideNowIndicator={true}
            weekEndsOn={0}
            onPressCell={handleCellPress(setSelectedDate, availabilities, setStartTime, setEndTime, openModal)}
            theme={{
              palette: {
                primary: {
                  main: theme.colors.primary,
                  contrastText: theme.colors.onPrimary,
                },
                gray: {
                  "200": theme.colors.surfaceVariant,
                  "500": theme.colors.onSurface,
                },
              },
            }}
            headerContentStyle={{ height: 11, overflow: "hidden" }}
          />
        </View>

        <Portal>
          <Modal visible={modal} onDismiss={closeModal} contentContainerStyle={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: "bold" }}>
                    Set Availability
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {selectedDate && selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
                  </Text>
                </View>
                <IconButton icon="close" size={24} onPress={closeModal} iconColor={theme.colors.onSurface} />
              </View>
              <View style={styles.modalBody}>
                <View style={{ flexDirection: "row", gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="labelLarge" style={{ marginBottom: theme.spacing.xs }}>
                      Start Time
                    </Text>
                    <TimePickerInput time={startTime} setTime={setStartTime} placeholder="Start time" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="labelLarge" style={{ marginBottom: theme.spacing.xs }}>
                      End Time
                    </Text>
                    <TimePickerInput time={endTime} setTime={setEndTime} placeholder="End time" />
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Button
                    mode="outlined"
                    icon="delete"
                    onPress={() =>
                      deleteEvent(selectedDate, events, setEvents, availabilities, setAvailabilities, closeModal)
                    }
                    style={{ flex: 1 }}
                    buttonColor={theme.colors.errorContainer}
                    textColor={theme.colors.onErrorContainer}
                  >
                    Delete
                  </Button>
                  <Button
                    mode="contained"
                    icon="check"
                    onPress={() =>
                      updateEvent(
                        selectedDate,
                        startTime,
                        endTime,
                        events,
                        setEvents,
                        availabilities,
                        setAvailabilities,
                        setValidationError,
                        closeModal
                      )
                    }
                    style={{ flex: 1 }}
                  >
                    Save
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
        </Portal>

        <WarningDialog
          visible={validationError !== null}
          title={validationError?.title || ""}
          message={validationError?.message || ""}
          onDismiss={() => setValidationError(null)}
          onConfirm={() => setValidationError(null)}
        />

        <WarningDialog
          visible={confirmDialog}
          title="Confirm Availability"
          message={`Are you sure you want to save these availability changes?`}
          onDismiss={closeConfirmDialog}
          onConfirm={() => {
            updateAvailabilities(profile!.id, availabilities);
            closeConfirmDialog();
            router.push("/(tabs)");
          }}
        />

        <View style={{ padding: theme.spacing.md, paddingTop: 0, flexDirection: "row", gap: theme.spacing.md }}>
          <Button mode="outlined" icon="close" onPress={() => router.push("/(tabs)")} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button mode="contained" icon="check" onPress={openConfirmDialog} style={{ flex: 1 }}>
            Confirm
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    boxShadow: "0",
  },
  modalContent: {
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
});
