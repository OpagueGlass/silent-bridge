import { useAppTheme } from "@/hooks/useAppTheme";
import { View } from "react-native";
import { Avatar, Card, Text } from "react-native-paper";

export default function RatingCard({
  rating,
  index,
}: {
  rating: { name: string; photo: string; score: number; message?: string | null };
  index: number;
}) {
  const theme = useAppTheme();
  return (
    <Card key={index} mode="outlined" style={{ marginBottom: theme.spacing.sm, borderRadius: 16 }}>
      <Card.Content>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Avatar.Image source={{ uri: rating.photo }} size={40} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
              {rating.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
              {"⭐".repeat(rating.score)}
            </Text>
          </View>
        </View>
        {rating.message && (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {rating.message}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}
