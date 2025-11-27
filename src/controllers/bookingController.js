// import User from "../models/User.js";
// import Booking from "../models/Booking.js";
// import { sendBookingEmails } from "../utils/email.js";
// import { createCalendarEvent } from "../utils/googleCalendar.js";

// export const createBooking = async (req, res) => {
//   try {
//     const { clientId, counselorId, date, time, durationMin, notes, amount, sessionType } = req.body;

//     // Fetch user details
//     const client = await User.findById(clientId);
//     const counselor = await User.findById(counselorId);
    
//     if (!client || !counselor) {
//       return res.status(404).json({ success: false, message: "Client or counselor not found" });
//     }

//     // Generate dummy Google Meet link for video sessions
//     const dummyMeetLink = sessionType === 'video' 
//       ? `https://meet.google.com/dummy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
//       : null;
    
//     // Generate chat room ID for chat sessions
//     const chatRoom = sessionType === 'chat' ? `${counselorId}_${clientId}` : null;

//     // Create booking with pending status (only confirmed after payment)
//     const booking = new Booking({ 
//       clientId, 
//       counselorId, 
//       date, 
//       time, 
//       durationMin, 
//       notes,
//       unit_amount,
//       sessionType: sessionType || 'video',
//       meetLink: dummyMeetLink,
//       chatRoom,
//       status: "pending" // Will be updated to "paid" after successful payment
//     });
//     await booking.save();

//     // Create Google Calendar event only for video sessions
//     if (sessionType === 'video') {
//       try {
//         const startISO = new Date(`${date}T${time}:00`).toISOString();
//         const endISO = new Date(new Date(startISO).getTime() + (durationMin || 60) * 60000).toISOString();

//         const summary = `HealPeer Video Session`;
//         const description = notes || "Video counseling session via Google Meet";

//         const calendarRes = await createCalendarEvent({
//           summary,
//           description,
//           startDateTimeISO: startISO,
//           endDateTimeISO: endISO,
//           attendees: [client.email, counselor.email]
//         });

//         booking.googleEventId = calendarRes.eventId;
//         booking.meetLink = calendarRes.meetLink || calendarRes.htmlLink || dummyMeetLink;
//         booking.calendarCreated = true;

//         await booking.save();

//       } catch (err) {
//         console.error("Calendar creation failed:", err);
//       }
//     }

//     // Send pre-payment email with tentative information
//     try {
//       await sendBookingEmails({
//         clientEmail: client.email,
//         clientName: client.name,
//         counselorEmail: counselor.email,
//         counselorName: counselor.name,
//         meetLink: booking.meetLink,
//         booking,
//         prePayment: true,
//         sessionType: booking.sessionType,
//         chatRoom: booking.chatRoom
//       });
//     } catch (err) {
//       console.error("Email sending failed:", err);
//     }

//     res.status(201).json({ success: true, booking });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /** Get all bookings */
// export const getAllBookings = async (req, res) => {
//   try {
//     // Populate client and counselor details if needed
//     const bookings = await Booking.find()
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email")
//       .sort({ createdAt: -1 }); // latest first

//     res.json({ success: true, bookings });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // Booking ByID... (get Single Booking For All Users by Admin)
// export const getBookingById = async (req, res) => {
//   try {
//     const { id } = req.params; // booking ID from route
//     const booking = await Booking.findById(id)
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email");

//     if (!booking) {
//       return res.status(404).json({ success: false, message: "Booking not found" });
//     }

//     res.json({ success: true, booking });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// /** Get all bookings of a specific client */
// export const getClientBookings = async (req, res) => {
//   try {
//     const { clientId } = req.params; // from URL

//     const bookings = await Booking.find({ clientId })
//       .populate("counselorId", "name email")
//       .populate("clientId", "name email")
//       .sort({ date: 1, time: 1 }); // sort by date & time ascending

//     if (!bookings || bookings.length === 0) {
//       return res.status(404).json({ success: false, message: "No bookings found for this client" });
//     }

//     res.json({ success: true, bookings });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// // GET booking by stripeSessionId
// export const getBookingBySession = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const booking = await Booking.findOne({ stripeSessionId: sessionId })
//       .populate("clientId counselorId");

//     if (!booking) {
//       return res.status(404).json({ success: false, message: "Booking not found" });
//     }

//     res.json({ success: true, booking });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /** Get active bookings for chat functionality */
// export const getActiveBookingsForChat = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const now = new Date();
    
//     // Find bookings where user is either client or counselor, payment is completed,
//     // and the session time is within the next 30 minutes or has started within the last hour
//     const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);
//     const oneHourFromNow = new Date(now.getTime() + 60 * 60000);
    
