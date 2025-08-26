import { requests as rawRequests } from './mockDataDeaf';

export interface InterpreterRequest {
  id: number;
  clientName: string;
  clientEmail: string; 
  date: string;
  time: string;
  duration: string;
  type: string;
  location: string;
  status: "Completed" | "Approved" | "Pending" | "Rejected";
  doctorLanguage?: string; 
}

const convertDate = (dateStr: string): string => {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export const interpreterAppointments: InterpreterRequest[] = rawRequests.map((request, index) => {
  let status: InterpreterRequest['status'] = 'Pending';
  let date = request.date;
  let doctorLanguage: string | undefined = undefined;

  if (index === 0) {
    status = "Approved";
    doctorLanguage = "English";
  }
  if (index === 1) {
    status = "Completed";
    date = "12/08/2025";
    doctorLanguage = "Mandarin";
  }

  return {
    id: request.id,
    clientName: request.name,
    clientEmail: `${request.name.split(' ')[0].toLowerCase()}@email.com`,
    date: convertDate(date),
    time: request.time.split(' - ')[0],
    duration: request.time,
    type: request.type,
    location: request.location,
    status: status,
    doctorLanguage: doctorLanguage,
  };
});
