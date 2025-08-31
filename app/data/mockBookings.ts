// mockBookings.ts

import { interpreters } from './mockData';

export interface Profile {
  id: string;
  name: string;
  email: string;
  ageRange: "18-29" | "30-39" | "40-49" | "50-69" | "70+";
  gender: string;
  avgRating: number | null;
  location: string;
  photo: string;
}

export interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  hospitalName: string | null;
  meetingUrl: string | null;
  profile: Profile;
}

const createProfileFromInterpreter = (interpreter: typeof interpreters[0]): Profile => {
  let ageRange: Profile['ageRange'] = "30-39";
  if (interpreter.age >= 18 && interpreter.age <= 29) ageRange = "18-29";
  if (interpreter.age >= 40 && interpreter.age <= 49) ageRange = "40-49";
  if (interpreter.age >= 50 && interpreter.age <= 69) ageRange = "50-69";
  if (interpreter.age >= 70) ageRange = "70+";

  return {
    id: interpreter.id.toString(),
    name: interpreter.name,
    email: interpreter.email,
    ageRange: ageRange,
    gender: interpreter.gender,
    avgRating: interpreter.rating,
    location: "Kuala Lumpur",
    photo: interpreter.avatar,
  };
};

const createDate = (daysToAdd: number, hour: number, minute: number): Date => {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + daysToAdd);
  newDate.setHours(hour, minute, 0, 0);
  return newDate;
};

const createAppointmentTimestamps = (startDate: Date, durationMinutes: number): { startTime: string; endTime: string } => {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return {
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  };
};

const pastAppointment1 = createAppointmentTimestamps(createDate(-2, 10, 0), 45);
const pastAppointment2 = createAppointmentTimestamps(createDate(-4, 14, 0), 80);
const futureAppointment1 = createAppointmentTimestamps(createDate(2, 15, 0), 60);
const futureAppointment2 = createAppointmentTimestamps(createDate(4, 11, 30), 90);
const futureAppointment3 = createAppointmentTimestamps(new Date("2025-09-20T09:00:00"), 120);

export const appointments: Appointment[] = [
  {
    id: 1,
    startTime: pastAppointment1.startTime,
    endTime: pastAppointment1.endTime,
    status: "Completed",
    hospitalName: "Pantai Hospital Kuala Lumpur",
    meetingUrl: null,
    profile: createProfileFromInterpreter(interpreters[1]),
  },
  {
    id: 2,
    startTime: pastAppointment2.startTime,
    endTime: pastAppointment2.endTime,
    status: "Completed",
    hospitalName: "Sunway Medical Centre",
    meetingUrl: null,
    profile: createProfileFromInterpreter(interpreters[2]),
  },
  {
    id: 3,
    startTime: futureAppointment1.startTime,
    endTime: futureAppointment1.endTime,
    status: "Approved",
    hospitalName: "Gleneagles Hospital Kuala Lumpur",
    meetingUrl: null,
    profile: createProfileFromInterpreter(interpreters[0]),
  },
  {
    id: 4,
    startTime: futureAppointment2.startTime,
    endTime: futureAppointment2.endTime,
    status: "Pending",
    hospitalName: "Prince Court Medical Centre",
    meetingUrl: null,
    profile: createProfileFromInterpreter(interpreters[1]),
  },
  {
    id: 5,
    startTime: futureAppointment3.startTime,
    endTime: futureAppointment3.endTime,
    status: "Rejected",
    hospitalName: "Hospital Kuala Lumpur (HKL)",
    meetingUrl: null,
    profile: createProfileFromInterpreter(interpreters[2]),
  },
];