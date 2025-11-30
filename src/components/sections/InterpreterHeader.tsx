import { useAppTheme } from "@/hooks/useAppTheme";
import { InterpreterProfile } from "@/utils/query";
import { StyleSheet, View } from "react-native";
import { Avatar, MD3Theme, Text } from "react-native-paper";
import Gradient from "../ui/Gradient";

interface InterpreterHeaderProps {
  interpreter: InterpreterProfile;
  ratingCount?: number;
}

export default function InterpreterHeader({ interpreter, ratingCount }: InterpreterHeaderProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Gradient style={styles.header}>
      <View style={styles.headerContent}>
        <Avatar.Image size={80} source={{ uri: interpreter.photo }} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text variant="headlineSmall" style={{ color: theme.colors.surface, fontWeight: "bold" }}>
            {interpreter.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.surface }}>
              {interpreter.avgRating
                ? `⭐ ${interpreter.avgRating.toFixed(1)}${ratingCount ? ` (${ratingCount} reviews)` : ""}`
                : "No ratings yet"}
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.surface, marginTop: 4 }}>
            {interpreter.gender} • {interpreter.ageRange} • {interpreter.location}
          </Text>
        </View>
      </View>
    </Gradient>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      paddingTop: 24,
      paddingBottom: 12,
      paddingHorizontal: 16,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
