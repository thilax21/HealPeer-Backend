// import express from "express";
// import {
//   createBooking,
//   // getAllBookings,
//   getBookingById,
//   getClientBookings,
//   getBookingBySession,
//   getActiveBookingsForChat,
//   getCounselorBookings
// } from "../controllers/bookingController.js";

// const router = express.Router();

// router.post("/create", createBooking);

// // router.get("/", getAllBookings);

// // Specific routes FIRST
// router.get("/client/:clientId", getClientBookings);

// router.get("/counselor/:counselorId", getCounselorBookings);

// router.get("/session/:sessionId", getBookingBySession);

// router.get("/active/:userId", getActiveBookingsForChat);

// // Generic route LAST
// router.get("/:id", getBookingById);

// export default router;

// import express from "express";
// import Booking from "../models/Booking.js";
// import User from "../models/User.js";

// const router = express.Router();

// // Create booking (client side would call this after booking flow)
// router.post("/", async (req, res) => {
//   try {
//     const { clientId, counselorId, date, time, sessionType } = req.body;
//     const booking = await Booking.create({
//       client: clientId,
//       counselor: counselorId,
//       date, time, sessionType
//     });
//     res.json(booking);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // Get all bookings for a user (client or counselor)
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const bookings = await Booking.find({
//       $or: [{ client: userId }, { counselor: userId }]
//     }).populate("client counselor", "name email");
//     res.json(bookings);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;

import express from "express";
import * as ctrl from "../controllers/bookingController.js";
const router = express.Router();

router.post("/create", ctrl.createBooking);
router.post("/mark-paid/:bookingId", ctrl.markBookingPaid); // or webhook calls paymentController then calls this
router.get("/:bookingId", ctrl.getBookingById);
router.get("/counselor/:counselorId", ctrl.getBookingsForCounselor);
router.get("/client/:clientId", ctrl.getBookingsForClient);
router.post("/cancel/:bookingId", ctrl.cancelBooking);
router.patch("/status/:bookingId", ctrl.updateBookingStatus);

export default router;
