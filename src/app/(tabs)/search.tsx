"use client";

import ResultCard from "@/components/cards/ResultCard";
import DatePickerInput, { getValidRange } from "@/components/inputs/DatePickerInput";
import LabelledInput from "@/components/inputs/LabelledInput";
import RatingInput from "@/components/inputs/RatingInput";
import TimePickerInput from "@/components/inputs/TimePickerInput";
import Gradient from "@/components/ui/Gradient";
import { LANGUAGES, SPECIALISATION } from "@/constants/data";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDisclosure } from "@/hooks/useDisclosure";
import { InterpreterResults, Profile, searchInterpreters } from "@/utils/query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, Redirect } from "expo-router";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  SegmentedButtons,
  Text,
} from "react-native-paper";
import LabelledDropdownInput from "@/components/inputs/DropdownInput";
import WarningDialog from "@/components/modals/WarningDialog";
import { useAuth } from "@/contexts/AuthContext";

const durationOptions = ["00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00"];
const ageRangeOptions = [
  { value: "Any", label: "Any", ageStart: 0, ageEnd: 100 },
  { value: "18-24", label: "18 – 24", ageStart: 18, ageEnd: 24 },
  { value: "25-44", label: "25 – 44", ageStart: 25, ageEnd: 44 },
  { value: "45-60", label: "45 – 60", ageStart: 45, ageEnd: 60 },
];

interface SearchParams {
  duration: number;
  selectedLanguage: number;
  selectedSpecialisation: number;
  selectedGender: string;
  ageRange: number;
  minRating: number;
}

const defaultParams = {
  duration: 0,
  selectedLanguage: 0,
  selectedSpecialisation: 7,
  selectedGender: "Any",
  ageRange: 0,
  minRating: 0,
} as SearchParams;

function handleSearch(
  profile: Profile | null,
  date: Date | undefined,
  time: { hours: number | undefined; minutes: number | undefined },
  searchParams: SearchParams,
  onDismiss: () => void,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setValidationError: Dispatch<SetStateAction<{ title: string; message: string } | null>>,
  setHasSearched: Dispatch<SetStateAction<boolean>>,
  setDisplayedInterpreters: Dispatch<SetStateAction<InterpreterResults[]>>
) {
  const { duration, selectedLanguage, selectedSpecialisation, selectedGender, ageRange, minRating } = searchParams;
  if (!date) {
    setValidationError({ title: "Invalid Date", message: "Please select an appointment date." });
    return;
  }
  if (time.hours === undefined || time.minutes === undefined) {
    setValidationError({ title: "Invalid Time", message: "Please select an appointment time." });
    return;
  }

  const startTime = new Date(date);
  startTime.setHours(time.hours, time.minutes);
  const endTime = new Date(startTime.getTime() + (duration + 1) * 15 * 60000);
  const { ageStart, ageEnd } = ageRangeOptions[ageRange];

  AsyncStorage.setItem(
    "appointmentDetails",
    JSON.stringify({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      id: null,
      deaf_user_id: profile!.id,
      hospital_name: null,
    })
  );
  setLoading(true);
  setHasSearched(true);
  searchInterpreters(
    selectedSpecialisation + 1,
    selectedLanguage + 1,
    profile!.location,
    ageStart,
    ageEnd,
    startTime,
    endTime,
    minRating,
    selectedGender === "Any" ? null : selectedGender
  ).then((results) => {
    setDisplayedInterpreters(results);
  });
  setLoading(false);
  onDismiss();
}

