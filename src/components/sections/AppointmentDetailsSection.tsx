import { getDate, getDuration, getTimeRange } from "@/utils/helper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { MD3Theme, Text } from "react-native-paper";
import { useAppTheme } from "../../hooks/useAppTheme";

export default function AppointmentDetailsSection({
  appointmentDetails,
}: {
  appointmentDetails: {
    startTime: string;
    endTime: string;
    hospital_name: string | null;
  };
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Appointment Details
      </Text>
      <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Date
              </Text>
              <Text variant="bodyLarge" style={{ fontWeight: "500", marginTop: 2 }}>
                {getDate(appointmentDetails)}
              </Text>
            </View>
          </View>

          <View style={[styles.detailRow, { marginTop: 16 }]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Time
              </Text>
              <Text variant="bodyLarge" style={{ fontWeight: "500", marginTop: 2 }}>
                {getTimeRange(appointmentDetails)}
              </Text>
            </View>
          </View>

          <View style={[styles.detailRow, { marginTop: 16 }]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="timer-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Duration
              </Text>
              <Text variant="bodyLarge" style={{ fontWeight: "500", marginTop: 2 }}>
                {getDuration(appointmentDetails)}
              </Text>
            </View>
          </View>

        {appointmentDetails.hospital_name && (
          <View style={[styles.detailRow, { marginTop: 16 }]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="hospital-building" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Location
              </Text>
              <Text variant="bodyLarge" style={{ fontWeight: "500", marginTop: 2 }}>
                {appointmentDetails.hospital_name}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      marginBottom: 12,
      color: theme.colors.onSurface,
    },
    detailsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
  });
