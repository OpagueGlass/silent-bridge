import { AgeRange, AGE_RANGE, Spec, Language, State } from "@/constants/data";
import { Appointment, Profile } from "./query";
import { Linking } from "react-native";
import { showAlert } from "./alert";

export const getAgeRangeFromDOB = (dateOfBirth: string): AgeRange => {
  const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
  if (age < 18) return AGE_RANGE[0];
  if (age < 30) return AGE_RANGE[1];
  if (age < 40) return AGE_RANGE[2];
  if (age < 50) return AGE_RANGE[3];
  if (age < 70) return AGE_RANGE[4];
  return AGE_RANGE[5];
};

export const getMinMaxDOB = (ageStart: number, ageEnd: number) => {
  const minDOB = new Date();
  minDOB.setFullYear(minDOB.getFullYear() - ageEnd - 1);
  const maxDOB = new Date();
  maxDOB.setFullYear(maxDOB.getFullYear() - ageStart);
  return { minDOB, maxDOB };
};

export const getDuration = (appointment: Appointment) => {
  const diffMs = new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const getDate = (appointment: { startTime: string }) => {
  const startTime = new Date(appointment.startTime);
  return startTime.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export const getStartTime = (appointment: { startTime: string }) => {
  const startTime = new Date(appointment.startTime);
  return startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};


export const getTimeRange = (appointment: { startTime: string; endTime: string }) => {
  const endTime = new Date(appointment.endTime);
  return `${getStartTime(appointment)} - ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

export const getMeetLink = async (providerToken: string, startTime: string, endTime: string, profile: Profile) => {
  // Use providerToken to create a Google Meet link via Google Calendar API
  const event = {
    summary: `Appointment with ${profile.name}`,
    start: { dateTime: startTime },
    end: { dateTime: endTime },
    conferenceData: {
      createRequest: { requestId: "unique-request-id" },
    },
    attendees: [{ email: profile.email }],
  };

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  const result = await response.json();
  const meetLink = result.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri;
  return meetLink;
};

