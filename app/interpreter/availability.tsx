import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getAvailability, setAvailability } from "@/utils/query";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Card, MD3Theme, Modal, Portal, Text } from "react-native-paper";
import { Calendar, DateData } from "react-native-calendars";
import TimePickerInput from "../../components/TimePickerInput";
import DatePickerInput from "../../components/DatePickerInput"; 
import { showError, showSuccess, showValidationError } from "@/utils/alert";

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

const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Every time the screen needs to update or re-render (like when click a button), the entire function runs again
export default function ManageAvailabilityScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { profile } = useAuth();

  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>([]);
  // Which month the calendar is currently displaying
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Which single day the user has tapped on
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // To display (popups) the details of the day that clicked
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{date: string, dayOfWeek: string, startTime: string, endTime: string} | null>(null);
  
  // Fetch existing availability from Supabase and save it to state
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!profile?.id) return;
      try {
        const data = await getAvailability(profile.id);
        // Saves the get data to the component's official memory
        setWeeklyAvailability(data);
      } catch (error) {
        showError("Could not load existing availability.");
      }
    };
    fetchAvailability();
  }, [profile?.id]);
  
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
  }, [weeklyAvailability, currentMonth, selectedDate, theme.colors]);

  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(new Date(new Date().setDate(new Date().getDate() + 30))));
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isLoading, setIsLoading] = useState(false);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);

    const date = new Date(day.timestamp);
    const dayOfWeek = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
    const availabilityForDay = weeklyAvailability.find(a => a.day_id === dayOfWeek);

    if (availabilityForDay) {
        setSelectedDayInfo({
            date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
            startTime: availabilityForDay.start_time.substring(0, 5),
            endTime: availabilityForDay.end_time.substring(0, 5),
        });
        setIsModalVisible(true);
    } else {
        setSelectedDayInfo(null);
    }
  };
  
  const handleDayToggle = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  };

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
        showSuccess("Availability Updated");
        const data = await getAvailability(profile.id);
        setWeeklyAvailability(data);
      } catch (error) {
        console.error("Failed to set availability:", error);
        showError("An error occurred while saving your availability. Please try again.");
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
                <View style={styles.datePickerRow}>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.label}>Start date</Text>
                        <DatePickerInput label="" value={startDate} onChange={setStartDate} />
                    </View>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.label}>Valid until</Text>
                        <DatePickerInput label="" value={endDate} onChange={setEndDate} />
                    </View>
                </View>
            </View>

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
            />
            <Card.Content>
              <View style={styles.modalTimeContainer}>
                <Text variant="bodyLarge" style={styles.modalTimeText}>
                  {selectedDayInfo?.startTime} - {selectedDayInfo?.endTime}
                </Text>
                <Text style={styles.modalChip}>Weekly</Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setIsModalVisible(false)}>OK</Button>
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
    datePickerRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    datePickerWrapper: {
        flex: 1,
    },
    datePresetRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    datePresetButton: {
        flex: 1,
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
    modalChip: {
        backgroundColor: theme.colors.primaryContainer,
        color: theme.colors.onPrimaryContainer,
        borderRadius: theme.roundness,
        paddingHorizontal: 8,
        paddingVertical: 4,
        fontSize: 12,
        overflow: 'hidden',
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