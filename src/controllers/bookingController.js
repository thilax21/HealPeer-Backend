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



// CREATE BOOKING (pre-payment)
// export const createBooking = async (req, res) => {
//   try {
//     const { clientId, counselorId, date, time, durationMin = 60, notes, amount, sessionType } = req.body;

//     // Validate users
//     const client = await User.findById(clientId);
//     const counselor = await User.findById(counselorId);
//     if (!client || !counselor)
//       return res.status(404).json({ success: false, message: "Client or counselor not found" });

//     // Generate links
//     const dummyMeetLink = sessionType === "video" 
//       ? `https://meet.google.com/dummy-${Date.now()}-${Math.random().toString(36).substring(2,9)}`
//       : null;
//     const chatRoom = sessionType === "chat" ? `${counselorId}_${clientId}` : null;

//     // Create booking (pending until Stripe payment completes)
//     const booking = new Booking({
//       clientId,
//       counselorId,
//       date,
//       time,
//       durationMin,
//       notes,
//       amount: amount || 1000, // Default to Rs.1000 per counselor
//       sessionType,
//       meetLink: dummyMeetLink,
//       chatRoom,
//       status: "pending"
//     });

//     await booking.save();

//     // Create Google Calendar event for video
//     if (sessionType === "video") {
//       try {
//         const startISO = new Date(`${date}T${time}:00`).toISOString();
//         const endISO = new Date(new Date(startISO).getTime() + durationMin * 60000).toISOString();

//         const calendarRes = await createCalendarEvent({
//           summary: "HealPeer Video Session",
//           description: notes || "Video counseling session",
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

//     // Pre-payment email
//     try {
//       await sendBookingEmails({
//         clientEmail: client.email,
//         clientName: client.name,
//         counselorEmail: counselor.email,
//         counselorName: counselor.name,
//         meetLink: booking.meetLink,
//         booking,
//         prePayment: true,
//         sessionType,
//         chatRoom
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

// import User from "../models/User.js";
// import Booking from "../models/Booking.js";
// import { sendBookingEmails } from "../utils/email.js";
// import { generateStreamToken } from "../lib/stream.js";

// export const createBooking = async (req, res) => {
//   try {
//     const {
//       clientId,
//       counselorId,
//       date,
//       time,
//       durationMin = 60,
//       notes,
//       amount,
//       sessionType,
//     } = req.body;

//     const client = await User.findById(clientId);
//     const counselor = await User.findById(counselorId);
//     if (!client || !counselor)
//       return res.status(404).json({ success: false, message: "Client or counselor not found" });

//     let meetLink = null;
//     let chatRoom = null;

//     if (sessionType === "video") {
//       const streamRoomId = `${counselorId}_${clientId}_${Date.now()}`;
//       const token = generateStreamToken(clientId);
  
//       meetLink = `${process.env.FRONTEND_URL}/call/${streamRoomId}?token=${token}`;
//   } else if (sessionType === "chat") {
//       chatRoom = `${counselorId}_${clientId}`;
//     }

//     const booking = new Booking({
//       clientId,
//       counselorId,
//       date,
//       time,
//       durationMin,
//       notes,
//       amount: amount || 1000,
//       sessionType,
//       meetLink,
//       chatRoom,
//       status: "pending",
//     });

//     await booking.save();

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
//         chatRoom: booking.chatRoom,
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


// // CREATE BOOKING (pre-payment) with Stream Video Call
// // export const createBooking = async (req, res) => {
// //   try {
// //     const {
// //       clientId,
// //       counselorId,
// //       date,
// //       time,
// //       durationMin = 60,
// //       notes,
// //       amount,
// //       sessionType,
// //     } = req.body;

// //     // 1️⃣ Validate users
// //     const client = await User.findById(clientId);
// //     const counselor = await User.findById(counselorId);
// //     if (!client || !counselor)
// //       return res.status(404).json({ success: false, message: "Client or counselor not found" });

// //     // 2️⃣ Generate Stream Video Call link for video sessions
// //     let meetLink = null;
// //     let chatRoom = null;

// //     if (sessionType === "video") {
// //       const streamRoomId = `${counselorId}_${clientId}_${Date.now()}`;
// //       const token = generateStreamToken(clientId); // token for client, can generate for counselor too
// //       meetLink = `${process.env.FRONTEND_URL}/call/${streamRoomId}?token=${token}`;
// //     } else if (sessionType === "chat") {
// //       chatRoom = `${counselorId}_${clientId}`;
// //     }

