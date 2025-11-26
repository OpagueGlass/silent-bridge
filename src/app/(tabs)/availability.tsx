
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { showError, showSuccess, showValidationError } from "@/utils/alert";
import { deleteAvailability, getAvailability, setAvailability } from "@/utils/query";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { ActivityIndicator, Button, Card, IconButton, MD3Theme, Modal, Portal, Text } from "react-native-paper";
import TimePickerInput from "@/components/inputs/TimePickerInput";

type WeeklyAvailability = {
  day_id: number;
  start_time: string;
  end_time: string;
};

const daysOfWeek = [
  { label: "Mon", id: 1 }, { label: "Tue", id: 2 },
  { label: "Wed", id: 3 }, { label: "Thu", id: 4 }, { label: "Fri", id: 5 },
  { label: "Sat", id: 6 }, { label: "Sun", id: 7 }
];

export default function ManageAvailabilityScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { profile } = useAuth();
  const router = useRouter();

  // Data from database
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Modal state (popup when click a day)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{date: string, dayOfWeek: string, dayId: number, startTime: string, endTime: string} | null>(null);

  // Edit modal state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStartTime, setEditStartTime] = useState("09:00");
  const [editEndTime, setEditEndTime] = useState("17:00");

  // Form inputs - Weekly schedule
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  
  // Fetch existing availability from Supabase
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!profile?.id) return;
      try {
        const data = await getAvailability(profile.id);
        setWeeklyAvailability(data);
      } catch (error) {
        showError("Could not load existing availability.");
      }
    };
    fetchAvailability();
  }, [profile?.id]);
  
  // Calculate which dates to mark (highlight) on calendar
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    const availabilityMap = new Map(weeklyAvailability.map(item => [item.day_id, {startTime: item.start_time, endTime: item.end_time}]));
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const date = new Date(dateString + 'T12:00:00');
      const jsDay = date.getDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;
      
      if (availabilityMap.has(dayOfWeek)) {
        marks[dateString] = {
          color: theme.colors.secondary,
          startingDay: true,
          endingDay: true,
          textColor: theme.colors.onPrimaryContainer,
        };
      }
    }
    return marks;
  }, [weeklyAvailability, currentMonth, theme.colors]);

  // When user clicks a day on calendar
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);

    const date = new Date(day.timestamp);
    const dayOfWeek = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
    const availabilityForDay = weeklyAvailability.find(a => a.day_id === dayOfWeek);

    if (availabilityForDay) {
        const startTimeFormatted = availabilityForDay.start_time.substring(0, 5);
        const endTimeFormatted = availabilityForDay.end_time.substring(0, 5);
        
        setSelectedDayInfo({
            date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
            dayId: dayOfWeek,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
        });
        setEditStartTime(startTimeFormatted);
        setEditEndTime(endTimeFormatted);
        setIsEditMode(false);
        setIsModalVisible(true);
    } else {
        setSelectedDayInfo(null);
    }
  };
  
  // Toggle day selection (Mon, Tue, etc.)
  const handleDayToggle = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  };

  // Delete availability for a specific day
  const handleDeleteAvailability = async () => {
    if (!profile?.id || !selectedDayInfo) return;
    
    setIsLoading(true);
    try {
      await deleteAvailability(profile.id, selectedDayInfo.dayId);
      showSuccess("Availability removed");
      const data = await getAvailability(profile.id);
      setWeeklyAvailability(data);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to delete availability:", error);
      showError("An error occurred while deleting availability.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update availability for a specific day
  const handleUpdateAvailability = async () => {
    if (!profile?.id || !selectedDayInfo) return;
    
    setIsLoading(true);
    try {
      await setAvailability(profile.id, selectedDayInfo.dayId, `${editStartTime}:00`, `${editEndTime}:00`);
      showSuccess("Availability updated");
      const data = await getAvailability(profile.id);
      setWeeklyAvailability(data);
      setIsEditMode(false);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to update availability:", error);
      showError("An error occurred while updating availability.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save availability to database
  const handleApplyAvailability = async () => {
    if (!profile?.id) {
        showError("You must be logged in to set availability.");
        return;
      }
      if (selectedDays.length === 0) {
        showValidationError("Please select at least one day to repeat on.");
        return;
      }
  
      setIsLoading(true);
      try {
        const updatePromises = selectedDays.map((dayId) =>
          setAvailability(profile.id, dayId, `${startTime}:00`, `${endTime}:00`)
        );
        await Promise.all(updatePromises);
        showSuccess("Availability updated");
        const data = await getAvailability(profile.id);
        setWeeklyAvailability(data);
        setSelectedDays([]);
      } catch (error) {
        console.error("Failed to set availability:", error);
        showError("An error occurred while saving your availability.");
      } finally {
        setIsLoading(false);
      }
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Manage Availability",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: { color: theme.colors.onPrimary },
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onPrimary}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            onMonthChange={(month) => setCurrentMonth(new Date(month.timestamp))}
            markingType={"period"}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.onSurfaceVariant,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.onPrimary,
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.onSurface,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.onSurface,
            }}
            style={styles.calendar}
          />
        </View>

        <View style={styles.card}>
            <View style={styles.cardSection}>
                <Text style={styles.label}>Repeat on</Text>
                <View style={styles.dayToggleContainer}>
                {daysOfWeek.map(({ label, id }) => {
                    const isSelected = selectedDays.includes(id);
                    return (
                    <TouchableOpacity
                        key={id}
                        style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                        onPress={() => handleDayToggle(id)}
                    >
                        <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                        {label}
                        </Text>
                    </TouchableOpacity>
                    );
                })}
                </View>
            </View>
            <View style={styles.cardSection}>
                <View style={styles.timePickerRow}>
                  <View style={styles.timePickerWrapper}>
                      <Text style={styles.label}>Start time</Text>
                      <TimePickerInput label="" value={startTime} onChange={setStartTime} />
                  </View>
                  <View style={styles.timePickerWrapper}>
                      <Text style={styles.label}>End time</Text>
                      <TimePickerInput label="" value={endTime} onChange={setEndTime} />
                  </View>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                {isLoading ? (
                <ActivityIndicator />
                ) : (
                <>
                    <Button mode="contained" onPress={handleApplyAvailability} style={styles.applyButton}>
                    Apply Availability
                    </Button>
                </>
                )}
            </View>
            <Text style={styles.infoText}>
                Your selection repeats every chosen weekday from today forward.
            </Text>
        </View>
      </ScrollView>

      <Portal>
        <Modal visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Title
              title={selectedDayInfo?.date}
              subtitle={selectedDayInfo?.dayOfWeek}
              titleStyle={styles.modalTitle}
              right={(props) => (
                <IconButton
                  icon={isEditMode ? "close" : "pencil"}
                  onPress={() => setIsEditMode(!isEditMode)}
                />
              )}
            />
            <Card.Content>
              {isEditMode ? (
                <View>
                  <View style={styles.modalTimePickerRow}>
                    <View style={styles.modalTimePickerWrapper}>
                      <Text style={styles.modalLabel}>Start time</Text>
                      <TimePickerInput label="" value={editStartTime} onChange={setEditStartTime} />
                    </View>
                    <View style={styles.modalTimePickerWrapper}>
                      <Text style={styles.modalLabel}>End time</Text>
                      <TimePickerInput label="" value={editEndTime} onChange={setEditEndTime} />
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.modalTimeContainer}>
                  <Text variant="bodyLarge" style={styles.modalTimeText}>
                    {selectedDayInfo?.startTime} - {selectedDayInfo?.endTime}
                  </Text>
                </View>
              )}
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
              {isEditMode ? (
                <>
                  <Button 
                    mode="outlined" 
                    onPress={() => setIsEditMode(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleUpdateAvailability}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    mode="outlined" 
                    textColor={theme.colors.error}
                    onPress={handleDeleteAvailability}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                  <Button onPress={() => setIsModalVisible(false)}>Close</Button>
                </>
              )}
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      marginHorizontal: 20,
      marginBottom: 20,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness * 2,
    },
    calendar: {
      borderRadius: theme.roundness * 2,
      overflow: "hidden",
      marginBottom: 20, 
    },
    section: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        maxWidth: 400,
        padding: 8,
    },
    modalTitle: {
        fontWeight: 'bold',
    },
    modalTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surfaceVariant,
        padding: 12,
        borderRadius: theme.roundness,
        marginTop: 8,
    },
    modalTimeText: {
        fontWeight: '500',
    },
    modalTimePickerRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    modalTimePickerWrapper: {
        flex: 1,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: theme.colors.onSurface,
    },
    modalActions: {
        justifyContent: 'flex-end',
        paddingHorizontal: 8,
    },
    cardSection: {
        marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
      color: theme.colors.onSurface,
    },
    dayToggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      dayButton: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: theme.roundness,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        alignItems: "center",
        justifyContent: "center",
      },
      dayButtonSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      dayButtonText: {
        color: theme.colors.onSurfaceVariant,
      },
      dayButtonTextSelected: {
        color: theme.colors.onPrimary,
        fontWeight: "bold",
      },
      timePickerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
      },
      timePickerWrapper: {
        flex: 1,
      },
      buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 8,
      },
      applyButton: {
        marginRight: 8,
      },
      infoText: {
        marginTop: 24,
        textAlign: "center",
        color: theme.colors.onSurfaceVariant,
        fontSize: 12,
      },
  });