"use client";

import DatePickerInput from "@/components/inputs/DatePickerInput";
import TimePickerInput from "@/components/inputs/TimePickerInput";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { LANGUAGES, SPECIALISATION } from "@/constants/data";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getStartTime, getDuration, getMeetLink } from "@/utils/helper";
import {
  addAppointmentMeetingURL,
  getRequests,
  initiateChat,
  InterpreterProfile,
  Profile,
  Request,
  searchInterpreters,
  updateRequest,
} from "@/utils/query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, MD3Theme, Menu, Text, TextInput } from "react-native-paper";
import { showConfirmAlert, showValidationError } from "../../utils/alert";
import LabelledInput from "@/components/inputs/LabelledInput";
import SearchScreen from "@/components/sections/SearchScreen";
import RequestScreen from "@/components/sections/RequestScreen";


export default function Discovery() {
  const { isInterpreter, profile, getValidProviderToken } = useAuth();

  if (!isInterpreter) {
    return <SearchScreen profile={profile} />
  } else {
    return <RequestScreen profile={profile} getToken={getValidProviderToken} />;
  }

}

