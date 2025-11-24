import { theme } from "@/theme/theme";
import { getDate, getStartTime } from "@/utils/helper";
import { Appointment } from "@/utils/query";
import * as Linking from "expo-linking";
import { View, TouchableOpacity } from "react-native";
import { Button, Card, Chip, Icon, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { ClickableProfileImage } from "./ProfileImage";

const joinAppointment = (appointment: Appointment) => {
  if (appointment.meetingUrl) {
    const meetingLink = `https://meet.google.com/${appointment.meetingUrl}`;
    Linking.openURL(meetingLink);
  } else {
    // showAlert("No Meeting Link", "The meeting link for this appointment has not been set yet.");
  }
};

const statusColors: Record<Appointment["status"], string> = {
  Approved: theme.colors.success,
  Pending: theme.colors.warning,
  Completed: theme.colors.info,
  Rejected: theme.colors.error,
  Cancelled: theme.colors.disabled,
};

export default function AppointmentCard({
  appointment,
  isInterpreter = false,
  router,
}: {
  appointment: Appointment;
  isInterpreter?: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const handleViewProfile = () => {
    if (!isInterpreter) {
      router.push(`/interpreter/${appointment.profile?.id}`);
    }
  };

  return (
    <Card onPress={() => {}}>
      <Chip
        style={{
          backgroundColor: statusColors[appointment.status],
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
        }}
        textStyle={{ color: "#fff" }}
      >
        {appointment.status}
      </Chip>
      <Card.Content style={{ flexDirection: "row", marginTop: 16 }}>
        <ClickableProfileImage
          profile={appointment.profile}
          size={72}
          borderRadius={16}
          isClickable={!isInterpreter}
          onPress={handleViewProfile}
          style={{ marginRight: 16 }}
        />
        <View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}
          >
            <Text variant="titleMedium" style={{ paddingRight: 12, fontWeight: "bold" }}>
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
      <Card.Actions style={{ flexDirection: "row", justifyContent: "space-between", paddingRight: 16 }}>
        <Button icon="message" style={{ flex: 1 }} contentStyle={{ justifyContent: "center" }} mode="contained-tonal">
          Message
        </Button>
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
