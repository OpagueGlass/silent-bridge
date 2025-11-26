import { AppointmentCardContent } from "./AppointmentCard";
import { Appointment } from "@/utils/query";
import { Button, Card } from "react-native-paper";
import MessageButton from "./MessageButton";

export default function ReviewCard({
  appointment,
  isInterpreter = false,
  onPress,
}: {
  appointment: Appointment;
  isInterpreter?: boolean;
  onPress?: () => void;
}) {
  return (
    <Card onPress={() => {}}>
      <AppointmentCardContent appointment={appointment} isInterpreter={isInterpreter} />
      <Card.Actions style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <MessageButton recipientId={appointment.profile?.id || ""} />
        <Button
          icon="star"
          style={{ flex: 1 }}
          contentStyle={{ justifyContent: "center" }}
          mode="contained"
          onPress={onPress}
        >
          Review
        </Button>
      </Card.Actions>
    </Card>
  );
}
