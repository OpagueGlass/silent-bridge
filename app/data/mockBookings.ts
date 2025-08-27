import { interpreters } from './mockData';

export interface Appointment {
  id: number;
  date: string;
  time: string; 
  duration?: string;
  status: "Completed" | "Approved" | "Pending" | "Rejected" | "Cancelled";
  interpreter: typeof interpreters[0];
}

const today = new Date();
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const twoDaysFromNow = new Date(today);
twoDaysFromNow.setDate(today.getDate() + 2);

const fourDaysFromNow = new Date(today);
fourDaysFromNow.setDate(today.getDate() + 4);

const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

const fourDaysAgo = new Date(today);
fourDaysAgo.setDate(today.getDate() - 4);

export const appointments: Appointment[] = [
  {
    id: 1,
    date: formatDate(twoDaysAgo),
    time: "10:00",
    duration: "45 min",
    status: "Completed",
    interpreter: interpreters[1], // Sarah Johnson
  },
  {
    id: 2,
    date: formatDate(fourDaysAgo),
    time: "14:00",
    duration: "1h 20min",
    status: "Completed",
    interpreter: interpreters[2], // Mike Chen
  },
  {
    id: 3,
    date: formatDate(twoDaysFromNow), 
    time: "15:00",
    status: "Approved",
    interpreter: interpreters[0], // John Smith
  },
  {
    id: 4,
    date: formatDate(fourDaysFromNow), 
    time: "11:30",
    status: "Pending",
    interpreter: interpreters[1], // Sarah Johnson
  },
  {
    id: 5,
    // date: "2025-08-20", // date before today
    // date: "2025-08-29", // date to show sort
    date: "2025-09-20", // date after today
    time: "09:00",
    status: "Rejected",
    interpreter: interpreters[2], // Mike Chen
  },
];