// //     // 3️⃣ Create booking (pending payment)
// //     const booking = new Booking({
// //       clientId,
// //       counselorId,
// //       date,
// //       time,
// //       durationMin,
// //       notes,
// //       amount: amount || 1000, // default LKR 1000
// //       sessionType,
// //       meetLink, // Stream Video Call URL or null
// //       chatRoom, // chat room for chat sessions
// //       status: "pending",
// //     });

// //     await booking.save();

// //     // 4️⃣ Send pre-payment email
// //     try {
// //       await sendBookingEmails({
// //         clientEmail: client.email,
// //         clientName: client.name,
// //         counselorEmail: counselor.email,
// //         counselorName: counselor.name,
// //         meetLink: booking.meetLink,
// //         booking,
// //         prePayment: true,
// //         sessionType: booking.sessionType,
// //         chatRoom: booking.chatRoom,
// //       });
// //     } catch (err) {
// //       console.error("Email sending failed:", err);
// //     }

// //     res.status(201).json({ success: true, booking });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };



// // // GET ALL BOOKINGS
// // export const getAllBookings = async (req, res) => {
// //   try {
// //     const bookings = await Booking.find()
// //       .populate("clientId", "name email")
// //       .populate("counselorId", "name email")
// //       .sort({ createdAt: -1 });
// //     res.json({ success: true, bookings });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

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

// // GET BOOKINGS BY CLIENT
// export const getClientBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ clientId: req.params.clientId })
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email")
//       .sort({ date: 1, time: 1 });

//     if (!bookings || bookings.length === 0)
//       return res.status(404).json({ success: false, message: "No bookings found" });

//     res.json({ success: true, bookings });
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


// // GET BOOKINGS BY COUNSELOR

// export const getCounselorBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ counselorId: req.params.counselorId })
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email")
//       .sort({ date: 1, time: 1 });

//     if (!bookings || bookings.length === 0)
//       return res.status(404).json({ success: false, message: "No bookings found" });

//     res.json({ success: true, bookings });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// // src/controllers/bookingController.js
// import Booking from "../models/Booking.js";
// import User from "../models/User.js";
// import { sendBookingEmails } from "../utils/email.js";
// import { generateStreamToken } from "../lib/stream.js";

// /**
//  * Create a booking (pending payment).
//  * - sessionType: "video" | "chat"
//  * - For video: creates a roomId and generates a server-side token, builds a meetLink
//  */
// export const createBooking = async (req, res) => {
//   try {
//     const {
//       clientId,
//       counselorId,
//       date,
//       time,
//       durationMin = 60,
//       notes,
//       amount,
//       sessionType = "video",
//     } = req.body;

//     // Basic validation
//     if (!clientId || !counselorId || !date || !time)
//       return res.status(400).json({ success: false, message: "Missing required fields" });

//     // Load users
//     const client = await User.findById(clientId).select("_id name email");
//     const counselor = await User.findById(counselorId).select("_id name email pricePerSession");
//     if (!client || !counselor)
//       return res.status(404).json({ success: false, message: "Client or counselor not found" });

//     // Build meeting / chat details
//     let meetLink = null;
//     let chatRoom = null;
//     let roomId = null;
//     if (sessionType === "video") {
//       roomId = `${counselorId}_${clientId}_${Date.now()}`;
//       // token created server-side using API secret
//       const token = generateStreamToken(clientId);
//       // frontend route to open in-app Stream call UI (frontend must use token to init client)
//       meetLink = `${process.env.FRONTEND_URL}/call/${roomId}?token=${encodeURIComponent(token)}&userId=${clientId}`;
//     } else if (sessionType === "chat") {
//       chatRoom = `${counselorId}_${clientId}`;
//     }

//     // amount fallback
//     const finalAmount = amount ?? counselor.pricePerSession ?? 1000;

//     // Create booking (status: pending)
//     const booking = new Booking({
//       clientId,
//       counselorId,
//       date,
//       time,
//       durationMin,
//       notes,
//       amount: finalAmount,
//       sessionType,
//       meetLink,
//       chatRoom,
//       roomId,
//       status: "pending", // pending until payment completed
//       paymentStatus: "pending",
//     });

//     await booking.save();

