



// controllers/bookingController.js
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import { sendBookingEmails } from "../utils/email.js";
import { createCalendarEvent } from "../utils/googleCalendar.js";

export const createBooking = async (req, res) => {
  try {
    const {
      clientId,
      counselorId,
      date,
      time,
      durationMin = 60,
      notes,
      sessionType,
    } = req.body;

    // 1) Validate users
    const client = await User.findById(clientId);
    const counselor = await User.findById(counselorId);
    if (!client || !counselor) {
      return res
        .status(404)
        .json({ success: false, message: "Client or counselor not found" });
    }

    // 2) Compute start & end DateTime for this requested session
    const minutes = durationMin || 60;
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + minutes * 60000);

    // 3) Check for overlapping bookings for this counselor
    //    Condition: existing.start < new.end && existing.end > new.start
    //    Include both "pending" (reservation) and "paid" (confirmed) bookings.

    
    // const overlappingBooking = await Booking.findOne({
    //   counselorId,
    //   status: { $in: ["pending", "paid"] },
    //   startDateTime: { $lt: endDateTime },
    //   endDateTime: { $gt: startDateTime },
    // });

    // if (overlappingBooking) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "This counselor already has a booking that overlaps with the selected time. Please choose another slot.",
    //   });
    // }

    // 4) Calculate amount based on duration (hourly rate * hours)
    const hourlyRate = counselor.pricePerSession || 1000; // Rs.1000 default
    const durationHours = minutes / 60;
    const amount = Math.round(hourlyRate * durationHours);

    // 5) Generate links
    const dummyMeetLink =
      sessionType === "video"
        ? `https://meet.google.com/dummy-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`
        : null;
    const chatRoom =
      sessionType === "chat" ? `${counselorId}_${clientId}` : null;

    // 6) Create booking with status "pending"
    const booking = new Booking({
      clientId,
      counselorId,
      date,
      time,
      durationMin: minutes,
      notes,
      amount,
      sessionType,
      meetLink: dummyMeetLink,
      chatRoom,
      status: "pending",
      paymentStatus: "pending",
      startDateTime,
      endDateTime,
    });

    await booking.save();

    // 7) Optional: create Calendar event for video
    if (sessionType === "video") {
      try {
        const startISO = startDateTime.toISOString();
        const endISO = endDateTime.toISOString();

        const calendarRes = await createCalendarEvent({
          summary: "HealPeer Video Session",
          description: notes || "Video counseling session",
          startDateTimeISO: startISO,
          endDateTimeISO: endISO,
          attendees: [client.email, counselor.email],
        });

        booking.googleEventId = calendarRes.eventId;
        booking.meetLink =
          calendarRes.meetLink || calendarRes.htmlLink || dummyMeetLink;
        booking.calendarCreated = true;
        await booking.save();
      } catch (err) {
        console.error("Calendar creation failed:", err);
      }
    }

    // 8) Pre-payment email
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
        chatRoom,
      });
    } catch (err) {
      console.error("Email sending failed:", err);
    }

    return res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

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



