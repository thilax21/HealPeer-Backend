// import express from "express";
// import { StreamChat } from "stream-chat";
// import Booking from "../models/Booking.js";
// import dotenv from "dotenv";
// dotenv.config();

// const router = express.Router();

// const STREAM_API_KEY = process.env.STREAM_API_KEY;
// const STREAM_API_SECRET = process.env.STREAM_API_SECRET;
// const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

// // POST /api/stream/token
// // body: { userId, name, role, bookingId }
// // returns: { chatToken, videoToken, roomId }
// router.post("/token", async (req, res) => {
//   try {
//     const { userId, name, role, bookingId } = req.body;
//     if (!userId || !bookingId) return res.status(400).json({ message: "Missing userId or bookingId" });

//     // ensure booking exists
//     const booking = await Booking.findById(bookingId);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     // set roomId if not set
//     const roomId = booking.roomId || `session_${booking._id}`;
//     if (!booking.roomId) {
//       booking.roomId = roomId;
//       await booking.save();
//     }

//     // upsert user on Stream
//     await serverClient.upsertUser({ id: userId, name, role });

//     // create chat token and video token
//     const chatToken = serverClient.createToken(userId);
//     // For Stream Video, Stream docs allow using same token (signed) for demo.
//     const videoToken = serverClient.createToken(userId);

//     res.json({ chatToken, videoToken, roomId });
//   } catch (err) {
//     console.error("STREAM TOKEN ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;


// routes/tokenRoute.js
// import { generateStreamToken } from "../lib/stream.js";

// router.get("/token/:userId", (req, res) => {
//   try {
//     const token = generateStreamToken(req.params.userId);
//     res.json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

