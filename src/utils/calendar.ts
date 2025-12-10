import AsyncStorage from "@react-native-async-storage/async-storage";

const createCalendarId = async (providerToken: string): Promise<string> => {
  // Get the user's list of calendars
  const calendarListResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
    headers: {
      Authorization: `Bearer ${providerToken}`,
    },
  });

  if (!calendarListResponse.ok) {
    const errorText = await calendarListResponse.text();
    console.error("Calendar List API Error:", errorText);
    throw new Error(`Failed to fetch calendar list: ${errorText}`);
  }

  const calendarList = await calendarListResponse.json();

  // Look for existing calendar
  const appCalendar = calendarList.items?.find((cal: any) => cal.summary === "Silent Bridge Appointments");
  if (appCalendar) {
    await AsyncStorage.setItem("calendarId", appCalendar.id);
    return appCalendar.id;
  } else {
    // Create new calendar
    const createCalendarResponse = await fetch("https://www.googleapis.com/calendar/v3/calendars", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: "Silent Bridge Appointments",
      }),
    });

    if (!createCalendarResponse.ok) {
      const errorText = await createCalendarResponse.text();
      console.error("Create Calendar API Error:", errorText);
      throw new Error(`Failed to create calendar: ${errorText}`);
    }

    const appCalendar = await createCalendarResponse.json();
    await AsyncStorage.setItem("calendarId", appCalendar.id);
    return appCalendar.id;
  }
}

export const getCalendarId = async (providerToken: string): Promise<string> => {
  const storedCalendarId = await AsyncStorage.getItem("calendarId");
  if (storedCalendarId) {
    return storedCalendarId;
  } else {
    return await createCalendarId(providerToken);
  }
};