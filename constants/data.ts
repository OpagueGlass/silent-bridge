export const STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Kuala Lumpur',
  'Labuan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Penang',
  'Perak',
  'Perlis',
  'Putrajaya',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
] as const;

export const SPECIALISATION = [
  "Accident and Emergency",
  "Cardiology",
  "Gynecology",
  "Haematology",
  "Neurology",
  "Oncology",
  "Pharmacy",
  "General",
  "Others"
] as const;

export const SPEC = [
  "accidentAndEmergency",
  "cardiology",
  "gynecology",
  "haematology",
  "neurology",
  "oncology",
  "pharmacy",
  "general",
  "others"
] as const;


export const LANGUAGES = [
  "English",
  "Malay",
  "Mandarin",
  "Tamil"
] as const;

export const AGE_RANGE = ['<18', '18-29', '30-39', '40-49', '50-69', '70+'] as const;
export type State = typeof STATES[number];
export type AgeRange = typeof AGE_RANGE[number];
export type UserType = "deaf_user" | "interpreter";
export type Gender = "Male" | "Female"
export type Specialisation = typeof SPECIALISATION[number];
export type Language = typeof LANGUAGES[number];