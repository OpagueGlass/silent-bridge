// services/CalendarService.js
import { auth } from '../utils/firebase';

export class CalendarService {
  static BASE_URL = 'https://www.googleapis.com/calendar/v3';

  /**
   * Get user's access token    
   */
  static async getAccessToken() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not logged in');
    }
    return await user.getIdToken();
  }

  /**
   * Create a calendar event with Google Meet
   */
  static async createCalendarEvent(eventDetails) {
    try {
      const token = await this.getAccessToken();
      
      const calendarEvent = {
        summary: eventDetails.title || 'Interpretation Session',
        description: eventDetails.description || 'Video call for interpretation services',
        start: {
          dateTime: eventDetails.startTime,
          timeZone: eventDetails.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: eventDetails.endTime,
          timeZone: eventDetails.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: eventDetails.attendees?.map(email => ({ email })) || [],
        conferenceData: {
          createRequest: {
            requestId: `meet_${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 15 },      // 15 minutes before
          ],
        },
      };

      console.log('Creating calendar event:', calendarEvent);

      const response = await fetch(
        `${this.BASE_URL}/calendars/primary/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Calendar API Error:', errorData);
        throw new Error(`Failed to create calendar event: ${errorData.error?.message || response.statusText}`);
      }

      const event = await response.json();
      console.log('Calendar event created:', event);

      return {
        success: true,
        eventId: event.id,
        meetingUrl: event.conferenceData?.entryPoints?.[0]?.uri,
        calendarLink: event.htmlLink,
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
        attendees: event.attendees || [],
      };
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  /**
   * Get user's calendar events
   */
  static async getUpcomingEvents(maxResults = 10) {
    try {
      const token = await this.getAccessToken();
      
      const now = new Date();
      const timeMin = now.toISOString();
      
      const response = await fetch(
        `${this.BASE_URL}/calendars/primary/events?timeMin=${timeMin}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      
      return {
        success: true,
        events: data.items || [],
      };
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      throw error;
    }
  }

  /**
   * Update calendar event
   */
  static async updateCalendarEvent(eventId, eventDetails) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.BASE_URL}/calendars/primary/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventDetails),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update calendar event');
      }

      const event = await response.json();
      return {
        success: true,
        event,
      };
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete calendar event
   */
  static async deleteCalendarEvent(eventId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.BASE_URL}/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete calendar event');
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      throw error;
    }
  }

  /**
   * Check if user has calendar access
   */
  static async checkCalendarAccess() {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.BASE_URL}/calendars/primary`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to check calendar access:', error);
      return false;
    }
  }
}
