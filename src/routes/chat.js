import express from "express";
import ChatMessage from "../models/ChatMessage.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// GET /api/chat/history/:counselorId/:clientId - Get chat history between counselor and client
router.get("/history/:counselorId/:clientId", async (req, res) => {
  try {
    const { counselorId, clientId } = req.params;
    const room = `${counselorId}_${clientId}`;
    
    const messages = await ChatMessage.find({ room })
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages
    
    res.json({ success: true, messages });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/chat/bookings/:userId - Get all bookings for a user to show available chats
router.get("/bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find bookings where user is either client or counselor and payment is completed
    const bookings = await Booking.find({
      $and: [
        {
          $or: [
            { clientId: userId },
            { counselorId: userId }
          ]
        },
        { status: "paid" }
      ]
    })
    .populate("clientId", "name email")
    .populate("counselorId", "name email")
    .sort({ date: -1, time: -1 });
    
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/room - Create or get chat room for a booking
router.post("/room", async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate("clientId", "name email")
      .populate("counselorId", "name email");
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    if (booking.status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed for this booking" });
    }
    
    const room = `${booking.counselorId._id}_${booking.clientId._id}`;
    
    res.json({
      success: true,
      room,
      booking: {
        id: booking._id,
        date: booking.date,
        time: booking.time,
        client: booking.clientId,
        counselor: booking.counselorId
      }
    });
  } catch (err) {
    console.error("Error creating chat room:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

// import express from "express";
// import ChatSession from "../models/ChatSession.js";
// import { GoogleGenAI } from "@google/genai";

// const router = express.Router();
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// router.post("/", async (req, res) => {
//   const { messages, sessionStart, userId } = req.body;

//   if (!userId) return res.status(400).json({ error: "User ID required" });

//   const today = new Date().toDateString();

//   let session = await ChatSession.findOne({ userId });

//   // If no session exists create one
//   if (!session) {
//     session = await ChatSession.create({
//       userId,
//       lastUsed: new Date(),
//       minutesUsed: 0
//     });
//   }

//   // Check if new day → reset usage
//   if (session.lastUsed.toDateString() !== today) {
//     session.minutesUsed = 0;
//   }

//   // If user already used 5 min today → block
//   if (session.minutesUsed >= 5) {
//     return res.status(403).json({
//       reply: "DAILY_LIMIT_REACHED"
//     });
//   }

//   // Save new usage time
//   const timeUsed = Math.floor((Date.now() - sessionStart) / 60000);
//   session.minutesUsed = Math.min(5, timeUsed);
//   session.lastUsed = new Date();
//   await session.save();

//   // Now call Gemini AI
//   try {
//     const contents = messages.map(m => ({ parts: [{ text: m.text }] }));
//     const result = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents
//     });

//     res.json({ reply: result.text });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "AI error" });
//   }
// });

// export default router;
