// app/(tabs)/videocall.tsx
import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, StyleSheet } from 'react-native';
import { 
  Button, 
  Card, 
  Text, 
  TextInput, 
  SegmentedButtons,
  Modal,
  Portal,
  Chip,
  FAB,
  ActivityIndicator
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { MeetService } from '../services/MeetService';
import MeetingScheduler from '../components/MeetingScheduler';

interface UpcomingMeeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingUrl?: string;
  attendees: any[];
  calendarLink?: string;
}

export default function VideoCallScreen() {
  const { user, userProfile } = useAuth();
  const theme = useAppTheme();
  
  // State management
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [meetingType, setMeetingType] = useState('quick');
  const [showScheduler, setShowScheduler] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);

  /**
   * Load upcoming meetings on component mount
   */
  useEffect(() => {
    loadUpcomingMeetings();
  }, []);

  /**
   * Load upcoming meetings from Google Calendar
   */
  const loadUpcomingMeetings = async () => {
    try {
      setIsLoadingMeetings(true);
      const result = await MeetService.getUpcomingMeetings();
      if (result.success) {
        setUpcomingMeetings(result.meetings);
      }
    } catch (error) {
      console.error('Failed to load meetings:', error);
      // Don't show error for this, as it's not critical
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  /**
   * Handle different types of meeting creation
   */
  const handleCreateMeeting = async () => {
    try {
      setIsCreating(true);
      let result;

      switch (meetingType) {
        case 'quick':
          result = await MeetService.startQuickVideoCall();
          Alert.alert(
            'Success', 
            'Google Meet is opening. Share the meeting link with participants.'
          );
          break;
        
        case 'scheduled':
          setShowScheduler(true);
          setIsCreating(false);
          return; // Exit early, don't set isCreating to false at the end
        
        case 'custom':
          const customId = `interpreter-${Date.now()}`;
          result = await MeetService.createCustomMeeting(customId);
          Alert.alert(
            'Meeting Created', 
            `Meeting ID: ${customId}\nShare this ID with participants.`
          );
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create meeting. Please check your permissions and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handle joining a meeting
   */
  const handleJoinMeeting = async () => {
    if (!meetingUrl.trim()) {
      Alert.alert('Error', 'Please enter a meeting URL or ID');
      return;
    }

    try {
      // Check if it's a full URL or just an ID
      const finalUrl = meetingUrl.startsWith('http') 
        ? meetingUrl 
        : `https://meet.google.com/${meetingUrl}`;
        
      await MeetService.joinMeeting(finalUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to join meeting. Please check the URL and try again.');
    }
  };

  /**
   * Handle scheduled meeting creation success
   */
  const handleMeetingScheduled = (meeting: any) => {
    console.log('Meeting scheduled successfully:', meeting);
    setShowScheduler(false);
    
    const title = meeting.details?.title || meeting.title || 'Interpretation Session';
    
    Alert.alert(
      'Meeting Scheduled Successfully!',
      `Your meeting has been created.\n\nTitle: ${title}\n\nParticipants will receive calendar invitations.`,
      [
        { text: 'OK', onPress: () => loadUpcomingMeetings() }
      ]
    );
  };

  /**
   * Handle joining an upcoming meeting
   */
  const handleJoinUpcomingMeeting = async (meeting: UpcomingMeeting) => {
    if (!meeting.meetingUrl) {
      Alert.alert('Error', 'No meeting link available for this event');
      return;
    }

    try {
      await MeetService.joinMeeting(meeting.meetingUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to join meeting');
    }
  };

  /**
   * Handle canceling a meeting
   */
  const handleCancelMeeting = (meeting: UpcomingMeeting) => {
    Alert.alert(
      'Cancel Meeting',
      `Are you sure you want to cancel "${meeting.title}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await MeetService.cancelScheduledMeeting(meeting.id);
              Alert.alert('Success', 'Meeting cancelled successfully');
              loadUpcomingMeetings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel meeting');
            }
          }
        }
      ]
    );
  };

  /**
   * Format meeting time for display
   */
  const formatMeetingTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    
    const isToday = start.toDateString() === now.toDateString();
    const isTomorrow = start.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let dateStr = '';
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = start.toLocaleDateString();
    }
    
    const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    return `${dateStr}, ${timeStr}`;
  };

  /**
   * Check if meeting is starting soon (within 15 minutes)
   */
  const isMeetingStartingSoon = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60);
    return diffMins <= 15 && diffMins >= -5; // Starting within 15 mins or started within 5 mins
  };

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Video Call Options
          </Text>
          <Text variant="bodyLarge" style={styles.headerSubtitle}>
            Choose how you want to start your meeting
          </Text>
        </View>

        {/* Upcoming Meetings Section */}
        {upcomingMeetings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Upcoming Meetings ({upcomingMeetings.length})
              </Text>
              <Button 
                mode="text" 
                onPress={loadUpcomingMeetings}
                loading={isLoadingMeetings}
                compact
                icon="refresh"
              >
                Refresh
              </Button>
            </View>
            
            {isLoadingMeetings ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                  Loading meetings...
                </Text>
              </View>
            ) : (
              upcomingMeetings.map((meeting) => (
                <Card key={meeting.id} style={[styles.meetingCard, { backgroundColor: theme.colors.surface }]}>
                  <Card.Content>
                    <View style={styles.meetingHeader}>
                      <Text variant="titleMedium" style={[styles.meetingTitle, { color: theme.colors.onSurface }]}>
                        {meeting.title}
                      </Text>
                      {isMeetingStartingSoon(meeting.startTime) && (
                        <Chip 
                          style={[styles.urgentChip, { backgroundColor: theme.colors.error }]}
                          textStyle={{ color: '#ffffff' }}
                          compact
                        >
                          Starting Soon
                        </Chip>
                      )}
                    </View>
                    
                    <Text variant="bodyMedium" style={[styles.meetingTime, { color: theme.colors.onSurfaceVariant }]}>
                      📅 {formatMeetingTime(meeting.startTime, meeting.endTime)}
                    </Text>
                    
                    {meeting.description && (
                      <Text variant="bodySmall" style={[styles.meetingDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {meeting.description}
                      </Text>
                    )}
                    
                    {meeting.attendees.length > 0 && (
                      <Text variant="bodySmall" style={[styles.meetingAttendees, { color: theme.colors.onSurfaceVariant }]}>
                        👥 {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                      </Text>
                    )}
                    
                    <View style={styles.meetingActions}>
                      {meeting.meetingUrl && (
                        <Button 
                          mode="contained" 
                          onPress={() => handleJoinUpcomingMeeting(meeting)}
                          style={[
                            styles.joinButton, 
                            isMeetingStartingSoon(meeting.startTime) && { backgroundColor: theme.colors.error }
                          ]}
                          icon="video"
                          compact
                        >
                          {isMeetingStartingSoon(meeting.startTime) ? 'Join Now' : 'Join'}
                        </Button>
                      )}
                      <Button 
                        mode="text" 
                        onPress={() => handleCancelMeeting(meeting)}
                        textColor={theme.colors.error}
                        compact
                        icon="delete"
                      >
                        Cancel
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        )}

        {/* Meeting Type Selection */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Create New Meeting
          </Text>
          
          <SegmentedButtons
            value={meetingType}
            onValueChange={setMeetingType}
            buttons={[
              {
                value: 'quick',
                label: 'Quick Start',
                icon: 'video-plus',
              },
              {
                value: 'scheduled',
                label: 'Scheduled',
                icon: 'calendar',
              },
              {
                value: 'custom',
                label: 'Custom ID',
                icon: 'account-group',
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Create Meeting Section */}
        <View style={styles.section}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              {meetingType === 'quick' && (
                <>
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    🚀 Quick Start Meeting
                  </Text>
                  <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Start an instant meeting and share the link with participants. Perfect for immediate interpretation needs.
                  </Text>
                </>
              )}
              
              {meetingType === 'scheduled' && (
                <>
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    📅 Scheduled Meeting
                  </Text>
                  <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Create a meeting for a specific time with Google Calendar integration. Automatic invitations will be sent to all participants.
                  </Text>
                </>
              )}
              
              {meetingType === 'custom' && (
                <>
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    👥 Custom Meeting ID
                  </Text>
                  <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Create a meeting with a memorable ID that participants can easily join using the meeting code.
                  </Text>
                </>
              )}
              
              <Button 
                mode="contained" 
                style={styles.button}
                onPress={handleCreateMeeting}
                loading={isCreating}
                disabled={isCreating}
                icon={meetingType === 'quick' ? 'video-plus' : meetingType === 'scheduled' ? 'calendar-plus' : 'account-group'}
              >
                {isCreating ? 'Creating...' : 
                 meetingType === 'scheduled' ? 'Schedule Meeting' : 'Create Meeting'}
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Join Meeting Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Join Existing Meeting
          </Text>
          
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                Enter Meeting Details
              </Text>
              <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
                Join a meeting using the Google Meet URL or meeting ID
              </Text>
              
              <TextInput
                label="Meeting URL or ID"
                value={meetingUrl}
                onChangeText={setMeetingUrl}
                mode="outlined"
                style={styles.input}
                placeholder="https://meet.google.com/xxx-xxxx-xxx or meeting-id"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <Button 
                mode="outlined" 
                style={styles.button}
                onPress={handleJoinMeeting}
                icon="video"
                disabled={!meetingUrl.trim()}
              >
                Join Meeting
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* User Info */}
        {userProfile && (
          <View style={styles.section}>
            <Card style={[styles.userCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <Card.Content>
                <Text variant="titleMedium" style={[styles.userCardTitle, { color: theme.colors.onPrimaryContainer }]}>
                  Account Information
                </Text>
                <Text variant="bodyMedium" style={[styles.userInfo, { color: theme.colors.onPrimaryContainer }]}>
                  👤 {userProfile.name}
                </Text>
                <Text variant="bodySmall" style={[styles.userInfo, { color: theme.colors.onPrimaryContainer }]}>
                  📧 {userProfile.email}
                </Text>
                <Text variant="bodySmall" style={[styles.userInfo, { color: theme.colors.onPrimaryContainer }]}>
                  🔗 Connected to Google Calendar
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Help Section */}
        <View style={styles.section}>
          <Card style={[styles.helpCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.helpTitle, { color: theme.colors.onSurface }]}>
                💡 Tips for Better Video Calls
              </Text>
              
              <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
                • Test your camera and microphone before important meetings
              </Text>
              <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
                • Use a stable internet connection for the best experience
              </Text>
              <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
                • Schedule meetings in advance to send calendar invitations
              </Text>
              <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
                • Share meeting links securely with only intended participants
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Floating Action Button for Quick Schedule */}
      <FAB
        icon="calendar-plus"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        onPress={() => setShowScheduler(true)}
        label="Schedule"
      />

      {/* Meeting Scheduler Modal */}
      <Portal>
        <Modal
          visible={showScheduler}
          onDismiss={() => setShowScheduler(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          <MeetingScheduler
            onMeetingCreated={handleMeetingScheduled}
            onCancel={() => setShowScheduler(false)}
          />
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  cardDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  
  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  
  // Meeting Card Styles
  meetingCard: {
    marginBottom: 12,
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  meetingTitle: {
    flex: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  urgentChip: {
    marginLeft: 8,
  },
  meetingTime: {
    marginBottom: 4,
  },
  meetingDescription: {
    marginBottom: 4,
    fontStyle: 'italic',
  },
  meetingAttendees: {
    marginBottom: 12,
  },
  meetingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  joinButton: {
    flex: 0.6,
  },
  
  // User Card Styles
  userCard: {
    marginTop: 8,
  },
  userCardTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  userInfo: {
    marginBottom: 4,
  },
  
  // Help Card Styles
  helpCard: {
    marginTop: 8,
  },
  helpTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  helpText: {
    marginBottom: 6,
    lineHeight: 18,
  },
  
  // FAB and Modal Styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    margin: 20,
    maxHeight: '90%',
    borderRadius: 8,
  },
});
