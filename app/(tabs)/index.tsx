// app/(tabs)/index.tsx
"use client"

import { useEffect, useState } from "react"
import { Image, ScrollView, StyleSheet, View, Linking, Alert } from "react-native"
import { Button, Card, Chip, Text } from "react-native-paper"
import { router } from 'expo-router'
import { useAuth } from "../../contexts/AuthContext"
import { useAppTheme } from "../../hooks/useAppTheme"
import { MeetService } from "../../services/MeetService"

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

interface UpcomingMeeting {
  id: string
  title: string
  startTime: string
  meetingUrl?: string
}

/**
 * Home Screen Component
 * Main dashboard showing appointments, contacts, and quick actions
 */
export default function HomeScreen() {
  const { userProfile, isInterpreter } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([])
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false)
  const theme = useAppTheme()

  // Mock data and load meetings
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

    loadUpcomingMeetings()
  }, [])

  /**
   * Load upcoming meetings from Google Calendar
   */
  const loadUpcomingMeetings = async () => {
    try {
      setIsLoadingMeetings(true)
      const result = await MeetService.getUpcomingMeetings()
      if (result.success) {
        setUpcomingMeetings(result.meetings.slice(0, 3)) // Show only 3 most recent
      }
    } catch (error) {
      console.error('Failed to load meetings:', error)
      // Don't show error alert on home screen
    } finally {
      setIsLoadingMeetings(false)
    }
  }

  /**
   * Get status color based on appointment status
   */
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

  /**
   * Handle quick video call start
   */
  const handleQuickVideoCall = async () => {
    try {
      await MeetService.startQuickVideoCall()
      Alert.alert(
        'Success', 
        'Google Meet is opening. Share the meeting link with participants.'
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to start video call')
    }
  }

  /**
   * Handle joining a meeting from the home screen
   */
  const handleJoinMeeting = async (meetingUrl: string) => {
    try {
      await MeetService.joinMeeting(meetingUrl)
    } catch (error) {
      Alert.alert('Error', 'Failed to join meeting')
    }
  }

  /**
   * Format meeting time for home screen display
   */
  const formatMeetingTimeForHome = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const isToday = start.toDateString() === now.toDateString()
    
    if (isToday) {
      return `Today, ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return `${start.toLocaleDateString()}, ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back, {userProfile?.name || "User"}!
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {isInterpreter ? "Manage your interpreter services" : "Find your perfect interpreter"}
        </Text>
      </View>

      {/* Video Call Quick Actions */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Quick Actions
        </Text>
        
        <Card style={[styles.videoCallCard, { backgroundColor: theme.colors.primary }]}>
          <Card.Content>
            <Text variant="bodyLarge" style={[styles.videoCallText, { color: "#ffffff" }]}>
              Start a secure video call with Google Meet
            </Text>
            <Text variant="bodyMedium" style={[styles.videoCallSubtext, { color: "#ffffff" }]}>
              Connect with interpreters or clients instantly
            </Text>
            
            <View style={styles.videoCallActions}>
              <Button 
                mode="contained" 
                style={[styles.videoCallButton, { backgroundColor: theme.colors.surface }]}
                labelStyle={{ color: theme.colors.primary }}
                onPress={handleQuickVideoCall}
                icon="video-plus"
              >
                Quick Start
              </Button>
              
              <Button 
                mode="outlined" 
                style={[styles.videoCallButton, { borderColor: "#ffffff" }]}
                labelStyle={{ color: "#ffffff" }}
                onPress={() => router.push('/videocall')}
                icon="video"
              >
                More Options
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Upcoming Meetings Section */}
      {upcomingMeetings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Upcoming Meetings
            </Text>
            <Button 
              mode="text" 
              onPress={() => router.push('/videocall')}
              compact
            >
              View All
            </Button>
          </View>
          
          {upcomingMeetings.map((meeting) => (
            <Card key={meeting.id} style={[styles.meetingPreviewCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.meetingPreviewContent}>
                <View style={styles.meetingPreviewInfo}>
                  <Text variant="titleSmall" style={[styles.meetingPreviewTitle, { color: theme.colors.onSurface }]}>
                    {meeting.title}
                  </Text>
                  <Text variant="bodySmall" style={[styles.meetingPreviewTime, { color: theme.colors.onSurfaceVariant }]}>
                    📅 {formatMeetingTimeForHome(meeting.startTime)}
                  </Text>
                </View>
                {meeting.meetingUrl && (
                  <Button 
                    mode="outlined" 
                    compact 
                    onPress={() => handleJoinMeeting(meeting.meetingUrl!)}
                    icon="video"
                    style={styles.joinButton}
                  >
                    Join
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))}
          
          {isLoadingMeetings && (
            <Text variant="bodySmall" style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              Loading meetings...
            </Text>
          )}
        </View>
      )}

      {/* Contacts Section */}
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
              <View style={styles.contactActions}>
                <Button mode="outlined" compact style={styles.contactButton}>
                  Contact
                </Button>
                <Button 
                  mode="text" 
                  compact 
                  style={styles.videoButton}
                  onPress={handleQuickVideoCall}
                  icon="video"
                >
                  Video
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Appointments Section */}
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
                <Button 
                  mode="contained" 
                  compact 
                  style={styles.actionButton}
                  onPress={handleQuickVideoCall}
                  icon="video"
                >
                  Join Call
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Interpreter Availability Section */}
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
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    color: "#ffffff",
    opacity: 0.9,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Video Call Styles
  videoCallCard: {
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  videoCallText: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: '600',
  },
  videoCallSubtext: {
    marginBottom: 20,
    textAlign: "center",
    opacity: 0.9,
  },
  videoCallActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  videoCallButton: {
    flex: 1,
    paddingVertical: 8,
  },
  
  // Meeting Preview Styles
  meetingPreviewCard: {
    marginBottom: 8,
  },
  meetingPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  meetingPreviewInfo: {
    flex: 1,
  },
  meetingPreviewTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  meetingPreviewTime: {
    fontSize: 12,
  },
  joinButton: {
    minWidth: 80,
  },
  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Contact Styles
  contactCard: {
    marginBottom: 12,
  },
  contactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    marginBottom: 4,
  },
  contactEmail: {},
  contactActions: {
    flexDirection: 'column',
    gap: 8,
  },
  contactButton: {
    minWidth: 80,
  },
  videoButton: {
    minWidth: 80,
  },
  
  // Appointment Styles
  appointmentCard: {
    marginBottom: 16,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentTitle: {},
  statusChip: {
    paddingHorizontal: 8,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
  },
  appointmentDate: {
    marginBottom: 8,
  },
  appointmentInterpreter: {
    marginBottom: 4,
  },
  appointmentEmail: {
    marginBottom: 16,
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 0.48,
  },
  
  // Availability Styles
  availabilityCard: {},
  availabilityText: {
    marginBottom: 16,
    textAlign: "center",
  },
  availabilityButton: {
    marginTop: 12,
  },
})
