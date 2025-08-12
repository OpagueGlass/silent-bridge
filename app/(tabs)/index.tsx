"use client"

import { useEffect, useState } from "react"
import { Image, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, Card, Chip, Text } from "react-native-paper"
import { useAuth } from "../../contexts/AuthContext"
import { useAppTheme } from "../../hooks/useAppTheme"

interface Appointment {
  id: number
  date: string
  time: string
  status: string
  interpreter: string
  email: string
}

interface Contact {
  id: number
  name: string
  email: string
  avatar: string
}

export default function HomeScreen() {
  const { profile, isInterpreter } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const theme = useAppTheme()

  console.log('User Profile:', profile)
  console.log('Is Interpreter Profile:', isInterpreter)

  // Mock data for demonstration
  useEffect(() => {
    setAppointments([
      {
        id: 1,
        date: "15/05/2024",
        time: "10:00 - 11:00",
        status: "Approved",
        interpreter: "John Smith",
        email: "john@gmail.com",
      },
      {
        id: 2,
        date: "16/05/2024",
        time: "14:00 - 15:00",
        status: "Pending",
        interpreter: "Sarah Johnson",
        email: "sarah@gmail.com",
      },
    ])

    setContacts([
      {
        id: 1,
        name: "John Smith",
        email: "john@gmail.com",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@gmail.com",
        avatar: "/placeholder.svg?height=50&width=50",
      },
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return theme.colors.secondary
      case "Pending":
        return theme.colors.tertiary
      case "Rejected":
        return theme.colors.error
      case "Completed":
        return theme.colors.primary
      default:
        return theme.colors.onSurfaceVariant
    }
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back, {profile?.name || "User"}!
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {isInterpreter ? "Manage your interpreter services" : "Find your perfect interpreter"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {isInterpreter ? "Recent Requests" : "Contacts"}
        </Text>

        {contacts.map((contact) => (
          <Card key={contact.id} style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.contactContent}>
              <Image source={{ uri: contact.avatar }} style={styles.avatar} />
              <View style={styles.contactInfo}>
                <Text variant="titleMedium" style={[styles.contactName, { color: theme.colors.onSurface }]}>
                  {contact.name}
                </Text>
                <Text variant="bodyMedium" style={[styles.contactEmail, { color: theme.colors.onSurfaceVariant }]}>
                  {contact.email}
                </Text>
              </View>
              <Button mode="outlined" compact>
                Contact
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Appointments
        </Text>

        {appointments.map((appointment) => (
          <Card key={appointment.id} style={[styles.appointmentCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.appointmentHeader}>
                <Text variant="titleMedium" style={[styles.appointmentTitle, { color: theme.colors.onSurface }]}>
                  Appointment {appointment.id}
                </Text>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(appointment.status) }]}
                  textStyle={styles.statusText}
                >
                  {appointment.status}
                </Chip>
              </View>
              <Text variant="bodyLarge" style={[styles.appointmentDate, { color: theme.colors.onSurface }]}>
                {appointment.date} • {appointment.time}
              </Text>
              <Text variant="bodyMedium" style={[styles.appointmentInterpreter, { color: theme.colors.onSurfaceVariant }]}>
                Interpreter: {appointment.interpreter}
              </Text>
              <Text variant="bodyMedium" style={[styles.appointmentEmail, { color: theme.colors.onSurfaceVariant }]}>
                Email: {appointment.email}
              </Text>

              <View style={styles.appointmentActions}>
                <Button mode="outlined" compact style={styles.actionButton}>
                  Add to Calendar
                </Button>
                <Button mode="contained" compact style={styles.actionButton}>
                  Join Appointment
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      {isInterpreter && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Set Availability
          </Text>
          <Card style={[styles.availabilityCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
              <Text variant="bodyLarge" style={[styles.availabilityText, { color: theme.colors.onSurface }]}>
                Set your free times to receive appointment requests
              </Text>
              <Button mode="contained" style={styles.availabilityButton}>
                Set Availability
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24, // spacing.lg
    paddingTop: 60,
  },
  greeting: {
    color: "#ffffff",
    marginBottom: 8, // spacing.sm
  },
  subtitle: {
    color: "#ffffff",
    opacity: 0.9,
  },
  section: {
    padding: 24, // spacing.lg
  },
  sectionTitle: {
    marginBottom: 16, // spacing.md
  },
  contactCard: {
    marginBottom: 12, // spacing.sm + 4
  },
  contactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16, // spacing.md
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    marginBottom: 4, // spacing.xs
  },
  contactEmail: {},
  appointmentCard: {
    marginBottom: 16, // spacing.md
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12, // spacing.sm + 4
  },
  appointmentTitle: {},
  statusChip: {
    paddingHorizontal: 8, // spacing.sm
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
  },
  appointmentDate: {
    marginBottom: 8, // spacing.sm
  },
  appointmentInterpreter: {
    marginBottom: 4, // spacing.xs
  },
  appointmentEmail: {
    marginBottom: 16, // spacing.md
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 0.48,
  },
  availabilityCard: {},
  availabilityText: {
    marginBottom: 16, // spacing.md
    textAlign: "center",
  },
  availabilityButton: {
    marginTop: 12, // spacing.sm + 4
  },
})