//     // Send pre-payment email (best-effort)
//     try {
//       await sendBookingEmails({
//         clientEmail: client.email,
//         clientName: client.name,
//         counselorEmail: counselor.email,
//         counselorName: counselor.name,
//         booking,
//         prePayment: true,
//         sessionType: booking.sessionType,
//         meetLink: booking.meetLink,
//         chatRoom: booking.chatRoom,
//       });
//     } catch (err) {
//       console.error("Pre-payment email failed:", err?.message || err);
//     }

//     return res.status(201).json({ success: true, booking });
//   } catch (err) {
//     console.error("createBooking error:", err);
//     return res.status(500).json({ success: false, message: err.message || "Server error" });
//   }
// };

// /**
//  * Mark booking as paid (to be called by Stripe webhook or similar).
//  * This updates booking.status/paymentStatus and sends post-payment emails.
//  * Safe to call multiple times (idempotent-ish).
//  */
// export const markBookingPaid = async (req, res) => {
//   try {
//     const { bookingId } = req.params; // or from body
//     if (!bookingId) return res.status(400).json({ success: false, message: "Missing bookingId" });

//     const booking = await Booking.findById(bookingId).populate("clientId counselorId");
//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

//     // If already paid, return success
//     if (booking.paymentStatus === "paid") {
//       return res.json({ success: true, message: "Already marked paid", booking });
//     }

//     booking.paymentStatus = "paid";
//     booking.status = "confirmed"; // or 'paid' depending on your states
//     booking.paidAt = new Date();
//     await booking.save();

//     // Post-payment emails (best-effort)
//     try {
//       await sendBookingEmails({
//         clientEmail: booking.clientId.email,
//         clientName: booking.clientId.name,
//         counselorEmail: booking.counselorId.email,
//         counselorName: booking.counselorId.name,
//         booking,
//         prePayment: false,
//         sessionType: booking.sessionType,
//         meetLink: booking.meetLink,
//         chatRoom: booking.chatRoom,
//       });
//     } catch (err) {
//       console.error("Post-payment email failed:", err?.message || err);
//     }

//     return res.json({ success: true, booking });
//   } catch (err) {
//     console.error("markBookingPaid error:", err);
//     return res.status(500).json({ success: false, message: err.message || "Server error" });
//   }
// };

// /**
//  * Get booking by id
//  */
// export const getBookingById = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     if (!bookingId) return res.status(400).json({ success: false, message: "Missing bookingId" });

//     const booking = await Booking.findById(bookingId)
//       .populate("clientId", "name email")
//       .populate("counselorId", "name email pricePerSession");

//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

//     return res.json({ success: true, booking });
//   } catch (err) {
//     console.error("getBookingById error:", err);
//     return res.status(500).json({ success: false, message: err.message || "Server error" });
//   }
// };

// /**
//  * List bookings for a counselor
//  */
// export const getBookingsForCounselor = async (req, res) => {
//   try {
//     const { counselorId } = req.params;
//     if (!counselorId) return res.status(400).json({ success: false, message: "Missing counselorId" });

//     const bookings = await Booking.find({ counselorId }).sort({ date: 1, time: 1 });
//     return res.json({ success: true, bookings });
//   } catch (err) {
//     console.error("getBookingsForCounselor error:", err);
//     return res.status(500).json({ success: false, message: err.message || "Server error" });
//   }
// };

// /**
//  * List bookings for a client
//  */
// export const getBookingsForClient = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     if (!clientId) return res.status(400).json({ success: false, message: "Missing clientId" });

//     const bookings = await Booking.find({ clientId }).sort({ date: 1, time: 1 });
//     return res.json({ success: true, bookings });
//   } catch (err) {
//     console.error("getBookingsForClient error:", err);
//     return res.status(500).json({ success: false, message: err.message || "Server error" });
//   }
// };

// /**
//  * Cancel booking (only allowed if pending/unpaid or within cancel policy)
//  */
// export const cancelBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { requesterId } = req.body; // optional: who's canceling
//     if (!bookingId) return res.status(400).json({ success: false, message: "Missing bookingId" });

//     const booking = await Booking.findById(bookingId).populate("clientId counselorId");
//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

//     // Only allow cancel if pending/unpaid OR implement business rules (time window)
//     if (booking.paymentStatus === "paid" && booking.status === "confirmed") {
//       return res.status(400).json({ success: false, message: "Cannot cancel a paid/confirmed booking via this endpoint" });
//     }

//     booking.status = "cancelled";
//     booking.canceledAt = new Date();
//     await booking.save();

