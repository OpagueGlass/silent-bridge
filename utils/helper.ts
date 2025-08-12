import { AgeRange, AGE_RANGE } from "@/constants/data";

export const getAgeRangeFromDOB = (dateOfBirth: string): AgeRange => {
  const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
  if (age < 18) return AGE_RANGE[0];
  if (age < 30) return AGE_RANGE[1];
  if (age < 40) return AGE_RANGE[2];
  if (age < 50) return AGE_RANGE[3];
  if (age < 70) return AGE_RANGE[4];
  return AGE_RANGE[5];
};