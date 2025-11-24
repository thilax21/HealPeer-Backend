import Booking from "../models/Booking.js";
import User from "../models/User.js";

// /** Create a booking (pending) */
// export const createBooking = async (req, res) => {
//   try {
//     const { counselorId, clientId, date, time, durationMin, amount, notes } = req.body;
//     // basic validation omitted for brevity
//     const booking = await Booking.create({
//       counselorId, clientId, date, time, durationMin: durationMin || 60, amount, notes
//     });
//     res.json({ success: true, booking });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const createBooking = async (req, res) => {
  try {
    const { clientId, counselorId, date, time, durationMin, notes, amount } = req.body;

    // 1️⃣ Create booking
    const booking = new Booking({ clientId, counselorId, date, time, durationMin, notes, amount });
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
        attendees: [/* client email */, /* counselor email */]
      });

      booking.googleEventId = calendarRes.eventId;
      booking.meetLink = calendarRes.meetLink || calendarRes.htmlLink || "";
      booking.calendarCreated = true;

      await booking.save();

      // Optional: send pre-payment email
      await sendBookingEmails({
        clientEmail: booking.clientId.email,
        clientName: booking.clientId.name,
        counselorEmail: booking.counselorId.email,
        counselorName: booking.counselorId.name,
        meetLink: booking.meetLink,
        booking,
        prePayment: true
      });

    } catch (err) {
      console.error("Calendar creation failed:", err);
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