//     // Notify parties (best-effort)
//     try {
//       await sendBookingEmails({
//         clientEmail: booking.clientId.email,
//         clientName: booking.clientId.name,
//         counselorEmail: booking.counselorId.email,
//         counselorName: booking.counselorId.name,
//         booking,
//         cancelled: true,
//       });
//     } catch (err) {
//       console.error("Cancel email failed:", err?.message || err);
//     }

//     return res.json({ success: true, booking });
//   } catch (err) {
//     console.error("cancelBooking error:", err);
//     return res.status(500).json({ success: false, message: err.message || "Server error" });
//   }
// };

// /**
//  * Utility: update booking status (admin)
//  */
// export const updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { status } = req.body;
//     if (!bookingId || !status) return res.status(400).json({ success: false, message: "Missing bookingId or status" });

//     const booking = await Booking.findById(bookingId);
//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

//     booking.status = status;
//     if (status === "completed") booking.completedAt = new Date();
//     await booking.save();

//     return res.json({ success: true, booking });
//   } catch (err) {
//     console.error("updateBookingStatus error:", err);
//     return res.status(500).json({ success: false, message: err.message || "Server error" });
//   }
// };

import Booking from "../models/Booking.js";
import User from "../models/User.js";
import PaymentHistory from "../models/PaymentHistory.js";
import Stripe from "stripe";
import { createVideoRoom } from "../lib/stream.js";
import { sendBookingEmails } from "../utils/email.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// LKR default converter
const convertToLKR = (amount, currency = "LKR") => {
  if (currency === "LKR") return amount;
  if (currency === "USD") return amount * 300;   // Sample rate
  if (currency === "INR") return amount * 4;     // Sample rate
  return amount;
};

// ---------------------------------------
// CREATE BOOKING (pre-payment)
// ---------------------------------------
export const createBooking = async (req, res) => {
  try {
    const { clientId, counselorId, date, time, durationMin, notes, sessionType } = req.body;

    const client = await User.findById(clientId);
    const counselor = await User.findById(counselorId);

    if (!client || !counselor) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1️⃣ Create Stream room
    let meetLink = null;
    let callId = null;

    if (sessionType === "video") {
      const room = await createVideoRoom();
      meetLink = room.meetLink;
      callId = room.callId;
    }

    // 2️⃣ Booking amount (1000 per hour)
    const amount = Math.round((durationMin / 60) * 1000);

    // 3️⃣ Save booking in DB (Pending)
    const booking = await Booking.create({
      client: clientId,
      counselor: counselorId,
      date,
      time,
      durationMin,
      notes,
      sessionType,
      meetLink,
      callId,
      amount,
      paymentStatus: "pending"
    });

    // 4️⃣ Create Stripe Checkout
    const amountLKR = convertToLKR(amount, "LKR");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      currency: "lkr",
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: `HealPeer Session with ${counselor.name}`,
            },
            unit_amount: amountLKR * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?bookingId=${booking._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    // 5️⃣ Send PRE-PAYMENT email
    await sendBookingEmails({
      clientEmail: client.email,
      clientName: client.name,
      counselorEmail: counselor.email,
      counselorName: counselor.name,
      meetLink,
      booking,
      prePayment: true,
      chatRoom: callId,
      sessionType,
      currency: "LKR",
      paidAmount: amountLKR
    });

    res.json({
      message: "Booking created. Stripe session ready.",
      checkoutUrl: session.url,
      booking,
      meetLink,
    });

  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      const booking = await Booking.findById(bookingId)
        .populate("client")
        .populate("counselor");

      if (!booking) return res.json({ received: true });

      // Mark booking as PAID
      booking.paymentStatus = "paid";
      await booking.save();

      // Save Payment History
      await PaymentHistory.create({
        user: booking.counselor._id,
        booking: booking._id,
        amount: booking.amount,
        currency: "LKR",
        status: "paid",
      });

      // Send PAYMENT CONFIRMATION emails
      await sendBookingEmails({
        clientEmail: booking.client.email,
        clientName: booking.client.name,
        counselorEmail: booking.counselor.email,
        counselorName: booking.counselor.name,
        meetLink: booking.meetLink,
        booking,
        prePayment: false,
        chatRoom: booking.callId,
        sessionType: booking.sessionType,
        currency: "LKR",
        paidAmount: booking.amount,
      });
    }

    res.json({ received: true });

  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
