import { AppointmentCardContent } from "./AppointmentCard";
import { Appointment } from "@/utils/query";
import { Card } from "react-native-paper";

export default function HistoryCard({
  appointment,
  isInterpreter = false,
}: {
  appointment: Appointment;
  isInterpreter?: boolean;
}) {
  return (
    <Card onPress={() => {}} style={{ marginBottom: 16, paddingBottom: 8 }}>
      <AppointmentCardContent appointment={appointment} isInterpreter={isInterpreter} />
    </Card>
  );
}
