import { AppointmentCardContent } from "@/components/cards/AppointmentCard";
import { ActiveProfile, addAppointmentMeetingURL, getRequests, Profile, Request, updateRequest } from "@/utils/query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispatch, SetStateAction } from "react";
import { Button, Card } from "react-native-paper";
import { getCalendarId } from "@/utils/calendar";

export const getMeetLink = async (providerToken: string, request: Request) => {
  const { startTime, endTime, id } = request.appointment;
  const profile = request.appointment.profile!;

  // Create event in the app's calendar
  const calendarId = await getCalendarId(providerToken);
  const event = {
    id: `appt${id}`,
    summary: `Appointment with ${profile.name}`,
    start: {
      dateTime: startTime,
      timeZone: "Asia/Kuala_Lumpur",
    },
    end: {
      dateTime: endTime,
      timeZone: "Asia/Kuala_Lumpur",
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    attendees: [{ email: profile.email, organizer: true }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Calendar API Error:", errorText);
    throw new Error(`Failed to create calendar event: ${errorText}`);
  }

  const result = await response.json();
  const meetLink = result.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri;
  return meetLink;
};

const handleAcceptRequest =
  (
    profile: ActiveProfile | null,
    getToken: () => Promise<string | null>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setRequests: Dispatch<SetStateAction<Request[]>>,
    showError: () => void
  ) =>
  async (request: Request) => {
    try {
      setLoading(true);
      const providerToken = await getToken();
      const meetingLink = await getMeetLink(providerToken!, request);
      const meetingURL = meetingLink.split("/")[3];
      await addAppointmentMeetingURL(request.appointment.id, meetingURL);
      await updateRequest(request.id, true);
      await Promise.all(request.overlappingAppointments?.map((overlap) => updateRequest(overlap.requestId, false)));

      // Signal home screen to refresh
      await AsyncStorage.setItem("requestAccepted", "true");

      const updatedRequests = await getRequests(profile!.id);
      setRequests(updatedRequests);
      setLoading(false);
    } catch (error) {
      console.error("Error updating request:", error);
      showError();
      setLoading(false);
    }
  };

const handleRejectRequest =
  (
    profile: ActiveProfile | null,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setRequests: Dispatch<SetStateAction<Request[]>>
  ) =>
  async (request: Request) => {
    try {
      setLoading(true);
      await updateRequest(request.id, false);
      const updatedRequests = await getRequests(profile!.id);
      setRequests(updatedRequests);
      setLoading(false);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

export const handleRequest = (
  profile: ActiveProfile | null,
  getToken: () => Promise<string | null>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setRequests: Dispatch<SetStateAction<Request[]>>,
  showError: () => void
) => ({
  acceptRequest: handleAcceptRequest(profile, getToken, setLoading, setRequests, showError),
  rejectRequest: handleRejectRequest(profile, setLoading, setRequests),
});

export default function RequestCard({
  request,
  acceptRequest,
  rejectRequest,
}: {
  request: Request;
  acceptRequest: (request: Request) => void;
  rejectRequest: (request: Request) => void;
}) {
  return (
    <Card key={request.id} style={{ marginBottom: 16 }}>
      <AppointmentCardContent appointment={request.appointment} isInterpreter={true} />
      <Card.Actions style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button
          buttonColor={"#2ECC7114"}
          textColor={"#005B26"}
          icon="check"
          style={{ flex: 1, borderColor: "#208e4f33", borderWidth: 1, marginRight: 8 }}
          contentStyle={{ justifyContent: "center" }}
          mode="contained"
          onPress={() => acceptRequest(request)}
        >
          Accept
        </Button>
        <Button
          buttonColor={"#f7279214"}
          textColor={"#970751"}
          icon="close"
          style={{ flex: 1, borderColor: "#ac1b6633", borderWidth: 1 }}
          contentStyle={{ justifyContent: "center" }}
          mode="contained"
          onPress={() => rejectRequest(request)}
        >
          Reject
        </Button>
      </Card.Actions>
    </Card>
  );
}