function SearchModal({
  profile,
  setLoading,
  setHasSearched,
  setSearchResults,
  visible,
  onDismiss,
}: {
  profile: Profile | null;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setHasSearched: Dispatch<SetStateAction<boolean>>;
  setSearchResults: Dispatch<SetStateAction<InterpreterResults[]>>;
  visible: boolean;
  onDismiss: () => void;
}) {
  const theme = useAppTheme();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<{ hours: number | undefined; minutes: number | undefined }>({
    hours: undefined,
    minutes: undefined,
  });
  const [searchParams, setSearchParams] = useState(defaultParams);
  const [validationError, setValidationError] = useState<{ title: string; message: string } | null>(null);

  const handleClear = () => {
    setDate(undefined);
    setTime({ hours: undefined, minutes: undefined });
    setSearchParams(defaultParams);
  };

  return (
    <>
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: "bold" }}>
                Interpreter Discovery
              </Text>
              <IconButton icon="close" size={24} onPress={onDismiss} iconColor={theme.colors.onSurface} />
            </View>
            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                <LabelledInput label="Date" style={{ flex: 1 }}>
                  <DatePickerInput date={date} setDate={(date) => setDate(date)} validRange={getValidRange()} />
                </LabelledInput>
                <LabelledInput label="Time" style={{ flex: 1 }}>
                  <TimePickerInput time={time} setTime={setTime} />
                </LabelledInput>
              </View>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                <LabelledDropdownInput
                  label="Duration"
                  container={durationOptions}
                  option={searchParams.duration}
                  setOption={(option) => setSearchParams({ ...searchParams, duration: option })}
                  style={{ flex: 1 }}
                />
                <LabelledDropdownInput
                  label="Doctor's Language"
                  container={LANGUAGES}
                  option={searchParams.selectedLanguage}
                  setOption={(option) => setSearchParams({ ...searchParams, selectedLanguage: option })}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={{ marginBottom: 12 }}>
                <LabelledDropdownInput
                  label="Specialisation"
                  container={SPECIALISATION}
                  option={searchParams.selectedSpecialisation}
                  setOption={(option) => setSearchParams({ ...searchParams, selectedSpecialisation: option })}
                />
              </View>

              <LabelledInput label="Gender" style={{ marginBottom: 12 }}>
                <SegmentedButtons
                  value={searchParams.selectedGender}
                  onValueChange={(value) => setSearchParams({ ...searchParams, selectedGender: value })}
                  buttons={[
                    { value: "Any", label: "Any", icon: "account-group" },
                    { value: "Male", label: "Male", icon: "face-man" },
                    { value: "Female", label: "Female", icon: "face-woman" },
                  ]}
                />
              </LabelledInput>
              <LabelledInput label="Age Range" style={{ marginBottom: 12 }}>
                <SegmentedButtons
                  value={ageRangeOptions[searchParams.ageRange].value}
                  onValueChange={(value) => {
                    const index = ageRangeOptions.findIndex((option) => option.value === value);
                    setSearchParams({ ...searchParams, ageRange: index });
                  }}
                  buttons={ageRangeOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </LabelledInput>

              <LabelledInput label="Rating" style={{ marginBottom: 16 }}>
                <RatingInput
                  rating={searchParams.minRating}
                  onChange={(rating: number) => setSearchParams({ ...searchParams, minRating: rating })}
                />
              </LabelledInput>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button mode="outlined" icon="close" onPress={handleClear} style={{ flex: 1 }}>
                  Clear
                </Button>
                <Button
                  mode="contained"
                  icon="magnify"
                  onPress={() =>
                    handleSearch(
                      profile,
                      date,
                      time,
                      searchParams,
                      onDismiss,
                      setLoading,
                      setValidationError,
                      setHasSearched,
                      setSearchResults
                    )
                  }
                  style={{ flex: 1 }}
                >
                  Search
                </Button>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </Portal>
      <WarningDialog
        visible={validationError !== null}
        title={validationError?.title || ""}
        message={validationError?.message || ""}
        onDismiss={() => setValidationError(null)}
        onConfirm={() => {
          setValidationError(null);
        }}
      />
    </>
  );
}

function SearchResults({
  loading,
  hasSearched,
  searchResults,
}: {
  loading: boolean;
  hasSearched: boolean;
  searchResults: InterpreterResults[];
}) {
  const theme = useAppTheme();

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (hasSearched) {
    if (searchResults.length > 0) {
      return (
        <View style={{ paddingTop: 16}}>
          {searchResults.map((interpreterResult) => ResultCard({ interpreterResult }))}
        </View>
      );
    } else {
      return (
        <Text style={{ textAlign: "center", color: theme.colors.onSurface, marginTop: 40 }}>
          No interpreters found matching your criteria.
        </Text>
      );
    }
  }
  return null;
}

export default function SearchScreen() {
  const theme = useAppTheme();
  const { profile, isInterpreter } = useAuth();

  if (isInterpreter) {
    return <Redirect href="/" />;
  }

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<InterpreterResults[]>([]);
  const { isOpen, open, close } = useDisclosure(false);

  useFocusEffect(
    useCallback(() => {
      const checkAndRefresh = async () => {
        const quickSearch = await AsyncStorage.getItem("quickSearch");
        if (quickSearch === "true") {
          await AsyncStorage.removeItem("quickSearch");
          open();
        }
      };
      checkAndRefresh();
    }, [open])
  );

  return (
    <ScrollView style={{ backgroundColor: theme.colors.elevation.level1 }}>
      <Gradient style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={open} style={{ flex: 1 }}>
            <Searchbar value={""} placeholder="Search interpreters" style={styles.searchbar} pointerEvents="none" />
          </TouchableOpacity>
        </View>
      </Gradient>

      <SearchModal
        profile={profile}
        setLoading={setLoading}
        setHasSearched={setHasSearched}
        setSearchResults={setSearchResults}
        visible={isOpen}
        onDismiss={close}
      />

      <SearchResults loading={loading} hasSearched={hasSearched} searchResults={searchResults} />
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
  },
  searchbar: {
    marginHorizontal: 12,
    borderRadius: 12,
  },
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
    paddingTop: 5,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
