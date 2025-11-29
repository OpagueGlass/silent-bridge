import { ClickableProfileImage } from "@/components/images/ProfileImage";
import { toTimeRange } from "@/utils/helper";

import { View } from "react-native";
import { Button, Card, Chip, Icon, Text } from "react-native-paper";
import MessageButton from "./MessageButton";

import { SPECIALISATION } from "@/constants/data";
import { InterpreterResults } from "@/utils/query";
import { router } from "expo-router";

export default function ResultCard({ interpreterResult }: { interpreterResult: InterpreterResults }) {
  const { start_time, end_time } = interpreterResult.interpreterAvailability;
  const timeRange = toTimeRange(start_time, end_time);
  // const specialisationID = interpreterResult.interpreterSpecialisations[0];
  // const specialisation = SPECIALISATION[specialisationID];

  return (
    <Card onPress={() => router.push(`/interpreter/${interpreterResult.id}`)} style={{ marginHorizontal: 16, marginVertical: 8 }}>
      <Card.Content style={{ flexDirection: "row" }}>
        <ClickableProfileImage profile={interpreterResult} size={80} borderRadius={16} style={{ marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              {interpreterResult.name}
            </Text>
            <Text variant="titleSmall" style={{ color: "#606F81" }}>
              {interpreterResult.avgRating ? interpreterResult.avgRating.toFixed(1) : "N/A"} ⭐
            </Text>
          </View>
          {/* <Text variant="titleSmall" style={{ marginBottom: 4, color: "#606F81" }}>
            {specialisation}
          </Text> */}

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Icon size={20} source="clock" />
              <Text style={{ marginLeft: 8 }}>{timeRange}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Chip style={{ marginRight: 16 }}>{interpreterResult.gender}</Chip>
              <Chip>{interpreterResult.ageRange}</Chip>
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <MessageButton recipientId={interpreterResult.id} />
        <Button
          icon="calendar-check"
          style={{ flex: 1 }}
          contentStyle={{ justifyContent: "center" }}
          mode="contained"
          onPress={() => router.push(`/interpreter/${interpreterResult.id}/book`)}
        >
          Book Now
        </Button>
      </Card.Actions>
    </Card>
  );
}
