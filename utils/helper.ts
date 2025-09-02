import { AgeRange, AGE_RANGE, Spec, Language, State } from "@/constants/data";

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

export const parseDate = (dateString: string) => {
  const [day, month, year] = dateString.split("/").map((num) => parseInt(num, 10));
  return new Date(year, month - 1, day);
};

export const getMeetLink = async (providerToken: string, startTime: string, endTime: string) => {
  // Use providerToken to create a Google Meet link via Google Calendar API
  const event = {
    summary: "Meeting Title",
    start: { dateTime: startTime },
    end: { dateTime: endTime },
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
  return meetLink;
};
