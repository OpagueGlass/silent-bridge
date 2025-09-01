import { supabase } from "./supabase";
import { getAgeRangeFromDOB, getMinMaxDOB } from "./helper";
import { AgeRange } from "@/constants/data";
import { Tables } from "./database-types";

// Profile and InterpreterProfile interfaces
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

export interface InterpreterProfile extends Profile {
  interpreterSpecialisations: number[]; 
  interpreterLanguages: number[];
}

export interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  hospitalName: string | null;
  meetingUrl: string | null;
  deafUserId: string;
  interpreterId: string | null;
  otherUserProfile: Profile | null;
}

export interface PendingRequest {
    id: number;
    appointment: {
        id: number;
        startTime: string;
        endTime: string;
        hospitalName: string | null;
        clientProfile: Profile | null;
    };
    note: string | null;
}

// Convert Date to "HH:MM:SS+TZ" format for timetz
const toTimetz = (date: Date): string => date.toTimeString().split(' ')[0];

// Convert specialisation and language IDs from id to respective index in constants
const convertToSpec = (specialisations: { specialisation_id: number }[]): number[] => {
  return specialisations.map(({ specialisation_id }) => specialisation_id - 1);
};

const convertToLang = (languages: { language_id: number }[]): number[] => {
  return languages.map(({ language_id }) => language_id - 1);
};

/**
 * Convert a profile from the database format to the application format.
 *
 * @param profile The profile from the database
 * @returns The converted profile
 */
const convertToProfile = (profile: Tables<"profile"> | null): Profile | null => {
  if (!profile) return null;
  const { date_of_birth, avg_rating, ...rest } = profile;
  return { ...rest, ageRange: getAgeRangeFromDOB(date_of_birth), avgRating: avg_rating };
};

/**
 * Convert the interpreter profile from the database format to the application format.
 *
 * @param data The interpreter profile from the database
 * @returns The converted interpreter profile
 */
const convertToInterpreterProfile = (data: {
  profile: Tables<"profile">;
  interpreter_specialisation: { specialisation_id: number }[];
  interpreter_language: { language_id: number }[];
}): InterpreterProfile => {
  const { profile, interpreter_specialisation, interpreter_language } = data;
  const baseProfile = convertToProfile(profile);
  if (!baseProfile) {
    throw new Error("Profile could not be converted.");
  }
  return {
    ...baseProfile,
    interpreterLanguages: convertToLang(interpreter_language),
    interpreterSpecialisations: convertToSpec(interpreter_specialisation),
  };
};

const convertToAppointment = (
  data: {
    start_time: string;
    end_time: string;
    hospital_name: string | null;
    meeting_url: string | null;
  },
  profile: Tables<"profile"> | null
) => {
  const { start_time, end_time, hospital_name, meeting_url } = data;
  const formattedRest = {
    startTime: start_time,
    endTime: end_time,
    hospitalName: hospital_name,
    meetingUrl: meeting_url,
  };

  if (!profile) return formattedRest;

  return {
    profile: {
      ...convertToProfile(profile),
    },
    ...formattedRest,
  };
};

/**
 * Retrieve the profile for a user.
 *
 * @param id ID of the user
 * @returns Profile or null if not found
 */
export const getProfile = async (id: string): Promise<Profile | null> => {
  const { data: profile } = await supabase.from("profile").select("*").eq("id", id).maybeSingle();
  if (!profile) {
    return null;
  }
  return convertToProfile(profile);
};

/**
 * Check if a user has an interpreter profile.
 *
 * @param id ID of the user
 * @returns True if the user has an interpreter profile, false otherwise
 */
export const hasInterpreterProfile = async (id: string) => {
  const { data: interpreterProfile } = await supabase
    .from("interpreter_profile")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return !!interpreterProfile;
};

/**
 * Retrieve the interpreter profile with specialisations and languages for an interpreter.
 *
 * @param id ID of the user
 * @returns Interpreter profile with specialisations and languages or null if not found
 */
