// app/data/mockBookings.ts

import { Tables } from '../../utils/database-types';
import { AGE_RANGE, AgeRange } from '@/constants/data';

const mockProfiles: Tables<'profile'>[] = [
  {
    id: '8f5a5c6e-c9aa-4461-821a-2ba5313f8c9a', // Interpreter 1
    name: 'John Smith',
    email: 'johnsmith@email.com',
    date_of_birth: '1995-05-20T00:00:00Z', // age: 30
    gender: 'Male',
    avg_rating: 4.8,
    location: 'Kuala Lumpur',
    photo: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 'f3d8a2d1-b3e1-4b8a-8b8e-3d9a1c2b3d4e', // Interpreter 2
    name: 'Sarah Johnson',
    email: 'sarahjohnson@email.com',
    date_of_birth: '2000-11-15T00:00:00Z', // age: 25
    gender: 'Female',
    avg_rating: 4.9,
    location: 'Penang',
    photo: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 'c1b2a3d4-e5f6-7890-1234-567890abcdef', // Interpreter 3
    name: 'Mike Chen',
    email: 'mikechen@email.com',
    date_of_birth: '1990-02-10T00:00:00Z', // age: 35
    gender: 'Male',
    avg_rating: 4.7,
    location: 'Johor',
    photo: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // A Deaf User
    name: 'Alice Wong',
    email: 'alice@email.com',
    date_of_birth: '1998-07-22T00:00:00Z',
    gender: 'Female',
    avg_rating: null,
    location: 'Kuala Lumpur',
    photo: '/placeholder.svg?height=80&width=80',
  },
];

// Helper function to get age range from date of birth string.
// This logic is similar to what's in `helper.ts`.
const getAgeRangeFromDOB = (dateOfBirth: string): AgeRange => {
    const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
    if (age < 18) return AGE_RANGE[0];
    if (age < 30) return AGE_RANGE[1];
    if (age < 40) return AGE_RANGE[2];
    if (age < 50) return AGE_RANGE[3];
    if (age < 70) return AGE_RANGE[4];
    return AGE_RANGE[5];
};

// This is the frontend-friendly Profile interface. It includes 'ageRange'.
// The raw database profile type is in `Tables<'profile'>`.
export interface Profile {
  id: string;
  name: string;
  email: string;
  ageRange: AgeRange;
  gender: string;
  avgRating: number | null;
  location: string;
  photo: string;
}

// This is the frontend-friendly Appointment interface.
// It embeds the full interpreter Profile object, which is what the UI needs.
export interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Completed' | 'Cancelled';
  hospitalName: string | null;
  meetingUrl: string | null;
  profile: Profile; // The interpreter's profile
}

// --- Data Assembly Logic ---
// This section simulates the database "joining" data together.

// 1. Raw appointment data, mimicking the 'appointment' table
const mockAppointmentsRaw: (Omit<Tables<'appointment'>, 'deaf_user_id' | 'status'> & { deaf_user_id: string, status: Appointment['status'] })[] = [
  {
    id: 1,
    deaf_user_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // Alice Wong
    interpreter_id: 'f3d8a2d1-b3e1-4b8a-8b8e-3d9a1c2b3d4e', // Sarah Johnson
    start_time: new Date('2025-08-30T10:00:00Z').toISOString(),
    end_time: new Date('2025-08-30T11:00:00Z').toISOString(),
    status: 'Completed',
    hospital_name: 'Pantai Hospital Kuala Lumpur',
    meeting_url: null,
  },
  {
    id: 2,
    deaf_user_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // Alice Wong
    interpreter_id: 'c1b2a3d4-e5f6-7890-1234-567890abcdef', // Mike Chen
    start_time: new Date('2025-08-28T14:00:00Z').toISOString(),
    end_time: new Date('2025-08-28T15:30:00Z').toISOString(),
    status: 'Completed',
    hospital_name: 'Sunway Medical Centre',
    meeting_url: null,
  },
  {
    id: 3,
    deaf_user_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // Alice Wong
    interpreter_id: '8f5a5c6e-c9aa-4461-821a-2ba5313f8c9a', // John Smith
    start_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    end_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    status: 'Approved',
    hospital_name: 'Gleneagles Hospital Kuala Lumpur',
    meeting_url: null,
  },
  {
    id: 4,
    deaf_user_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // Alice Wong
    interpreter_id: 'f3d8a2d1-b3e1-4b8a-8b8e-3d9a1c2b3d4e', // Sarah Johnson
    start_time: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
    end_time: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
    status: 'Pending',
    hospital_name: 'Prince Court Medical Centre',
    meeting_url: null,
  },
  {
    id: 5,
    deaf_user_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // Alice Wong
    interpreter_id: 'c1b2a3d4-e5f6-7890-1234-567890abcdef', // Mike Chen
    start_time: new Date('2025-09-20T09:00:00Z').toISOString(),
    end_time: new Date('2025-09-20T11:00:00Z').toISOString(),
    status: 'Rejected',
    hospital_name: 'Hospital Kuala Lumpur (HKL)',
    meeting_url: null,
  },
];

// 2. Assemble the final `appointments` array for the UI
export const appointments: Appointment[] = mockAppointmentsRaw.map(app => {
  const interpreterProfileRaw = mockProfiles.find(p => p.id === app.interpreter_id);

  if (!interpreterProfileRaw) {
    // In a real app, you'd handle this error case.
    // Here, we'll throw an error if the mock data is inconsistent.
    throw new Error(`Interpreter profile not found for ID: ${app.interpreter_id}`);
  }

  // Convert the raw profile from the "database" into the frontend-friendly format
  const interpreterProfile: Profile = {
    id: interpreterProfileRaw.id,
    name: interpreterProfileRaw.name,
    email: interpreterProfileRaw.email,
    gender: interpreterProfileRaw.gender,
    location: interpreterProfileRaw.location,
    photo: interpreterProfileRaw.photo,
    
    // Explicitly map snake_case from raw data to camelCase for the frontend interface.
    avgRating: interpreterProfileRaw.avg_rating,
    
    // Calculate the derived 'ageRange' property.
    ageRange: getAgeRangeFromDOB(interpreterProfileRaw.date_of_birth),
  };

  return {
    id: app.id,
    startTime: app.start_time,
    endTime: app.end_time,
    status: app.status,
    hospitalName: app.hospital_name,
    meetingUrl: app.meeting_url,
    profile: interpreterProfile,
  };
});