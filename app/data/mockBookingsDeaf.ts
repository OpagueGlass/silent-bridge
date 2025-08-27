export interface InterpreterRequest {
  id: number;
  clientName: string;
  clientEmail: string; 
  date: string;
  time: string;
  duration: string;
  location: string;
  status: "Completed" | "Approved" | "Pending" | "Rejected" | "Cancelled";
  doctorLanguage?: string; 
}

export const interpreterAppointments: InterpreterRequest[] = [
  {
    id: 1,
    clientName: "Alice Wong",
    clientEmail: "alice@email.com",
    date: "2025-09-20",
    time: "10:00",
    duration: "60 min",
    location: "Sunway Medical Centre",
    status: "Approved",
    doctorLanguage: "English",
  },
  {
    id: 2,
    clientName: "David Lee",
    clientEmail: "david@email.com",
    date: "2025-08-12",
    time: "14:00",
    duration: "1h 30min",
    location: "Lee Hishammuddin Allen & Gledhill",
    status: "Completed",
    doctorLanguage: "Mandarin",
  },
  {
    id: 3,
    clientName: "Siti Nurhaliza",
    clientEmail: "siti@email.com",
    date: "2025-09-02",
    time: "11:00",
    duration: "45 min",
    location: "Jabatan Imigresen Malaysia, Mont Kiara",
    status: "Pending",
  },
  {
    id: 4,
    clientName: "Rajesh Kumar",
    clientEmail: "rajesh@email.com",
    date: "2025-09-10",
    time: "15:00",
    duration: "2h",
    location: "KLCC Convention Centre, Meeting Room 5",
    status: "Rejected",
  },
  {
    id: 5,
    clientName: "Tan Wei Ling",
    clientEmail: "weiling@email.com",
    date: "2025-08-05",
    time: "16:00",
    duration: "30 min",
    location: "International School of Kuala Lumpur (ISKL)",
    status: "Completed",
  },
  {
    id: 6,
    clientName: "Ahmad Faizal",
    clientEmail: "ahmad@email.com",
    date: "2025-08-29",
    time: "09:30",
    duration: "1h 15min",
    location: "Gleneagles Hospital Kuala Lumpur",
    status: "Approved",
    doctorLanguage: "English",
  }
];