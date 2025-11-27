import express from "express";
import { createBooking, getAllBookings, getBookingById, getClientBookings, getBookingBySession, getActiveBookingsForChat } from "../controllers/bookingController.js";
const router = express.Router();

router.post("/", createBooking);
 
router.get('/', getAllBookings);

router.get('/:id',  getBookingById);

router.get('/client/:clientId', getClientBookings)


router.get("/session/:sessionId", getBookingBySession);

router.get("/active/:userId", getActiveBookingsForChat);

export default router;
