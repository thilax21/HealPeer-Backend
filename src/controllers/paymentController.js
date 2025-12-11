

import Booking from "../models/Booking.js";
import { stripe } from "../config/stripe.js";
import { sendBookingEmails } from "../utils/email.js";

// Create Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: booking.amount * 100,
            product_data: {
              name: `Counseling Session (${booking.sessionType})`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?bookingId=${bookingId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
      metadata: { bookingId },
    });

    res.json({ success: true, url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Stripe error" });
  }
};



// Stripe Webhook (Payment Completed)
export const stripeWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      const booking = await Booking.findById(bookingId).populate("clientId counselorId");

      if (!booking) return res.json({ received: true });

      // Update booking → PAID
      booking.status = "paid";
      booking.paymentStatus = "paid";
      await booking.save();

      // Send emails
      await sendBookingEmails({
        clientEmail: booking.clientId.email,
        clientName: booking.clientId.name,
        counselorEmail: booking.counselorId.email,
        counselorName: booking.counselorId.name,
        booking,
        prePayment: false,
        sessionType: booking.sessionType,
        meetLink: booking.meetLink,
        chatRoom: booking.chatRoom,
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
