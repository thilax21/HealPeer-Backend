


import Booking from "../models/Booking.js";
import { stripe } from "../config/stripe.js";
import { sendBookingEmails } from "../utils/email.js";





// STRIPE create checkout


export const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("clientId counselorId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // ✅ Stripe minimum payment fix here
    if (booking.amount < 200) {
      return res.status(400).json({
        message: "Minimum payment amount is Rs. 200 for Stripe checkout."
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "lkr",
          unit_amount: Math.round(booking.amount * 100),
          product_data: {
            name: `Counseling session on ${booking.date} ${booking.time}`,
            description: `${booking.sessionType} session with ${booking.counselorId.name}`
          }
        },
        quantity: 1
      }],
      metadata: { 
        bookingId: booking._id.toString(),
        clientId: booking.clientId._id.toString(),
        counselorId: booking.counselorId._id.toString()
      },
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

export const stripeWebhook = async (req, res) => {
  const event = req.body; // POSTMAN MODE

  // Log event as JSON
  console.log(JSON.stringify({ message: "EVENT_RECEIVED", event }, null, 2));

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    console.log(JSON.stringify({ message: "BOOKING_ID_RECEIVED", bookingId }, null, 2));

    if (!bookingId) return res.json({ received: true });

    try {
      const booking = await Booking.findById(bookingId).populate("clientId counselorId");
      if (!booking) return res.json({ received: true });

      // Update booking
      booking.status = "paid";
      booking.paymentStatus = "completed";
      booking.paidAt = new Date();
      booking.currency = "LKR";
      booking.paidAmount = session.amount_total / 100;

      await booking.save();

      console.log(JSON.stringify({ message: "BOOKING_UPDATED", booking: booking._id }, null, 2));

      await sendBookingEmails({
        clientEmail: booking.clientId.email,
        clientName: booking.clientId.name,
        counselorEmail: booking.counselorId.email,
        counselorName: booking.counselorId.name,
        meetLink: booking.meetLink,
        booking,
        prePayment: false,
        chatRoom: booking.chatRoom,
        sessionType: booking.sessionType,
        currency: "LKR",
        paidAmount: booking.paidAmount
      });

      console.log(JSON.stringify({ message: "EMAILS_SENT", bookingId: booking._id }, null, 2));

      // Respond with success + details
      return res.json({
        received: true,
        status: "paid",
        bookingId: booking._id,
        paidAmount: booking.paidAmount,
        currency: booking.currency
      });

    } catch (err) {
      console.error(JSON.stringify({ message: "ERROR_PROCESSING_BOOKING", error: err.message }, null, 2));
      return res.status(500).json({ error: err.message });
    }
  }

  // Default response for other events
  return res.json({ received: true });
};



// GET PAYMENT DETAILS
// export const getPaymentDetails = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
    
//     const booking = await Booking.findById(session.metadata?.bookingId)
//       .populate("clientId counselorId");
    
//     if (!booking) {
//       return res.status(404).json({ success: false, message: "Booking not found" });
//     }

//     res.json({
//       success: true,
//       session,
//       booking,
//       paymentStatus: session.payment_status,
//       currency: "LKR"
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



// paymentController.js



export const getPaymentDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const booking = await Booking.findById(session.metadata?.bookingId)
      .populate("clientId counselorId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // OPTIONAL FALLBACK: mark as paid here if Stripe says paid
    if (session.payment_status === "paid" && booking.status !== "paid") {
      booking.status = "paid";
      booking.paymentStatus = "completed";
      booking.paidAt = new Date();
      booking.currency = "LKR";
      booking.paidAmount = session.amount_total / 100;
      await booking.save();
    }

    res.json({
      success: true,
      session,
      booking,
      paymentStatus: session.payment_status,
      currency: "LKR"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};