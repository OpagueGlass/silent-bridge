"use client"

import React from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import { Card, Button, Chip, Menu } from "react-native-paper"
import * as Calendar from "expo-calendar"
import * as Linking from "expo-linking"

interface Appointment {
  id: number
  date: string
  time: string
  status: "Approved" | "Pending" | "Rejected" | "Completed"
  interpreter: string
  email: string
  meetingLink?: string
}

interface AppointmentCardProps {
  appointment: Appointment
  userType: "deaf" | "interpreter"
  onStatusChange?: (appointmentId: number, newStatus: string) => void
}

export default function AppointmentCard({ appointment, userType, onStatusChange }: AppointmentCardProps) {
  const [statusMenuVisible, setStatusMenuVisible] = React.useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "#4CAF50"
      case "Pending":
        return "#FF9800"
      case "Rejected":
        return "#F44336"
      case "Completed":
        return "#2196F3"
      default:
        return "#666"
    }
  }

  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync()
      if (status === "granted") {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
        const defaultCalendar = calendars.find((cal) => cal.source.name === "Default")

        if (defaultCalendar) {
          const eventDetails = {
            title: `Interpretation Session with ${appointment.interpreter}`,
            startDate: new Date(`${appointment.date} ${appointment.time.split(" - ")[0]}`),
            endDate: new Date(`${appointment.date} ${appointment.time.split(" - ")[1]}`),
            location: "Online Meeting",
            notes: `Interpreter: ${appointment.interpreter}\nEmail: ${appointment.email}`,
          }

          await Calendar.createEventAsync(defaultCalendar.id, eventDetails)
          Alert.alert("Success", "Event added to calendar!")
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add event to calendar")
    }
  }

  const joinMeeting = () => {
    const meetingUrl = appointment.meetingLink || "https://meet.google.com/new"
    Linking.openURL(meetingUrl)
  }

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(appointment.id, newStatus)
    }
    setStatusMenuVisible(false)
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>Appointment {appointment.id}</Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(appointment.status) }]}
            textStyle={styles.statusText}
          >
            {appointment.status}
          </Chip>
        </View>

        <Text style={styles.date}>
          {appointment.date} • {appointment.time}
        </Text>
        <Text style={styles.interpreter}>Interpreter: {appointment.interpreter}</Text>
        <Text style={styles.email}>Email: {appointment.email}</Text>

        <View style={styles.actions}>
          <Button mode="outlined" compact style={styles.actionButton} onPress={addToCalendar}>
            Add to Calendar
          </Button>

          {appointment.status === "Approved" && (
            <Button mode="contained" compact style={styles.actionButton} onPress={joinMeeting}>
              Join Appointment
            </Button>
          )}

          {appointment.status === "Completed" && (
            <Button mode="contained" compact style={styles.actionButton}>
              Rate Appointment
            </Button>
          )}
        </View>

        {userType === "interpreter" && appointment.status === "Approved" && (
          <View style={styles.interpreterActions}>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setStatusMenuVisible(true)} style={styles.statusButton}>
                  Change Status
                </Button>
              }
            >
              <Menu.Item onPress={() => handleStatusChange("Approved")} title="Approved" />
              <Menu.Item onPress={() => handleStatusChange("Rejected")} title="Rejected" />
              <Menu.Item onPress={() => handleStatusChange("Completed")} title="Completed" />
            </Menu>
          </View>
        )}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusChip: {
    paddingHorizontal: 8,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
  },
  date: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  interpreter: {
    fontSize: 14,
    marginBottom: 2,
    color: "#666",
  },
  email: {
    fontSize: 14,
    marginBottom: 15,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actionButton: {
    flex: 0.48,
  },
  interpreterActions: {
    marginTop: 10,
  },
  statusButton: {
    alignSelf: "flex-start",
  },
})
