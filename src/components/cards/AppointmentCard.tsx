import { ClickableProfileImage } from "@/components/images/ProfileImage";
import { theme } from "@/theme/theme";
import { getDate, getStartTime } from "@/utils/helper";
import { Appointment } from "@/utils/query";
import { openURL } from "expo-linking";
import { View } from "react-native";
import { Button, Card, Chip, Icon, Text } from "react-native-paper";
import MessageButton from "./MessageButton";

const joinAppointment = (appointment: Appointment) => {
  if (appointment.meetingUrl) {
    const meetingLink = `https://meet.google.com/${appointment.meetingUrl}`;
    openURL(meetingLink);
  } else {
    // showAlert("No Meeting Link", "The meeting link for this appointment has not been set yet.");
  }
};

export const statusColors: Record<
  Appointment["status"],
  { color: string; backgroundColor: string; borderColor: string }
> = {
  Approved: { color: "#005B26", backgroundColor: "#2ECC7114", borderColor: "#208e4f33" },
  Pending: { color: "#793200", backgroundColor: "#F39C1214", borderColor: "#aa6d0c33" },
  Completed: { color: "#024675", backgroundColor: "#3498db14", borderColor: "#246a9933" },
  Rejected: { color: "#970751", backgroundColor: "#f7279214", borderColor: "#ac1b6633" },
  Cancelled: { color: "#7A7A7A", backgroundColor: "#B3B3B314", borderColor: "#8c8c8c33" },
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
            <Text style={{ marginLeft: 8 }}>{getStartTime(appointment)}</Text>
          </View>
        </View>
      </Card.Content>
    </>
  );
}

export default function AppointmentCard({
  appointment,
  isInterpreter = false,
}: {
  appointment: Appointment;
  isInterpreter?: boolean;
}) {
  return (
    <Card onPress={() => {}}>
      <AppointmentCardContent appointment={appointment} isInterpreter={isInterpreter} />
      <Card.Actions style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <MessageButton recipientId={appointment.profile?.id || ""} />
        <Button
          icon="video"
          style={{ flex: 1 }}
          contentStyle={{ justifyContent: "center" }}
          mode="contained"
          onPress={() => joinAppointment(appointment)}
          disabled={new Date(appointment.startTime).getTime() - 10 * 60 * 1000 > Date.now()}
        >
          Join Meet
        </Button>
      </Card.Actions>
    </Card>
  );
}
