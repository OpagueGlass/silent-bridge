import { Button } from "react-native-paper";
import { router } from "expo-router";
import { initiateChat } from "@/utils/query";

export const launchChat = async (recipientId: string) => {
  if (!recipientId) return;
  const roomId = await initiateChat(recipientId);
  if (roomId) {
    router.push({ pathname: "/chat/[id]", params: { id: roomId } });
  } else {
    console.error("Could not initiate chat.");
  }
};

export default function MessageButton({recipientId}: {recipientId: string}) {
  return (
    <Button
      icon="message"
      style={{ flex: 1 }}
      contentStyle={{ justifyContent: "center" }}
      mode="contained-tonal"
      onPress={() => launchChat(recipientId)}
    >
      Message
    </Button>
  );
}
