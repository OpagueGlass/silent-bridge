// utils/helper.ts

import { supabase } from './supabase';
import { showError, showSuccess } from './alert';
import { AgeRange, AGE_RANGE, Spec, Language, State } from "@/constants/data";

export const getMinMaxDOB = (ageStart: number, ageEnd: number) => {
  const minDOB = new Date();
  minDOB.setFullYear(minDOB.getFullYear() - ageEnd - 1);
  const maxDOB = new Date();
  maxDOB.setFullYear(maxDOB.getFullYear() - ageStart);
  return { minDOB, maxDOB };
};

export const searchInterpreters = async (
  spec: Spec,
  language: string,
  state: string,
  ageStart: number,
  ageEnd: number,
  gender: string | null = null
) => {
  const { minDOB, maxDOB } = getMinMaxDOB(ageStart, ageEnd);

  let query = supabase
    .from("interpreter_profile")
    .select(
      `
      *,
      profile (*)
    `
    )
    .eq(spec, true)
    .eq(language, true)
    .eq("profile.location", state)
    .gt("profile.date_of_birth", minDOB.toISOString())
    .lt("profile.date_of_birth", maxDOB.toISOString())
    .not("profile", "is", null)
    .limit(5);

  if (gender) {
    query = query.order("profile.gender", { ascending: gender === "Female" });
  }

  const { data } = await query;
  return data;
};

export const getMeetLink = async (providerToken: string) => {
  // Use providerToken to create a Google Meet link via Google Calendar API
  const event = {
    summary: "Meeting Title",
    start: { dateTime: "2025-08-19T10:00:00+08:00" },
    end: { dateTime: "2025-08-19T11:00:00+08:00" },
    conferenceData: {
      createRequest: { requestId: "unique-request-id" },
    },
  };

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
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
  console.log("Google Meet Link:", meetLink);
};

interface AppointmentDetails {
  appointmentId: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
}

/**
 * Calculates the age from a date of birth string (YYYY-MM-DD).
 * This is a private helper function used by getAgeRangeFromDOB.
 * @param dobString - The date of birth string.
 * @returns The age in years.
 */
function calculateAge(dobString: string): number {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * **RESTORED FUNCTION**
 * Generates an age range string from a date of birth to fix the AuthContext error.
 * @param dobString - The date of birth in 'YYYY-MM-DD' format.
 * @returns A string representing the age range (e.g., "25-30").
 */
export function getAgeRangeFromDOB(dobString: string | null | undefined): string {
    if (!dobString) {
        return "Not specified";
    }
    try {
        const age = calculateAge(dobString);
        if (isNaN(age) || age < 0) {
            return "Invalid date";
        }
        const lowerBound = Math.floor(age / 5) * 5;
        const upperBound = lowerBound + 4;
        return `${lowerBound}-${upperBound}`;
    } catch (e) {
        return "Not specified";
    }
}


/**
 * **FINAL, HARDENED VERSION**
 * Invokes the 'create-google-meet' Edge Function with explicit authentication.
 * This version manually retrieves the session token to guarantee it's sent with the request.
 * @param appointmentDetails - The necessary data for creating the meeting.
 * @returns The Google Meet link if successful, otherwise null.
 */
export async function scheduleMeetLinkViaEdge(appointmentDetails: AppointmentDetails): Promise<string | null> {
  try {
    console.log('Attempting to schedule meet link via Edge Function...');

    // Step 1: Manually and explicitly get the current user session and token.
    // This is the most reliable way to ensure authentication context is passed.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("Authentication error: Could not retrieve user session. Please log in again.");
    }
    
    const accessToken = session.access_token;

    console.log('Invoking Edge Function with explicit Authorization header.');
    
    // Step 2: Invoke the function, explicitly setting the Authorization header.
    // This solves the "Could not get user session" error in the Edge Function.
    const { data, error } = await supabase.functions.invoke('create-google-meet', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: appointmentDetails, // Body is passed as a plain object
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    showSuccess("Successfully created and scheduled the meeting!");
    return data.meetLink;

  } catch (error: any) {
    console.error("Critical error in scheduleMeetLinkViaEdge:", error);
    showError(error.message || "An unexpected error occurred while scheduling the meeting.");
    return null;
  }
}
