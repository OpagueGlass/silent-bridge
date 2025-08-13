// services/MeetService.js
import { auth } from '../utils/firebase';
import { Linking, Alert } from 'react-native';
import { CalendarService } from './CalendarService';

export class MeetService {
  /**
   * Method 1: Quick Google Meet (existing)
   */
  static async startQuickVideoCall() {
    try {
      const meetUrl = 'https://meet.google.com/new';
      const supported = await Linking.canOpenURL(meetUrl);
      
      if (supported) {
        await Linking.openURL(meetUrl);
        return {
          success: true,
          message: 'Google Meet opened successfully',
          type: 'quick_meet'
        };
      } else {
        throw new Error('Cannot open Google Meet');
      }
    } catch (error) {
      console.error('Failed to start quick video call:', error);
      throw error;
    }
  }

  /**
   * Method 2: Create scheduled meeting via Google Calendar (UPDATED)
   */
  static async createScheduledMeeting(meetingDetails) {
    try {
      // Check if user has calendar access
      const hasAccess = await CalendarService.checkCalendarAccess();
      if (!hasAccess) {
        throw new Error('Calendar access not available. Please check permissions and sign in again.');
      }

      console.log('Creating meeting with details:', meetingDetails);

      // Create calendar event with Google Meet
      const result = await CalendarService.createCalendarEvent({
        title: meetingDetails.title, // 现在使用自动生成的标题
        description: meetingDetails.description,
        startTime: meetingDetails.startTime,
        endTime: meetingDetails.endTime,
        attendees: meetingDetails.attendees,
        timeZone: meetingDetails.timeZone,
      });

      return {
        success: true,
        meetingUrl: result.meetingUrl,
        eventId: result.eventId,
        calendarLink: result.calendarLink,
        type: 'scheduled_meet',
        details: {
          ...result,
          title: meetingDetails.title, // 包含自动生成的标题
        },
      };
    } catch (error) {
      console.error('Failed to create scheduled meeting:', error);
      throw error;
    }
  }

  /**
   * Method 3: Create meet with custom meeting ID (existing)
   */
  static async createCustomMeeting(meetingId) {
    try {
      const meetUrl = `https://meet.google.com/${meetingId}`;
      const supported = await Linking.canOpenURL(meetUrl);
      
      if (supported) {
        await Linking.openURL(meetUrl);
        return {
          success: true,
          meetingUrl: meetUrl,
          meetingId: meetingId,
          type: 'custom_meet'
        };
      } else {
        throw new Error('Cannot open meeting URL');
      }
    } catch (error) {
      console.error('Failed to create custom meeting:', error);
      throw error;
    }
  }

  /**
   * Get upcoming meetings (existing)
   */
  static async getUpcomingMeetings() {
    try {
      const result = await CalendarService.getUpcomingEvents();
      
      // Filter events that have Google Meet links
      const meetingEvents = result.events.filter(event => 
        event.conferenceData?.entryPoints?.some(entry => 
          entry.entryPointType === 'video' && entry.uri?.includes('meet.google.com')
        )
      );

      return {
        success: true,
        meetings: meetingEvents.map(event => ({
          id: event.id,
          title: event.summary,
          description: event.description,
          startTime: event.start.dateTime || event.start.date,
          endTime: event.end.dateTime || event.end.date,
          meetingUrl: event.conferenceData?.entryPoints?.find(entry => 
            entry.entryPointType === 'video'
          )?.uri,
          calendarLink: event.htmlLink,
          attendees: event.attendees || [],
        })),
      };
    } catch (error) {
      console.error('Failed to get upcoming meetings:', error);
      throw error;
    }
  }

  /**
   * Join existing meeting (existing)
   */
  static async joinMeeting(meetingUrl) {
    try {
      const supported = await Linking.canOpenURL(meetingUrl);
      
      if (supported) {
        await Linking.openURL(meetingUrl);
        return {
          success: true,
          message: 'Joined meeting successfully'
        };
      } else {
        throw new Error('Cannot open meeting URL');
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled meeting (existing)
   */
  static async cancelScheduledMeeting(eventId) {
    try {
      await CalendarService.deleteCalendarEvent(eventId);
      return {
        success: true,
        message: 'Meeting cancelled successfully'
      };
    } catch (error) {
      console.error('Failed to cancel meeting:', error);
      throw error;
    }
  }
}