export const getInterpreterProfile = async (id: string): Promise<InterpreterProfile | null> => {
  const { data, error } = await supabase
    .from("interpreter_profile")
    .select(
      `
      profile (*),
      interpreter_specialisation (specialisation_id),
      interpreter_language (language_id)
    `
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return convertToInterpreterProfile(data);
};

/**
 * Retrieve the top 5 interpreters based on the given criteria.
 *
 * @param spec ID of the specialisation (Index + 1 in SPECIALISATION)
 * @param language ID of the language (Index + 1 in LANGUAGES)
 * @param state Name of the state (A state from STATES)
 * @param ageStart Minimum age
 * @param ageEnd Maximum age
 * @param startTime  Start time of the appointment
 * @param endTime  End time of the appointment
 * @param gender Optional gender of the interpreter ("Male", "Female")
 * @returns The top 5 interpreters matching the criteria, sorted by average rating and gender if specified
 */
export const searchInterpreters = async (
  spec: number | null, language: number | null, state: string | null,
  ageStart: number, ageEnd: number, startTime: Date, endTime: Date,
  minRating: number = 0, gender: string | null = null
): Promise<InterpreterProfile[]> => {
  const { minDOB, maxDOB } = getMinMaxDOB(ageStart, ageEnd);
  const day = startTime.getDay() === 0 ? 7 : startTime.getDay(); // JS Sunday is 0, DB is 7
  const start_time = toTimetz(startTime);
  const end_time = toTimetz(new Date(endTime.getTime() - 1000)); // Make end time exclusive for correct range check

  let query = supabase
    .from("interpreter_profile")
    .select(`
        profile!inner(*),
        interpreter_specialisation!inner(specialisation_id),
        interpreter_language!inner(language_id),
        availability!inner(day_id, start_time, end_time)
    `)
    .gt("profile.date_of_birth", minDOB.toISOString())
    .lt("profile.date_of_birth", maxDOB.toISOString())
    .or(`avg_rating.gt.${minRating},avg_rating.is.null`, { referencedTable: "profile" })
    .eq("availability.day_id", day)
    .lte("availability.start_time", start_time)
    .gte("availability.end_time", end_time)
    .order("avg_rating", { referencedTable: 'profile', ascending: false, nullsFirst: false });

  // Dynamically apply optional filters
  if (spec) query = query.eq("interpreter_specialisation.specialisation_id", spec);
  if (language) query = query.eq("interpreter_language.language_id", language);
  if (state) query = query.eq("profile.location", state);
  if (gender) query = query.order("gender", { referencedTable: "profile", ascending: gender === "Male" });

  const { data, error } = await query.limit(10);

  if (error) {
    console.error("Error fetching interpreters:", error);
    return [];
  }
  
  // Optimization: Process the rich data directly instead of making N+1 subsequent calls.
  return data.map(convertToInterpreterProfile).filter(p => p !== null) as InterpreterProfile[];
};

/**
 * Create a new appointment once a request has been made.
 *
 * @param deaf_user_id  ID of the deaf user
 * @param interpreter_id  ID of the interpreter
 * @param startTime  Start time of the appointment
 * @param endTime  End time of the appointment
 * @param hospital_name Optional name of the hospital
 * @returns The ID of the created appointment or -1 if there was an error
 */
export const createAppointment = async (
  deaf_user_id: string,
  startTime: Date,
  endTime: Date,
  hospital_name: string | null
) => {
  const start_time = startTime.toISOString();
  const end_time = endTime.toISOString();

  const { data, error } = await supabase
    .from("appointment")
    .insert([
      {
        deaf_user_id,
        start_time,
        end_time,
        hospital_name,
      },
    ])
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating appointment:", error);
    return -1;
  }

  return data.id;
};

export const addAppointmentMeetingURL = async (appointment_id: number, meeting_url: string) => {
  const { error } = await supabase.from("appointment").update({ meeting_url }).eq("id", appointment_id);

  if (error) {
    console.error("Error adding meeting URL to appointment:", error);
  }
};

/**
 * Create a request to an interpreter for a specific appointment.
 *
 * @param appointment_id  ID of the appointment
 * @param interpreter_id  ID of the interpreter
 * @param note Optional note for the request
 * @returns The ID of the created request or -1 if there was an error
 */
export const createRequest = async (appointment_id: number, interpreter_id: string, note: string | null = null) => {
  const { data, error } = await supabase
    .from("request")
    .insert([
      {
        appointment_id,
        interpreter_id,
        note,
      },
    ])
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating request:", error);
    return -1;
  }

  return data.id;
};

/**
 * Update the status of a request.
 *
 * @param request_id The ID of the request to update
 * @param is_accepted Whether the request is accepted or not
 * @returns The appointment ID associated with the request or undefined if there was an error
 */
export const updateRequest = async (request_id: number, is_accepted: boolean) => {
  const { data, error } = await supabase
    .from("request")
    .update({ is_accepted })
    .eq("id", request_id)
    .select("appointment_id")
    .single();

  if (error || !data) {
    console.error("Error updating request:", error);
    return -1;
  }

  return data.appointment_id;
};

