import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Using Service Account JSON key (recommended for server-to-server)
const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
if (!keyFile || !fs.existsSync(keyFile)) {
  console.warn("Google service account JSON not found; set GOOGLE_SERVICE_ACCOUNT_KEY_PATH.");
}

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

let authClient;
if (keyFile && fs.existsSync(keyFile)) {
  const keys = JSON.parse(fs.readFileSync(keyFile));
  authClient = new google.auth.JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: SCOPES,
    subject: process.env.GOOGLE_IMPERSONATE_EMAIL || undefined // Optional: impersonate a user in GSuite
  });
}

/**
 * createCalendarEvent
 * Creates a Google Calendar event with conference (Google Meet) and returns { eventId, meetLink, htmlLink, start, end }
 */
export async function createCalendarEvent({ summary, description, startDateTimeISO, endDateTimeISO, attendees = [] }) {
  if (!authClient) throw new Error("Google auth not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH and enable Calendar API.");

  const calendar = google.calendar({ version: "v3", auth: authClient });
  // ensure auth
  await authClient.authorize();

  const event = {
    summary,
    description,
    start: { dateTime: startDateTimeISO },
    end: { dateTime: endDateTimeISO },
    attendees: attendees.map(email => ({ email })),
    conferenceData: { createRequest: { requestId: `meet-${Date.now()}` } }
  };

  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    resource: event,
    conferenceDataVersion: 1
  });

  const created = res.data;
  const meetLink = created.conferenceData?.entryPoints?.find(e => e.entryPointType === "video")?.uri || created.hangoutLink || null;
  return {
    eventId: created.id,
    meetLink,
    htmlLink: created.htmlLink,
    start: created.start,
    end: created.end
  };
}
