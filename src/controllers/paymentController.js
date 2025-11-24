// import Stripe from "stripe";
// import dotenv from "dotenv";
// dotenv.config();
// import Booking from "../models/Booking.js";
// import User from "../models/User.js";
// import { createCalendarEvent } from "../utils/googleCalendar.js";
// import { sendBookingEmails } from "../utils/email.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

// /** create checkout session  (need to Send Email for Clinent and Counsilers)*/
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { bookingId } = req.body;
//     const booking = await Booking.findById(bookingId).populate("clientId counselorId");
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: [{
//         price_data: {
//           currency: "usd",
//           unit_amount: booking.amount, // in cents. adjust currency & amount as needed
//           product_data: {
//             name: `Counseling session on ${booking.date} ${booking.time}`
//           }
//         },
//         quantity: 1
//       }],
//       metadata: { bookingId: booking._id.toString() },
//       success_url: `${process.env.FRONTEND_URL || "http://localhost:5174"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3001"}/payment-cancel`
//     });

//     booking.stripeSessionId = session.id;
//     await booking.save();

//     res.json({ url: session.url, sessionId: session.id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };

// /** Stripe webhook handler */
// export const stripeWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     // req.body is already a Buffer thanks to express.raw()
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const bookingId = session.metadata?.bookingId;

//     if (!bookingId) return res.json({ received: true });

//     try {
//       const booking = await Booking.findById(bookingId).populate("clientId counselorId");
//       if (!booking) return res.json({ received: true });

//       // Update status immediately
//       booking.status = "booked"; // or "paid"
//       booking.stripeSessionId = session.id;
//       await booking.save();

//       // Calendar & email logic here...
//     } catch (err) {
//       console.error("Error processing booking:", err);
//     }
//   }

//   res.json({ received: true });
// };



// ---------------------------------------------------------------------------------------------------------------------------------------------------------
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

      // Send post-payment email
      await sendBookingEmails({
        clientEmail: booking.clientId.email,
        clientName: booking.clientId.name,
        counselorEmail: booking.counselorId.email,
        counselorName: booking.counselorId.name,
        meetLink: booking.meetLink,
        booking,
        prePayment: false
      });

      console.log("Booking paid and emails sent for booking", bookingId);

    } catch (err) {
      console.error("Error processing booking after payment:", err);
    }
  }

  res.json({ received: true });
};