//     const bookings = await Booking.find({
//       $and: [
//         {
//           $or: [
//             { clientId: userId },
//             { counselorId: userId }
//           ]
//         },
//         { status: "paid" },
//         {
//           $expr: {
//             $and: [
//               { $gte: [{ $toDate: { $concat: ["$date", "T", "$time", ":00"] } }, thirtyMinutesAgo] },
//               { $lte: [{ $toDate: { $concat: ["$date", "T", "$time", ":00"] } }, oneHourFromNow] }
//             ]
//           }
//         }
//       ]
//     })
//     .populate("clientId", "name email")
//     .populate("counselorId", "name email")
//     .sort({ date: 1, time: 1 });

//     res.json({ success: true, bookings });
//   } catch (err) {
//     console.error("Error fetching active bookings:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import { sendBookingEmails } from "../utils/email.js";
import { createCalendarEvent } from "../utils/googleCalendar.js";

// CREATE BOOKING (pre-payment)
export const createBooking = async (req, res) => {
  try {
    const { clientId, counselorId, date, time, durationMin = 60, notes, amount, sessionType } = req.body;

    // Validate users
    const client = await User.findById(clientId);
    const counselor = await User.findById(counselorId);
    if (!client || !counselor)
      return res.status(404).json({ success: false, message: "Client or counselor not found" });

    // Generate links
    const dummyMeetLink = sessionType === "video" 
      ? `https://meet.google.com/dummy-${Date.now()}-${Math.random().toString(36).substring(2,9)}`
      : null;
    const chatRoom = sessionType === "chat" ? `${counselorId}_${clientId}` : null;

    // Create booking (pending until Stripe payment completes)
    const booking = new Booking({
      clientId,
      counselorId,
      date,
      time,
      durationMin,
      notes,
      amount, // store dollars, Stripe will convert
      sessionType,
      meetLink: dummyMeetLink,
      chatRoom,
      status: "pending"
    });

    await booking.save();

    // Create Google Calendar event for video
    if (sessionType === "video") {
      try {
        const startISO = new Date(`${date}T${time}:00`).toISOString();
        const endISO = new Date(new Date(startISO).getTime() + durationMin * 60000).toISOString();

        const calendarRes = await createCalendarEvent({
          summary: "HealPeer Video Session",
          description: notes || "Video counseling session",
          startDateTimeISO: startISO,
          endDateTimeISO: endISO,
          attendees: [client.email, counselor.email]
        });

        booking.googleEventId = calendarRes.eventId;
        booking.meetLink = calendarRes.meetLink || calendarRes.htmlLink || dummyMeetLink;
        booking.calendarCreated = true;
        await booking.save();

      } catch (err) {
        console.error("Calendar creation failed:", err);
      }
    }

    // Pre-payment email
    try {
      await sendBookingEmails({
        clientEmail: client.email,
        clientName: client.name,
        counselorEmail: counselor.email,
        counselorName: counselor.name,
        meetLink: booking.meetLink,
        booking,
        prePayment: true,
        sessionType,
        chatRoom
      });
    } catch (err) {
      console.error("Email sending failed:", err);
    }

    res.status(201).json({ success: true, booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL BOOKINGS
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("clientId", "name email")
      .populate("counselorId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BOOKING BY ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("clientId", "name email")
      .populate("counselorId", "name email");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BOOKINGS BY CLIENT
export const getClientBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ clientId: req.params.clientId })
      .populate("clientId", "name email")
      .populate("counselorId", "name email")
      .sort({ date: 1, time: 1 });

    if (!bookings || bookings.length === 0)
      return res.status(404).json({ success: false, message: "No bookings found" });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BOOKING BY STRIPE SESSION ID
export const getBookingBySession = async (req, res) => {
  try {
    const booking = await Booking.findOne({ stripeSessionId: req.params.sessionId })
      .populate("clientId counselorId");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


/** Get active bookings for chat functionality */
export const getActiveBookingsForChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    
    // Find bookings where user is either client or counselor, payment is completed,
    // and the session time is within the next 30 minutes or has started within the last hour
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60000);
    
    const bookings = await Booking.find({
      $and: [
        {
          $or: [
            { clientId: userId },
            { counselorId: userId }
          ]
        },
        { status: "paid" },
        {
          $expr: {
            $and: [
              { $gte: [{ $toDate: { $concat: ["$date", "T", "$time", ":00"] } }, thirtyMinutesAgo] },
              { $lte: [{ $toDate: { $concat: ["$date", "T", "$time", ":00"] } }, oneHourFromNow] }
            ]
          }
        }
      ]
    })
    .populate("clientId", "name email")
    .populate("counselorId", "name email")
    .sort({ date: 1, time: 1 });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Error fetching active bookings:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
