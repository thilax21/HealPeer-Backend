import express from "express";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { stripe, webhookSecret } from "../config/stripe.js";
import { createGoogleMeetLink } from "../utils/googleMeet.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateInvoicePDF } from "../utils/invoice.js";

const router = express.Router();

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const bookingData = JSON.parse(session.metadata.bookingData);

      // 1. CREATE BOOKING IN MONGODB
      const booking = await Booking.create({
        ...bookingData,
        paymentStatus: "paid",
        paymentIntentId: session.payment_intent,
        dateTime: new Date(`${bookingData.date}T${bookingData.time}:00`)
      });

      // 2. CREATE GOOGLE MEET LINK
      const meetLink = await createGoogleMeetLink(
        booking.date,
        booking.time,
        booking.duration
      );
      booking.meetingLink = meetLink;
      await booking.save();

      // 3. FETCH USERS
      const client = await User.findById(booking.client);
      const counselor = await User.findById(booking.counselor);

      // 4. SEND EMAIL CONFIRMATIONS
      await sendEmail(client.email, "Your Booking is Confirmed", `
        Your session is booked. Meet Link: ${meetLink}`);
      await sendEmail(counselor.email, "New Booking Received",
        `You have a new session. Meet Link: ${meetLink}`);

      // 5. GENERATE & SEND INVOICE
      const invoicePath = await generateInvoicePDF({
        user: client,
        amount: booking.amount,
        booking,
      });

      await sendEmail(client.email, "Your Payment Invoice", "Attached is your invoice", invoicePath);
    }

    res.status(200).json({ received: true });
  }
);

export default router;
