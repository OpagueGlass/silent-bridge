import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMeetLink } from "@/utils/helper";
import { updateRequest, addAppointmentMeetingURL, Request, Profile, getRequests } from "@/utils/query";
import { showConfirmAlert } from "../../utils/alert";
import { Dispatch, SetStateAction } from "react";
import { Button, Card } from "react-native-paper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { AppointmentCardContent } from "@/components/cards/AppointmentCard";

const handleAcceptRequest =
  (
    profile: Profile | null,
    getToken: () => Promise<string | null>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setRequests: Dispatch<SetStateAction<Request[]>>
  ) =>
  async (request: Request) => {
    let confirmMessage = `Are you sure you want to accept this request?`;

    if (request.hasOverlap && request.overlappingAppointments && request.overlappingAppointments.length > 0) {
      const overlapDetails = request.overlappingAppointments
        .map((overlap) => {
          const startTime = new Date(overlap.startTime).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
          const endTime = new Date(overlap.endTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `\n• ${overlap.userName} (${startTime} - ${endTime})`;
        })
        .join("");

      confirmMessage = `Are you sure you want to accept this request?\n\nThis will automatically reject ${request.overlappingAppointments.length} overlapping request(s):${overlapDetails}`;
    }

    const confirmed = await showConfirmAlert(`Accept Request`, confirmMessage);
    if (!confirmed) return;

    try {
      setLoading(true);
      const providerToken = await getToken();
      const meetingLink = await getMeetLink(
        providerToken!,
        request.appointment.startTime,
        request.appointment.endTime,
        request.appointment.profile!
      );
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
    }
  };

const handleRejectRequest =
  (
    profile: Profile | null,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setRequests: Dispatch<SetStateAction<Request[]>>
  ) =>
  async (request: Request) => {
    const confirmed = await showConfirmAlert(`Reject Request`, `Are you sure you want to reject this request?`);
    if (!confirmed) return;

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
  profile: Profile | null,
  getToken: () => Promise<string | null>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setRequests: Dispatch<SetStateAction<Request[]>>
) => ({
  acceptRequest: handleAcceptRequest(profile, getToken, setLoading, setRequests),
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
  const theme = useAppTheme();
    // Approved: { color: "#005B26", backgroundColor: "#2ECC7114", borderColor: "#208e4f33" },
    //   Rejected: { color: "#970751", backgroundColor: "#f7279214", borderColor: "#ac1b6633" },
  return (
    <Card>
      <AppointmentCardContent appointment={request.appointment} isInterpreter={false} />
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
