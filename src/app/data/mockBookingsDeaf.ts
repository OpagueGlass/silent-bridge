// app/data/mockBookingDeaf.ts

import { AGE_RANGE, AgeRange } from '@/constants/data';
import { Tables } from '../../utils/database-types';

// 1. Mock profiles, including several deaf users (clients)
const mockProfiles: Tables<'profile'>[] = [
  {
    id: '8f5a5c6e-c9aa-4461-821a-2ba5313f8c9a', // Interpreter John Smith
    name: 'John Smith',
    email: 'johnsmith@email.com',
    date_of_birth: '1995-05-20T00:00:00Z',
    gender: 'Male',
    avg_rating: 4.8,
    location: 'Kuala Lumpur',
    photo: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // Client Alice Wong
    name: 'Alice Wong',
    email: 'alice@email.com',
    date_of_birth: '1998-07-22T00:00:00Z',
    gender: 'Female',
    avg_rating: 4.5,
    location: 'Kuala Lumpur',
    photo: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', // Client David Lee
    name: 'David Lee',
    email: 'david@email.com',
    date_of_birth: '1985-03-12T00:00:00Z',
    gender: 'Male',
    avg_rating: 4.9,
    location: 'Selangor',
    photo: '/placeholder.svg?height=80&width=80',
  },
];

// 2. Mock appointments that these requests will be linked to
const mockAppointmentsForRequests: (Tables<'appointment'> & { status: 'Pending' | 'Approved' | 'Completed' | 'Rejected' | 'Cancelled' })[] = [
  {
    id: 101,
    deaf_user_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // Alice Wong
    interpreter_id: null,
    start_time: new Date('2025-09-25T10:00:00Z').toISOString(),
    end_time: new Date('2025-09-25T11:00:00Z').toISOString(),
    status: 'Pending',
    hospital_name: 'Sunway Medical Centre',
    meeting_url: null,
  },
  {
    id: 102,
    deaf_user_id: 'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', // David Lee
    interpreter_id: '8f5a5c6e-c9aa-4461-821a-2ba5313f8c9a',
    start_time: new Date('2025-08-12T14:00:00Z').toISOString(),
    end_time: new Date('2025-08-12T15:30:00Z').toISOString(),
    status: 'Completed',
    hospital_name: 'Prince Court Medical Centre',
    meeting_url: null,
  },
  {
    id: 103,
    deaf_user_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // Alice Wong
    interpreter_id: '8f5a5c6e-c9aa-4461-821a-2ba5313f8c9a',
    start_time: new Date('2025-09-20T10:00:00Z').toISOString(),
    end_time: new Date('2025-09-20T11:00:00Z').toISOString(),
    status: 'Approved',
    hospital_name: 'Pantai Hospital',
    meeting_url: null,
  },
];

// 3. Mock requests made to a specific interpreter
const mockRequestsRaw: Tables<'request'>[] = [
  {
    id: 201,
    appointment_id: 101, // For Alice Wong's appointment
    interpreter_id: '8f5a5c6e-c9aa-4461-821a-2ba5313f8c9a', // To John Smith
    is_accepted: null, // This means it's a PENDING request
    is_expired: false,
    note: 'The client needs assistance with a cardiology consultation. Please be prepared for medical terminology.',
  },
  {
    id: 202,
    appointment_id: 102, // For David Lee's appointment
    interpreter_id: '8f5a5c6e-c9aa-4461-821a-2ba5313f8c9a', // To John Smith
    is_accepted: true, 
    is_expired: false,
    note: 'General check-up for Mr. David Lee.',
  },
  {
    id: 203,
    appointment_id: 103, // For Alice Wong's 'Approved' appointment
    interpreter_id: '8f5a5c6e-c9aa-4461-821a-2ba5313f8c9a', // To John Smith
    is_accepted: true,
    is_expired: false,
    note: 'Follow-up consultation regarding neurology results.',
  },
];

// --- FRONTEND-FRIENDLY INTERFACES ---
// Helper interface for Profile, similar to the one in mockBookings.ts
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

// This is the primary interface for the Interpreter's request list UI.
// It contains all the necessary nested information.
export interface PopulatedRequest {
  requestId: number;
  note: string | null;
  isAccepted: boolean | null; // The direct status of the request
  appointment: {
    id: number;
    startTime: string;
    endTime: string;
    hospitalName: string | null;
    status: 'Pending' | 'Approved' | 'Completed' | 'Rejected' | 'Cancelled';
    clientProfile: Profile; // The profile of the deaf user (client)
  };
}

// --- DATA ASSEMBLY LOGIC ---

const getAgeRangeFromDOB = (dateOfBirth: string): AgeRange => {
  const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
  if (age < 18) return AGE_RANGE[0];
  if (age < 30) return AGE_RANGE[1];
  if (age < 40) return AGE_RANGE[2];
  if (age < 50) return AGE_RANGE[3];
  if (age < 70) return AGE_RANGE[4];
  return AGE_RANGE[5];
};

// This function assembles the final data structure needed by the UI
export const requests: PopulatedRequest[] = mockRequestsRaw.map(req => {
  const appointmentRaw = mockAppointmentsForRequests.find(app => app.id === req.appointment_id);
  if (!appointmentRaw) {
    throw new Error(`Appointment not found for request ID: ${req.id}`);
  }

  const clientProfileRaw = mockProfiles.find(p => p.id === appointmentRaw.deaf_user_id);
  if (!clientProfileRaw) {
    throw new Error(`Client profile not found for appointment ID: ${appointmentRaw.id}`);
  }

  // Convert raw client profile to frontend-friendly Profile format
  const clientProfile: Profile = {
    ...clientProfileRaw,
    // Map snake_case to camelCase
    avgRating: clientProfileRaw.avg_rating,
    // Calculate derived property
    ageRange: getAgeRangeFromDOB(clientProfileRaw.date_of_birth),
  };

  return {
    requestId: req.id,
    note: req.note,
    isAccepted: req.is_accepted,
    appointment: {
      id: appointmentRaw.id,
      startTime: appointmentRaw.start_time,
      endTime: appointmentRaw.end_time,
      hospitalName: appointmentRaw.hospital_name,
      status: appointmentRaw.status,
      clientProfile: clientProfile,
    },
  };
});