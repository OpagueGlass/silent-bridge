"use client"

import { useEffect, useState } from "react"
import { Image, ScrollView, StyleSheet, View, Alert } from "react-native"
import { Button, Card, Chip, Text } from "react-native-paper"
import { useRouter } from 'expo-router'
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
  const { userProfile } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const theme = useAppTheme()
  const router = useRouter()

  const isInterpreter = userProfile?.userType === "interpreter"

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
      {
        id: 3,
        date: "17/05/2024",
        time: "09:00 - 10:00",
        status: "Completed",
        interpreter: "Mike Davis",
        email: "mike@gmail.com",
      },
    ])

    setContacts([
      {
        id: 1,
        name: "John Smith",
        email: "john@gmail.com",
        avatar: "https://ui-avatars.com/api/?name=John+Smith&background=6366f1&color=fff&size=128",
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@gmail.com",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=10b981&color=fff&size=128",
      },
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return theme.colors.secondary // Using our custom secondary green
      case "Pending":
        return theme.colors.tertiary // Using our custom tertiary amber
      case "Rejected":
        return theme.colors.error
      case "Completed":
        return theme.colors.primary
      default:
        return theme.colors.onSurfaceVariant
    }
  }

  const handleJoinAppointment = (appointment: Appointment) => {
    // 检查预约状态
    if (appointment.status !== 'Approved') {
      let message = '';
      switch (appointment.status) {
        case 'Pending':
          message = 'This appointment is still pending approval.';
          break;
        case 'Rejected':
          message = 'This appointment has been rejected.';
          break;
        case 'Completed':
          message = 'This appointment has already been completed.';
          break;
        default:
          message = 'This appointment is not available for joining.';
      }
      
      Alert.alert(
        'Cannot Join Appointment',
        message,
        [{ text: 'OK' }]
      );
      return;
    }

    // 检查预约时间（可选）
    const appointmentDate = new Date(`${appointment.date.split('/').reverse().join('-')}T${appointment.time.split(' - ')[0]}`);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    // 如果预约时间还未到（提前15分钟可以进入）
    if (minutesDiff > 15) {
      Alert.alert(
        'Appointment Not Ready',
        `This appointment starts at ${appointment.time}. You can join 15 minutes before the scheduled time.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // 导航到视频通话页面
    router.push({
      pathname: '/video-call',
      params: {
        appointmentId: appointment.id.toString(),
        interpreterName: appointment.interpreter,
        userType: userProfile?.userType || 'client',
        appointmentTime: `${appointment.date} ${appointment.time}`,
      }
    });
  }

  const handleAddToCalendar = (appointment: Appointment) => {
    // 这里可以集成日历功能
    Alert.alert(
      'Add to Calendar',
      `Would you like to add "${appointment.interpreter}" appointment on ${appointment.date} ${appointment.time} to your calendar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            // 实现添加到日历的逻辑
            Alert.alert('Success', 'Appointment added to calendar!');
          }
        }
      ]
    );
  }

  const handleContactPress = (contact: Contact) => {
    // 导航到聊天页面或显示联系方式
    Alert.alert(
      'Contact Options',
      `Choose how to contact ${contact.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Message', onPress: () => {
          // 导航到聊天页面
          router.push('/chat');
        }},
        { text: 'Email', onPress: () => {
          // 打开邮件应用
          Alert.alert('Email', `Opening email to ${contact.email}`);
        }}
      ]
    );
  }

  const handleSetAvailability = () => {
    // 导航到设置可用时间的页面
    Alert.alert(
      'Set Availability',
      'This will open the availability settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // 这里可以导航到设置页面
            router.push('/settings');
          }
        }
      ]
    );
  }

  const getJoinButtonText = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'Join Appointment';
      case 'Pending':
        return 'Waiting Approval';
      case 'Completed':
        return 'Completed';
      case 'Rejected':
        return 'Rejected';
      default:
        return 'Join Appointment';
    }
  }

  const isJoinButtonDisabled = (status: string) => {
    return status !== 'Approved';
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back, {userProfile?.name || "User"}!
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
              <Image 
                source={{ uri: contact.avatar }} 
                style={styles.avatar}
                defaultSource={{ uri: 'https://ui-avatars.com/api/?name=User&background=cccccc&color=fff&size=128' }}
              />
              <View style={styles.contactInfo}>
                <Text variant="titleMedium" style={[styles.contactName, { color: theme.colors.onSurface }]}>
                  {contact.name}
                </Text>
                <Text variant="bodyMedium" style={[styles.contactEmail, { color: theme.colors.onSurfaceVariant }]}>
                  {contact.email}
                </Text>
              </View>
              <Button 
                mode="outlined" 
                compact
                onPress={() => handleContactPress(contact)}
              >
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
                  Appointment #{appointment.id}
                </Text>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(appointment.status) }]}
                  textStyle={styles.statusText}
                >
                  {appointment.status}
                </Chip>
              </View>
              <Text variant="bodyLarge" style={[styles.appointmentDate, { color: theme.colors.onSurface }]}>
                📅 {appointment.date} • ⏰ {appointment.time}
              </Text>
              <Text variant="bodyMedium" style={[styles.appointmentInterpreter, { color: theme.colors.onSurfaceVariant }]}>
                👨‍💼 Interpreter: {appointment.interpreter}
              </Text>
              <Text variant="bodyMedium" style={[styles.appointmentEmail, { color: theme.colors.onSurfaceVariant }]}>
                📧 Email: {appointment.email}
              </Text>

              <View style={styles.appointmentActions}>
                <Button 
                  mode="outlined" 
                  compact 
                  style={styles.actionButton}
                  onPress={() => handleAddToCalendar(appointment)}
                  disabled={appointment.status === 'Rejected'}
                >
                  Add to Calendar
                </Button>
                <Button 
                  mode="contained" 
                  compact 
                  style={[
                    styles.actionButton,
                    isJoinButtonDisabled(appointment.status) && styles.disabledButton
                  ]}
                  onPress={() => handleJoinAppointment(appointment)}
                  disabled={isJoinButtonDisabled(appointment.status)}
                  buttonColor={
                    appointment.status === 'Approved' 
                      ? theme.colors.primary 
                      : theme.colors.surfaceVariant
                  }
                >
                  {getJoinButtonText(appointment.status)}
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
                📅 Set your free times to receive appointment requests
              </Text>
              <Button 
                mode="contained" 
                style={styles.availabilityButton}
                onPress={handleSetAvailability}
              >
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
    fontWeight: 'bold',
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
    fontWeight: '600',
  },
  contactCard: {
    marginBottom: 12, // spacing.sm + 4
    elevation: 2,
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
    backgroundColor: '#f0f0f0', // 占位背景色
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    marginBottom: 4, // spacing.xs
    fontWeight: '500',
  },
  contactEmail: {},
  appointmentCard: {
    marginBottom: 16, // spacing.md
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12, // spacing.sm + 4
  },
  appointmentTitle: {
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 8, // spacing.sm
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDate: {
    marginBottom: 8, // spacing.sm
    fontWeight: '500',
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
    gap: 8,
  },
  actionButton: {
    flex: 0.48,
  },
  disabledButton: {
    opacity: 0.6,
  },
  availabilityCard: {
    elevation: 2,
  },
  availabilityText: {
    marginBottom: 16, // spacing.md
    textAlign: "center",
  },
  availabilityButton: {
    marginTop: 12, // spacing.sm + 4
  },
})
