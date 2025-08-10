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

export const AGE_RANGE = ['<18', '18-29', '30-39', '40-49', '50-69', '70+'] as const;
export type State = typeof STATES[number];
export type AgeRange = typeof AGE_RANGE[number];
export type UserType = "deaf_user" | "interpreter";
export type Gender = "Male" | "Female"