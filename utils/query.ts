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

interface InterpreterProfile extends Profile {
  interpreterSpecialisations: number[];
  interpreterLanguages: number[];
}

// Convert Date to "HH:MM:SS+TZ" format for timetz
const toTimetz = (date: Date): string => {
  return `${date.toISOString().substring(11, 16)}:00+00`;
};

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
const convertToProfile = (profile: Tables<"profile">): Profile => {
  const { date_of_birth, avg_rating, ...rest } = profile;
  const ageRange = getAgeRangeFromDOB(date_of_birth);
  return { ...rest, ageRange, avgRating: avg_rating };
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
  return {
    ...convertToProfile(profile),
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
  spec: number,
  language: number,
  state: string,
  ageStart: number,
  ageEnd: number,
  startTime: Date,
  endTime: Date,
  gender: string | null = null
) => {
  const { minDOB, maxDOB } = getMinMaxDOB(ageStart, ageEnd);
  const day = startTime.getDay() === 0 ? 7 : startTime.getDay();
  const start_time = toTimetz(startTime);
  const end_time = toTimetz(endTime);

  // Build the query with necessary filters and order by rating in descending order
  let query = supabase
    .from("interpreter_profile")
    .select(
      `
      profile (*),
      interpreter_specialisation (specialisation_id),
      interpreter_language (language_id),
      availability (day_id, start_time, end_time)
    `
    )
    .eq("interpreter_specialisation.specialisation_id", spec)
    .eq("interpreter_language.language_id", language)
    .eq("profile.location", state)
    .gt("profile.date_of_birth", minDOB.toISOString())
    .lt("profile.date_of_birth", maxDOB.toISOString())
    .eq("availability.day_id", day)
    .gte("availability.start_time", start_time)
    .lte("availability.end_time", end_time)
    .not("profile", "is", null) // Exclude profiles that only meet some of the criteria
    .not("interpreter_specialisation", "is", null)
    .not("interpreter_language", "is", null)
    .not("availability", "is", null)
    .order("profile(avg_rating)", { ascending: false, nullsFirst: false }); // requires brackets for workaround

  // Sort by gender if specified
  if (gender) {
    query.order("profile(gender)", { ascending: true });
  }

  // Limit to top 5 results
  const { data, error } = await query.limit(5);

  if (error) {
    console.error("Error fetching interpreters:", error);
    return [];
  }

  return data.map(convertToInterpreterProfile);
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
