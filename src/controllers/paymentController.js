import Booking from "../models/Booking.js";
import { stripe } from "../config/stripe.js";
import { sendBookingEmails } from "../utils/email.js";
import { createCalendarEvent } from "../utils/googleCalendar.js";

/** Create Stripe checkout session */
export const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("clientId counselorId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: booking.amount,
          product_data: {
            name: `Counseling session on ${booking.date} ${booking.time}`
          }
        },
        quantity: 1
      }],
      metadata: { bookingId: booking._id.toString() },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/** Stripe webhook handler */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) return res.json({ received: true });

    try {
      const booking = await Booking.findById(bookingId).populate("clientId counselorId");
      if (!booking) return res.json({ received: true });

      booking.status = "paid";  // update after successful payment
      await booking.save();

      // Send post-payment email with session information
      const room = booking.chatRoom || `${booking.counselorId._id}_${booking.clientId._id}`;
      
      await sendBookingEmails({
        clientEmail: booking.clientId.email,
        clientName: booking.clientId.name,
        counselorEmail: booking.counselorId.email,
        counselorName: booking.counselorId.name,
        meetLink: booking.meetLink,
        booking,
        prePayment: false,
        chatRoom: room,
        sessionType: booking.sessionType
      });

      console.log("Booking paid and emails sent for booking", bookingId);

    } catch (err) {
      console.error("Error processing booking after payment:", err);
    }
  }

  res.json({ received: true });
};
