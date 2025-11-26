import User from "../models/User.js";
import Booking from "../models/Booking.js";
import { sendBookingEmails } from "../utils/email.js";
import { createCalendarEvent } from "../utils/googleCalendar.js";

export const createBooking = async (req, res) => {
  try {
    const { clientId, counselorId, date, time, durationMin, notes, amount, sessionType } = req.body;

    // Fetch user details
    const client = await User.findById(clientId);
    const counselor = await User.findById(counselorId);
    
    if (!client || !counselor) {
      return res.status(404).json({ success: false, message: "Client or counselor not found" });
    }

    // Generate dummy Google Meet link for both session types
    const dummyMeetLink = `https://meet.google.com/dummy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate chat room ID for chat sessions
    const chatRoom = sessionType === 'chat' ? `${counselorId}_${clientId}_${Date.now()}` : null;

    // 1️⃣ Create booking
    const booking = new Booking({ 
      clientId, 
      counselorId, 
      date, 
      time, 
      durationMin, 
      notes, 
      amount, 
      sessionType: sessionType || 'video',
      meetLink: dummyMeetLink,
      chatRoom
    });
    await booking.save();

    // 2️⃣ Create Google Calendar event
    try {
      const startISO = new Date(`${date}T${time}:00`).toISOString();
      const endISO = new Date(new Date(startISO).getTime() + (durationMin || 60) * 60000).toISOString();

      const summary = `HealPeer session`;
      const description = notes || "Counseling session via Google Meet";

      const calendarRes = await createCalendarEvent({
        summary,
        description,
        startDateTimeISO: startISO,
        endDateTimeISO: endISO,
        attendees: [client.email, counselor.email]
      });

      booking.googleEventId = calendarRes.eventId;
      // Keep the dummy meetLink for chat sessions, update for video sessions
      if (sessionType === 'video') {
        booking.meetLink = calendarRes.meetLink || calendarRes.htmlLink || dummyMeetLink;
      }
      booking.calendarCreated = true;

      await booking.save();

    } catch (err) {
      console.error("Calendar creation failed:", err);
    }

    // Send pre-payment email
    try {
      await sendBookingEmails({
        clientEmail: client.email,
        clientName: client.name,
        counselorEmail: counselor.email,
        counselorName: counselor.name,
        meetLink: booking.meetLink,
        booking,
        prePayment: true,
        sessionType: booking.sessionType,
        chatRoom: booking.chatRoom
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

/** Get all bookings */
export const getAllBookings = async (req, res) => {
  try {
    // Populate client and counselor details if needed
    const bookings = await Booking.find()
      .populate("clientId", "name email")
      .populate("counselorId", "name email")
      .sort({ createdAt: -1 }); // latest first

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Booking ByID... (get Single Booking For All Users by Admin)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params; // booking ID from route
    const booking = await Booking.findById(id)
      .populate("clientId", "name email")
      .populate("counselorId", "name email");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


/** Get all bookings of a specific client */
export const getClientBookings = async (req, res) => {
  try {
    const { clientId } = req.params; // from URL

    const bookings = await Booking.find({ clientId })
      .populate("counselorId", "name email")
      .populate("clientId", "name email")
      .sort({ date: 1, time: 1 }); // sort by date & time ascending

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ success: false, message: "No bookings found for this client" });
    }

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET booking by stripeSessionId
export const getBookingBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const booking = await Booking.findOne({ stripeSessionId: sessionId })
      .populate("clientId counselorId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
