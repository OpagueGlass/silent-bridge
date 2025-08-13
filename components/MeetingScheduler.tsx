// components/MeetingScheduler.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { 
  Card, 
  Text, 
  TextInput, 
  Button, 
  Chip,
  HelperText 
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../hooks/useAppTheme';
import { MeetService } from '../services/MeetService';
import { useAuth } from '../contexts/AuthContext';

interface MeetingSchedulerProps {
  onMeetingCreated?: (meeting: any) => void;
  onCancel?: () => void;
}

export default function MeetingScheduler({ onMeetingCreated, onCancel }: MeetingSchedulerProps) {
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [meetingData, setMeetingData] = useState({
    description: '',
    startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    attendees: [] as string[],
  });
  
  const [newAttendee, setNewAttendee] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  /**
   * Generate meeting title automatically
   */
  const generateMeetingTitle = (startTime: Date) => {
    const userName = userProfile?.name || 'User';
    const dateStr = startTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `Interpretation Session with ${userName} - ${dateStr} at ${timeStr}`;
  };

  /**
   * Validate email format
   */
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * Add attendee email
   */
  const handleAddAttendee = () => {
    if (!newAttendee.trim()) return;
    
    if (!isValidEmail(newAttendee)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    if (meetingData.attendees.includes(newAttendee)) {
      Alert.alert('Duplicate Email', 'This email is already added');
      return;
    }
    
    setMeetingData(prev => ({
      ...prev,
      attendees: [...prev.attendees, newAttendee.trim()],
    }));
    setNewAttendee('');
  };

  /**
   * Remove attendee
   */
  const handleRemoveAttendee = (email: string) => {
    setMeetingData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(attendee => attendee !== email),
    }));
  };

  /**
   * Handle date/time changes with proper state updates
   */
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    
    if (selectedDate) {
      const newStartTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        meetingData.startTime.getHours(),
        meetingData.startTime.getMinutes()
      );
      
      // Auto-adjust end time to be 1 hour after start time
      const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);
      
      setMeetingData(prev => ({
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime,
      }));
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    
    if (selectedTime) {
      const newStartTime = new Date(
        meetingData.startTime.getFullYear(),
        meetingData.startTime.getMonth(),
        meetingData.startTime.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      
      // Auto-adjust end time to be 1 hour after start time
      const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);
      
      setMeetingData(prev => ({
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime,
      }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      const newEndTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        meetingData.endTime.getHours(),
        meetingData.endTime.getMinutes()
      );
      
      setMeetingData(prev => ({
        ...prev,
        endTime: newEndTime,
      }));
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    
    if (selectedTime) {
      const newEndTime = new Date(
        meetingData.endTime.getFullYear(),
        meetingData.endTime.getMonth(),
        meetingData.endTime.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      
      setMeetingData(prev => ({
        ...prev,
        endTime: newEndTime,
      }));
    }
  };

  /**
   * Create scheduled meeting with auto-generated title
   */
  const handleCreateMeeting = async () => {
    // Validation
    if (meetingData.startTime >= meetingData.endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    if (meetingData.startTime < new Date()) {
      Alert.alert('Error', 'Start time cannot be in the past');
      return;
    }

    try {
      setIsCreating(true);
      
      // Generate title automatically
      const autoTitle = generateMeetingTitle(meetingData.startTime);
      
      const result = await MeetService.createScheduledMeeting({
        title: autoTitle, // 使用自动生成的标题
        description: meetingData.description || `Scheduled interpretation session with ${userProfile?.name || 'interpreter'}.`,
        startTime: meetingData.startTime.toISOString(),
        endTime: meetingData.endTime.toISOString(),
        attendees: meetingData.attendees,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      Alert.alert(
        'Meeting Scheduled!',
        `Your meeting has been created successfully.\n\nTitle: ${autoTitle}\n\nMeeting will be accessible via Google Calendar.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onMeetingCreated?.(result);
            }
          }
        ]
      );

    } catch (error) {
      console.error('Failed to create meeting:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to create meeting. Please check your Google Calendar permissions.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Schedule Meeting
          </Text>

          {/* Auto-generated Title Preview */}
          <View style={styles.titlePreviewContainer}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Meeting Title (Auto-generated)
            </Text>
            <Card style={[styles.titlePreview, { backgroundColor: theme.colors.primaryContainer }]}>
              <Card.Content style={styles.titlePreviewContent}>
                <Text variant="bodyMedium" style={[styles.titlePreviewText, { color: theme.colors.onPrimaryContainer }]}>
                  {generateMeetingTitle(meetingData.startTime)}
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Meeting Description */}
          <TextInput
            label="Description (Optional)"
            value={meetingData.description}
            onChangeText={(text) => setMeetingData(prev => ({ ...prev, description: text }))}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="Additional details about the interpretation session..."
          />

          {/* Start Date & Time */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Start Time
          </Text>
          <View style={styles.dateTimeRow}>
            <Button
              mode="outlined"
              onPress={() => setShowStartDatePicker(true)}
              style={styles.dateTimeButton}
              icon="calendar"
            >
              {meetingData.startTime.toLocaleDateString()}
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowStartTimePicker(true)}
              style={styles.dateTimeButton}
              icon="clock"
            >
              {meetingData.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Button>
          </View>

          {/* End Date & Time */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            End Time
          </Text>
          <View style={styles.dateTimeRow}>
            <Button
              mode="outlined"
              onPress={() => setShowEndDatePicker(true)}
              style={styles.dateTimeButton}
              icon="calendar"
            >
              {meetingData.endTime.toLocaleDateString()}
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowEndTimePicker(true)}
              style={styles.dateTimeButton}
              icon="clock"
            >
              {meetingData.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Button>
          </View>

          {/* Duration Display */}
          <HelperText type="info" style={styles.durationText}>
            Duration: {Math.round((meetingData.endTime.getTime() - meetingData.startTime.getTime()) / (1000 * 60))} minutes
          </HelperText>

          {/* Attendees */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Attendees
          </Text>
          <View style={styles.attendeeInputRow}>
            <TextInput
              label="Email Address"
              value={newAttendee}
              onChangeText={setNewAttendee}
              mode="outlined"
              style={styles.attendeeInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="client@example.com"
            />
            <Button
              mode="contained"
              onPress={handleAddAttendee}
              style={styles.addButton}
              disabled={!newAttendee.trim()}
              icon="plus"
            >
              Add
            </Button>
          </View>

          {/* Attendee List */}
          {meetingData.attendees.length > 0 && (
            <View style={styles.attendeeList}>
              {meetingData.attendees.map((email, index) => (
                <Chip
                  key={index}
                  onClose={() => handleRemoveAttendee(email)}
                  style={styles.attendeeChip}
                  icon="account"
                >
                  {email}
                </Chip>
              ))}
            </View>
          )}

          {/* Helper Text */}
          <HelperText type="info" style={styles.helperText}>
            📧 Calendar invitations will be sent automatically to all attendees
          </HelperText>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={onCancel}
              style={styles.actionButton}
              disabled={isCreating}
              icon="close"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateMeeting}
              style={styles.actionButton}
              loading={isCreating}
              disabled={isCreating}
              icon="calendar-plus"
            >
              {isCreating ? 'Creating...' : 'Schedule Meeting'}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={meetingData.startTime}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
          minimumDate={new Date()}
          style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={meetingData.startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartTimeChange}
          style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={meetingData.endTime}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          minimumDate={new Date()}
          style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={meetingData.endTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndTimeChange}
          style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
        />
      )}

      {/* iOS Date Picker Dismiss Button */}
      {Platform.OS === 'ios' && (showStartDatePicker || showStartTimePicker || showEndDatePicker || showEndTimePicker) && (
        <View style={styles.iosPickerContainer}>
          <Button
            mode="contained"
            onPress={() => {
              setShowStartDatePicker(false);
              setShowStartTimePicker(false);
              setShowEndDatePicker(false);
              setShowEndTimePicker(false);
            }}
            style={styles.iosPickerDismiss}
          >
            Done
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  
  // Title Preview Styles
  titlePreviewContainer: {
    marginBottom: 16,
  },
  titlePreview: {
    marginTop: 8,
  },
  titlePreviewContent: {
    paddingVertical: 8,
  },
  titlePreviewText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
  },
  durationText: {
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  attendeeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 12,
  },
  attendeeInput: {
    flex: 1,
  },
  addButton: {
    paddingVertical: 8,
  },
  attendeeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  attendeeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  helperText: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  
  // iOS Date Picker Styles
  iosDatePicker: {
    backgroundColor: 'white',
  },
  iosPickerContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iosPickerDismiss: {
    alignSelf: 'center',
  },
});
