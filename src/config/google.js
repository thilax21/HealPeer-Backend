// import { google } from "googleapis";
// import dotenv from "dotenv";
// dotenv.config();

// export function getGoogleAuthClient(actingAccountEmail) {
//   const jwtClient = new google.auth.JWT({
//     email: process.env.GOOGLE_CLIENT_EMAIL,
//     key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     scopes: ["https://www.googleapis.com/auth/calendar"],
//     subject: actingAccountEmail || process.env.GOOGLE_ACTING_ACCOUNT // delegated user
//   });
//   return jwtClient;
// }

// src/config/google.js
// import { google } from "googleapis";

// export const getGoogleCalendarClient = () => {
//   const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
//   let privateKey = process.env.GOOGLE_PRIVATE_KEY;
//   if (!clientEmail || !privateKey) throw new Error("Missing Google service account env vars");
//   privateKey = privateKey.replace(/\\n/g, "\n");

//   const auth = new google.auth.JWT({
//     email: clientEmail,
//     key: privateKey,
//     scopes: ["https://www.googleapis.com/auth/calendar"],
//   });

//   const calendar = google.calendar({ version: "v3", auth });
//   return calendar;
// };
