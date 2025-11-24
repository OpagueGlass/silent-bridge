"use client";

import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, List, MD3Theme, Text } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";
import { Appointment, getHistoryAppointments } from "../../utils/query";
import { getTimeRange } from "../../utils/helper";

const HistoryCard = ({ item }: { item: Appointment }) => {
  const theme = useAppTheme();
  const appointmentDate = new Date(item.startTime).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeRange = getTimeRange(item);
  const { profile: otherParty } = item;

  return (
    <Card style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}>
      <List.Item
        title={otherParty?.name || "N/A"}
        description={`${appointmentDate} • ${timeRange}`}
        titleStyle={{ fontWeight: "bold" }}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}
        left={(props) => (
          <List.Icon
            {...props}
            icon="check-circle"
            color={theme.colors.success}
          />
        )}
      />
    </Card>
  );
};

export default function HistoryScreen() {
  const theme = useAppTheme();
  const { profile, isInterpreter } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (profile?.id) {
        setIsLoading(true);
        const history = await getHistoryAppointments(profile.id, isInterpreter);
        setAppointments(history);
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [profile]);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const groupedAppointments = appointments.reduce((acc, app) => {
    const month = new Date(app.startTime).toLocaleString("default", { month: "long", year: "numeric" });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(app);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sections = Object.keys(groupedAppointments).map((month) => ({
    title: month,
    data: groupedAppointments[month],
  }));

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    // Changed the root View to a ScrollView for better layout control
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* Added the title text back into the header */}
        <Text style={styles.title}>History</Text>
      </View>

      {/* The list is now inside a View, not a FlatList, to work inside a ScrollView */}
      <View style={styles.listContent}>
        {sections.length > 0 ? (
          sections.map((section) => (
            <View key={section.title}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
              {section.data.map((app) => (
                <HistoryCard key={app.id} item={app} />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.centered}>
            <Text>No completed appointments found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Updated the styles function with the standard header
const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      height: 130, 
      justifyContent: 'flex-start',
      paddingHorizontal: 24,
      paddingTop: 80,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.surface, // White text for blue background
    },
    listContent: {
      padding: 20,
    },
    sectionHeader: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    centered: {
      paddingTop: 50, // Added padding for better centering
      justifyContent: "center",
      alignItems: "center",
    },
  });