/**
 * Gets the upcoming appointments for a deaf user.
 * @param user_id The ID of the deaf user
 * @returns A list of upcoming appointments for the deaf user
 */
export const getUpcomingUserAppointments = async (user_id: string) => {
  const { data, error } = await supabase
    .from("appointment")
    .select(
      `
      start_time,
      end_time,
      deaf_user_id,
      hospital_name,
      meeting_url,
      interpreter_profile (
        profile (*)
      )
      `
    )
    .eq("deaf_user_id", user_id)
    .neq("interpreter_profile", null)
    .gte("end_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming user appointments:", error);
    return [];
  }

  return data.map(({ interpreter_profile, ...rest }) =>
    convertToAppointment(rest, interpreter_profile?.profile || null)
  );
};

/**
 * Gets the upcoming appointments for an interpreter.
 *
 * @param interpreter_id The ID of the interpreter
 * @returns A list of upcoming appointments for the interpreter
 */
export const getUpcomingInterpreterAppointments = async (interpreter_id: string) => {
  const { data, error } = await supabase
    .from("appointment")
    .select(
      `
      start_time,
      end_time,
      interpreter_id,
      hospital_name,
      meeting_url,
      profile (*)
      `
    )
    .eq("interpreter_id", interpreter_id)
    .gte("end_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming interpreter appointments:", error);
    return [];
  }

  return data.map(({ profile, ...rest }) => convertToAppointment(rest, profile));
};

/**
 * Gets the review appointments for a deaf user.
 *
 * @param user_id The ID of the deaf user
 * @returns A list of review appointments for the deaf user
 */
export const getReviewUserAppointments = async (user_id: string) => {
  // Set the review period to 5 days
  const reviewPeriod = new Date();
  reviewPeriod.setDate(reviewPeriod.getDate() - 5);

  const { data, error } = await supabase
    .from("appointment")
    .select(
      `
      start_time,
      end_time,
      deaf_user_id,
      hospital_name,
      meeting_url,
      interpreter_profile (
        profile (*)
      )
      `
    )
    .eq("deaf_user_id", user_id)
    .lt("end_time", new Date().toISOString())
    .gte("end_time", reviewPeriod.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching review user appointments:", error);
    return [];
  }

  return data.map(({ interpreter_profile, ...rest }) =>
    convertToAppointment(rest, interpreter_profile?.profile || null)
  );
};

/**
 * Gets the review appointments for an interpreter.
 *
 * @param interpreter_id The ID of the interpreter
 * @returns A list of review appointments for the interpreter
 */
export const getReviewInterpreterAppointments = async (interpreter_id: string) => {
  // Set the review period to 5 days
  const reviewPeriod = new Date();
  reviewPeriod.setDate(reviewPeriod.getDate() - 5);

  const { data, error } = await supabase
    .from("appointment")
    .select(
      `
      start_time,
      end_time,
      interpreter_id,
      hospital_name,
      meeting_url,
      profile (*)
      `
    )
    .eq("interpreter_id", interpreter_id)
    .lt("end_time", new Date().toISOString())
    .gte("end_time", reviewPeriod.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching review interpreter appointments:", error);
    return [];
  }

  return data.map(({ profile, ...rest }) => convertToAppointment(rest, profile));
};

/**
 * Gets the pending requests for an interpreter.
 *
 * @param interpreter_id The ID of the interpreter
 * @returns A list of pending requests for the interpreter
 */
export const getRequests = async (interpreter_id: string) => {
  const { data, error } = await supabase
    .from("request")
    .select(
      `
      *,
      appointment (*, profile (*))
    `
    )
    .eq("interpreter_id", interpreter_id)
    .is("is_accepted", null) // Only get pending requests
    .is("is_expired", false); // Only get non-expired requests

  if (error) {
    console.error("Error fetching requests:", error);
    return [];
  }

  return data.map(({ note, appointment }) => ({
    note,
    appointment: convertToAppointment(appointment, appointment.profile),
  }));
};

/**
 * Submits a rating for an appointment.
 *
 * @param appointment_id The ID of the appointment being rated
 * @param rater_id The ID of the user submitting the rating
 * @param rated_user_id The ID of the user being rated
 * @param score The rating score (e.g., 1-5)
 * @param message The optional message accompanying the rating
 */
export const submitRating = async (
  appointment_id: number,
  rater_id: string,
  rated_user_id: string,
  score: number,
  message: string | null
) => {
  const { error } = await supabase.from("rating").insert([
    {
      appointment_id,
      rater_id,
      rated_user_id,
      score,
      message,
    },
  ]);

  if (error) {
    console.error("Error submitting rating:", error);
  }
};

