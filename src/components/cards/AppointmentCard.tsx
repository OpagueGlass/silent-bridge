import { ClickableProfileImage } from "@/components/images/ProfileImage";
import { Appointment, updateAppointmentStatus } from "@/utils/query";
import { getDate, getTimeRange } from "@/utils/time";
import { openURL } from "expo-linking";
import { View } from "react-native";
import { Button, Card, Chip, Icon, Text } from "react-native-paper";
import MessageButton from "./MessageButton";
import { getCalendarId } from "@/utils/calendar";

const joinAppointment = (appointment: Appointment) => {
  if (appointment.meetingUrl) {
    const meetingLink = `https://meet.google.com/${appointment.meetingUrl}`;
    openURL(meetingLink);
  } else {
    console.error("No meeting link available for this appointment.");
  }
};

export const cancelAppointment = async (appointment: Appointment, providerToken: string) => {
  try {
    await updateAppointmentStatus(appointment.id, "Cancelled");
    const calendarId = await getCalendarId(providerToken);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/appt${appointment.id}?sendUpdates=all`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${providerToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Calendar API Error:", errorText);
      throw new Error(`Failed to delete calendar event: ${errorText}`);
    }
  } catch (error) {
    console.error("Error cancelling appointment:", error);
  }
};

export const statusColors: Record<
  Appointment["status"],
  { color: string; backgroundColor: string; borderColor: string }
> = {
  Approved: { color: "#005B26", backgroundColor: "#2ECC7114", borderColor: "#208e4f33" },
  Pending: { color: "#793200", backgroundColor: "#F39C1214", borderColor: "#aa6d0c33" },
  Completed: { color: "#024675", backgroundColor: "#3498db14", borderColor: "#246a9933" },
  Cancelled: { color: "#970751", backgroundColor: "#f7279214", borderColor: "#ac1b6633" },
  // Cancelled: { color: "#7A7A7A", backgroundColor: "#B3B3B314", borderColor: "#8c8c8c33" },
};

export function AppointmentCardContent({
  appointment,
  isInterpreter,
}: {
  appointment: Appointment;
  isInterpreter: boolean;
}) {
  const statusColor = statusColors[appointment.status];
  return (
    <>
      <Chip
        style={{
          backgroundColor: statusColor.backgroundColor,
          borderColor: statusColor.borderColor,
          borderWidth: 1,
          position: "absolute",
          top: 6,
          right: 6,
          zIndex: 1,
        }}
        textStyle={{ color: statusColor.color }}
      >
        {appointment.status}
      </Chip>
      <Card.Content style={{ flexDirection: "row", marginTop: 12 }}>
        <ClickableProfileImage
          profile={appointment.profile}
          size={72}
          borderRadius={16}
          isClickable={!isInterpreter}
          style={{ marginRight: 16 }}
        />
        <View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}
          >
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              {appointment.profile?.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Icon size={20} source="calendar" />
            <Text style={{ marginLeft: 8 }}>{getDate(appointment)}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Icon size={20} source="clock" />
            <Text style={{ marginLeft: 8 }}>{getTimeRange(appointment)}</Text>
          </View>
        </View>
      </Card.Content>
    </>
  );
}

export default function AppointmentCard({
  appointment,
  isInterpreter = false,
  onPress: onPress,
}: {
  appointment: Appointment;
  onPress?: () => void;
  isInterpreter?: boolean;
}) {
  return (
    <Card style={{ marginBottom: 8 }} onPress={onPress}>
      <AppointmentCardContent appointment={appointment} isInterpreter={isInterpreter} />
      <Card.Actions style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <MessageButton recipientId={appointment.profile?.id || ""} />
        <Button
          icon="video"
          style={{ flex: 1 }}
          contentStyle={{ justifyContent: "center" }}
          mode="contained"
          onPress={() => joinAppointment(appointment)}
          disabled={
            new Date(appointment.startTime).setDate(new Date(appointment.startTime).getDate() - 1) > Date.now() ||
            appointment.status !== "Approved"
          }
        >
          Join Meet
        </Button>
      </Card.Actions>
    </Card>
  );
}
