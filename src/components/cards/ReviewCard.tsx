import { AppointmentCardContent } from "./AppointmentCard";
import { Appointment } from "@/utils/query";
import { useRouter } from "expo-router";
import { Button, Card } from "react-native-paper";

export default function ReviewCard({
  appointment,
  isInterpreter = false,
  router,
  onPress,
}: {
  appointment: Appointment;
  isInterpreter?: boolean;
  router: ReturnType<typeof useRouter>;
  onPress?: () => void;
}) {
  return (
    <Card onPress={() => {}}>
        <AppointmentCardContent appointment={appointment} isInterpreter={isInterpreter} router={router} />
      <Card.Actions style={{ flexDirection: "row", justifyContent: "space-between", paddingRight: 16 }}>
        <Button icon="message" style={{ flex: 1 }} contentStyle={{ justifyContent: "center" }} mode="contained-tonal">
          Message
        </Button>
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