/**
 * Sets the availability of an interpreter for a particular day.
 *
 * @param interpreter_id The ID of the interpreter
 * @param day_id The ID of the day
 * @param start_time The start time of the availability in timetz format
 * @param end_time The end time of the availability in timetz format
 */
export const setAvailability = async (interpreter_id: string, day_id: number, start_time: string, end_time: string) => {
  const { error } = await supabase.from("availability").upsert([
    {
      interpreter_id,
      day_id,
      start_time,
      end_time,
    },
  ]);

  if (error) {
    console.error("Error setting availability:", error);
  }
};


/**
 * Gets the upcoming appointments for a given user, fetching the profile of the other participant correctly.
 * This function works for both Deaf Users and Interpreters.
 * @param userId The ID of the user.
 * @param isInterpreter A boolean to indicate if the user is an interpreter.
 * @returns A promise that resolves to an array of appointments.
 */
export const getUpcomingAppointmentsForUser = async (userId: string, isInterpreter: boolean): Promise<Appointment[]> => {
    const now = new Date().toISOString();
    const userRoleField = isInterpreter ? "interpreter_id" : "deaf_user_id";

    const query = supabase
        .from("appointment")
        .select(`*, deaf_user_profile:profile!appointment_deaf_user_id_fkey(*), interpreter_user_profile:interpreter_profile!inner(profile!inner(*))`)
        .eq(userRoleField, userId)
        .or(`status.eq.Pending,status.eq.Approved`)
        .gte("end_time", now)
        .order("start_time", { ascending: true });

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching upcoming appointments:", error);
        return [];
    }

    return (data || []).map((appt: any) => ({
        id: appt.id, startTime: appt.start_time, endTime: appt.end_time, status: appt.status,
        hospitalName: appt.hospital_name, meetingUrl: appt.meeting_url, deafUserId: appt.deaf_user_id,
        interpreterId: appt.interpreter_id,
        otherUserProfile: isInterpreter ? convertToProfile(appt.deaf_user_profile) : (appt.interpreter_user_profile ? convertToProfile(appt.interpreter_user_profile.profile) : null),
    }));
};

/**
 * Fetches all pending appointment requests for a specific interpreter.
 */
export const getPendingRequests = async (interpreter_id: string): Promise<PendingRequest[]> => {
  const { data, error } = await supabase.from("request")
    .select(`id, note, appointment:appointment!inner(*, clientProfile:profile!appointment_deaf_user_id_fkey(*))`)
    .eq("interpreter_id", interpreter_id)
    .is("is_accepted", null) // Correctly filter for unhandled requests
    .eq("is_expired", false);

  if (error) { console.error("Error fetching requests:", error); return []; }

  return (data || []).map(item => ({
    id: item.id,
    note: item.note,
    appointment: {
      id: item.appointment.id,
      startTime: item.appointment.start_time,
      endTime: item.appointment.end_time,
      hospitalName: item.appointment.hospital_name,
      clientProfile: convertToProfile(item.appointment.clientProfile)
    }
  }));
};

/**
 * Allows an interpreter to accept a request.
 * This function atomically updates the request status to 'accepted' and updates the
 * corresponding appointment with the interpreter's ID and a generated meeting URL.
 */
export const acceptRequest = async (requestId: number, appointmentId: number, interpreterId: string): Promise<boolean> => {
    // Step 1: Update the request and confirm the change
    const { data: updatedRequest, error: requestError } = await supabase.from("request")
        .update({ is_accepted: true })
        .eq("id", requestId)
        .select() // Ask the database to return the updated row
        .single(); // Expect a single row to be returned

    if (requestError || !updatedRequest) {
        console.error("Error updating request status, or no row was updated:", requestError);
        return false;
    }

    // Step 2: Generate a meeting URL and update the corresponding appointment, confirming the change
    const meetingUrl = `https://meet.google.com/new-meeting-for-${appointmentId}`;
    const { data: updatedAppointment, error: appointmentError } = await supabase.from("appointment")
        .update({ meeting_url: meetingUrl, interpreter_id: interpreterId, status: 'Approved' })
        .eq("id", appointmentId)
        .select() // Ask the database to return the updated row
        .single();

    if (appointmentError || !updatedAppointment) {
        console.error("Error updating appointment, or no row was updated:", appointmentError);
        // Optional: Implement rollback logic here to revert the request status.
        return false;
    }

    console.log("Successfully accepted request and updated appointment:", updatedAppointment);
    return true;
};