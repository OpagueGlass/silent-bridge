import { AgeRange, AGE_RANGE, Spec, Language, State } from "@/constants/data";
import { supabase } from "./supabase";

export const getAgeRangeFromDOB = (dateOfBirth: string): AgeRange => {
  const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
  if (age < 18) return AGE_RANGE[0];
  if (age < 30) return AGE_RANGE[1];
  if (age < 40) return AGE_RANGE[2];
  if (age < 50) return AGE_RANGE[3];
  if (age < 70) return AGE_RANGE[4];
  return AGE_RANGE[5];
};

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
    .limit(5)

  if (gender) {
    query = query.order("profile.gender", { ascending: gender === "Female" });
  }

  const { data } = await query;
  return data;
};
