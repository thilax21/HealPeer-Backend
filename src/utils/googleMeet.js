import { google } from "googleapis";
import { getGoogleAuthClient } from "../config/google.js";

export const createGoogleMeetLink = async (date, time, duration) => {
  const auth = await getGoogleAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + duration * 60000);

  const event = {
    summary: "HealPeer Counseling Session",
    start: { dateTime: start },
    end: { dateTime: end },
    conferenceData: {
      createRequest: { requestId: `${Date.now()}` }
    }
  };

  const result = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  return result.data.hangoutLink;
};