// GET BOOKINGS BY CLIENT (paid or pending via ?status=)
// GET BOOKINGS BY CLIENT (paid or pending via ?status=)
export const getClientBookings = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status } = req.query; // "pending" | "paid" | undefined

    const filter = { clientId };

    if (status === "pending") {
      // only pending bookings
      filter.status = "pending";
    } else {
      // default: fully paid bookings
      filter.status = "paid";
      filter.paymentStatus = "completed";
    }

    const bookings = await Booking.find(filter)
      .populate("clientId", "name email")
      .populate("counselorId", "name email")
      .sort({ date: 1, time: 1 });

    // ✅ always 200, even if empty
    return res.json({
      success: true,
      bookings: bookings || [],
    });
  } catch (err) {
    console.error("getClientBookings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BOOKINGS BY COUNSELOR (paid or pending via ?status=)
// GET BOOKINGS BY COUNSELOR (paid or pending via ?status=)
export const getCounselorBookings = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { status } = req.query;

    const filter = { counselorId };

    if (status === "pending") {
      filter.status = "pending";
    } else {
      filter.status = "paid";
      filter.paymentStatus = "completed";
    }

    const bookings = await Booking.find(filter)
      .populate("clientId", "name email")
      .populate("counselorId", "name email")
      .sort({ date: 1, time: 1 });

    return res.json({
      success: true,
      bookings: bookings || [],
    });
  } catch (err) {
    console.error("getCounselorBookings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};







// // controllers/bookingController.js
// import User from "../models/User.js";
// import Booking from "../models/Booking.js";
// import { sendBookingEmails } from "../utils/email.js";
// import { createCalendarEvent } from "../utils/googleCalendar.js";
// import { streamClient } from "../config/streamVideo.js";


// // controllers/bookingController.js

// export const createBooking = async (req, res) => {
//   try {
//     const {
//       clientId,
//       counselorId,
//       date,
//       time,
//       durationMin = 60,
//       notes,
//       sessionType,
//     } = req.body;

//     // 1) Validate users
//     const client = await User.findById(clientId);
//     const counselor = await User.findById(counselorId);
//     if (!client || !counselor) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Client or counselor not found" });
//     }

//     if (!date || !time) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Date and time are required" });
//     }

//     // 2) Compute start & end DateTime for this requested session
//     const minutes = parseInt(durationMin, 10) || 60;
//     const startDateTime = new Date(`${date}T${time}:00`);
//     const endDateTime = new Date(startDateTime.getTime() + minutes * 60000);

//     // 3) Overlap check: same counselor, time overlapping, status pending or paid
//     const overlappingBooking = await Booking.findOne({
//       counselorId,
//       status: { $in: ["pending", "paid"] },
//       startDateTime: { $lt: endDateTime },
//       endDateTime: { $gt: startDateTime },
//     });

//     if (overlappingBooking) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "This counselor already has a booking that overlaps with the selected time. Please choose another slot.",
//       });
//     }

//     // 4) Calculate amount based on counselor's hourly rate and duration
//     const hourlyRate = counselor.pricePerSession || 1000; // Rs.1000 default
//     const durationHours = minutes / 60;
//     const amount = Math.round(hourlyRate * durationHours);

//     // 5) Create booking object (pending until payment)
//     const booking = new Booking({
//       clientId,
//       counselorId,
//       date,
//       time,
//       durationMin: minutes,
//       notes,
//       amount,
//       sessionType,
//       status: "pending",
//       paymentStatus: "pending",
//       startDateTime,
//       endDateTime,
//     });

//     // 6) Create Stream Video call for this booking if it's a video session
//     if (sessionType === "video" && streamClient) {
//       try {
//         const callId = booking._id.toString();
//         const call = streamClient.video.call("default", callId);
    
//         await call.getOrCreate({
//           created_by_id: counselor._id.toString(),
//           members: [
//             { user_id: client._id.toString(), role: "user" },
//             { user_id: counselor._id.toString(), role: "user" },
//           ],
//         });
    
//         booking.meetLink = `${process.env.FRONTEND_URL}/video/${callId}`;
//       } catch (err) {
//         console.error("Stream Video call creation failed:", err);
//       }
//     } else if (sessionType === "chat") {
//       booking.chatRoom = `${counselorId}_${clientId}`;
//     }

//     await booking.save();

  
//     // 8) Send pre-payment email with meetLink (Stream URL)
//     try {
//       await sendBookingEmails({
//         clientEmail: client.email,
//         clientName: client.name,
//         counselorEmail: counselor.email,
//         counselorName: counselor.name,
//         meetLink: booking.meetLink, // this is your /video/:bookingId URL
//         booking,
//         prePayment: true,
//         sessionType,
//         chatRoom: booking.chatRoom,
//       });
//     } catch (err) {
//       console.error("Email sending failed:", err);
//     }

//     return res.status(201).json({ success: true, booking });
//   } catch (err) {
//     console.error("createBooking error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email")
//       .sort({ createdAt: -1 });
//     res.json({ success: true, bookings });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET BOOKING BY ID
// export const getBookingById = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email");

//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

//     res.json({ success: true, booking });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



// // GET BOOKING BY STRIPE SESSION ID
// export const getBookingBySession = async (req, res) => {
//   try {
//     const booking = await Booking.findOne({ stripeSessionId: req.params.sessionId })
//       .populate("clientId counselorId");

//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

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



// // GET BOOKINGS BY CLIENT (paid or pending via ?status=)
// // GET BOOKINGS BY CLIENT (paid or pending via ?status=)
// export const getClientBookings = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const { status } = req.query; // "pending" | "paid" | undefined

//     const filter = { clientId };

//     if (status === "pending") {
//       // only pending bookings
//       filter.status = "pending";
//     } else {
//       // default: fully paid bookings
//       filter.status = "paid";
//       filter.paymentStatus = "completed";
//     }

//     const bookings = await Booking.find(filter)
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email")
//       .sort({ date: 1, time: 1 });

//     // ✅ always 200, even if empty
//     return res.json({
//       success: true,
//       bookings: bookings || [],
//     });
//   } catch (err) {
//     console.error("getClientBookings error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET BOOKINGS BY COUNSELOR (paid or pending via ?status=)
// // GET BOOKINGS BY COUNSELOR (paid or pending via ?status=)
// export const getCounselorBookings = async (req, res) => {
//   try {
//     const { counselorId } = req.params;
//     const { status } = req.query;

//     const filter = { counselorId };

//     if (status === "pending") {
//       filter.status = "pending";
//     } else {
//       filter.status = "paid";
//       filter.paymentStatus = "completed";
//     }

//     const bookings = await Booking.find(filter)
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email")
//       .sort({ date: 1, time: 1 });

//     return res.json({
//       success: true,
//       bookings: bookings || [],
//     });
//   } catch (err) {
//     console.error("getCounselorBookings error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



