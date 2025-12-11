



// import Booking from "../models/Booking.js";
// import User from "../models/User.js";
// import PaymentHistory from "../models/PaymentHistory.js";
// import Stripe from "stripe";
// import { generateStreamToken } from "../lib/stream.js";
// import { sendBookingEmails } from "../utils/email.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // LKR default converter
// const convertToLKR = (amount, currency = "LKR") => {
//   if (currency === "LKR") return amount;
//   if (currency === "USD") return amount * 300;  
//   if (currency === "INR") return amount * 4;     
//   return amount;
// };

// // ---------------------------------------
// // CREATE BOOKING
// // ---------------------------------------
// export const createBooking = async (req, res) => {
//   try {
//     const { clientId, counselorId, date, time, durationMin, notes, sessionType } = req.body;

//     const client = await User.findById(clientId);
//     const counselor = await User.findById(counselorId);

//     if (!client || !counselor) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 1️⃣ Create Stream room
//     let meetLink = null;
//     let callId = null;

//     if (sessionType === "video") {
//       const room = await generateStreamToken();
//       meetLink = room.meetLink;
//       callId = room.callId;
//     }

//     // 2️⃣ Booking amount (1000 per hour)
//     const amount = Math.round((durationMin / 60) * 1000);

//     // 3️⃣ Save booking in DB (Pending)
//     const booking = await Booking.create({
//       client: clientId,
//       counselor: counselorId,
//       date,
//       time,
//       durationMin,
//       notes,
//       sessionType,
//       meetLink,
//       callId,
//       amount,
//       paymentStatus: "pending",
//     });

//     // 4️⃣ Stripe Checkout
//     const amountLKR = convertToLKR(amount, "LKR");
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       currency: "lkr",
//       line_items: [
//         {
//           price_data: {
//             currency: "lkr",
//             product_data: {
//               name: `HealPeer Session with ${counselor.name}`,
//             },
//             unit_amount: amountLKR * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: `${process.env.FRONTEND_URL}/payment-success?bookingId=${booking._id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
//       metadata: {
//         bookingId: booking._id.toString(),
//       },
//     });

//     // 5️⃣ Send PRE-PAYMENT email
//     await sendBookingEmails({
//       clientEmail: client.email,
//       clientName: client.name,
//       counselorEmail: counselor.email,
//       counselorName: counselor.name,
//       meetLink,
//       booking,
//       prePayment: true,
//       chatRoom: callId,
//       sessionType,
//       currency: "LKR",
//       paidAmount: amountLKR,
//     });

//     res.json({
//       message: "Booking created. Stripe session ready.",
//       checkoutUrl: session.url,
//       booking,
//       meetLink,
//     });
//   } catch (error) {
//     console.error("CREATE BOOKING ERROR:", error);
//     res.status(500).json({ message: "Error creating booking", error: error.message });
//   }
// };

// // ---------------------------------------
// // MARK BOOKING AS PAID (manual or webhook)
// // ---------------------------------------
// export const markBookingPaid = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await Booking.findById(bookingId)
//       .populate("client")
//       .populate("counselor");

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     booking.paymentStatus = "paid";
//     await booking.save();

//     await PaymentHistory.create({
//       user: booking.counselor._id,
//       booking: booking._id,
//       amount: booking.amount,
//       currency: "LKR",
//       status: "paid",
//     });

//     res.json({ success: true, booking });
//   } catch (error) {
//     console.error("MARK PAID ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ---------------------------------------
// // GET BOOKING BY ID
// // ---------------------------------------
// export const getBookingById = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const booking = await Booking.findById(bookingId)
//       .populate("client")
//       .populate("counselor");

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     res.json({ booking });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ---------------------------------------
// // GET BOOKINGS FOR COUNSELOR
// // ---------------------------------------
// export const getBookingsForCounselor = async (req, res) => {
//   try {
//     const { counselorId } = req.params;
//     const bookings = await Booking.find({ counselor: counselorId })
//       .populate("client")
//       .sort({ date: 1 });

//     res.json({ bookings });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ---------------------------------------
// // GET BOOKINGS FOR CLIENT
// // ---------------------------------------
// export const getBookingsForClient = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const bookings = await Booking.find({ client: clientId })
//       .populate("counselor")
//       .sort({ date: 1 });

//     res.json({ bookings });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ---------------------------------------
// // CANCEL BOOKING
// // ---------------------------------------
// export const cancelBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await Booking.findById(bookingId);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     booking.status = "cancelled";
//     await booking.save();

//     res.json({ success: true, booking });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ---------------------------------------
// // UPDATE BOOKING STATUS
// // ---------------------------------------
// export const updateBookingStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { status } = req.body;

//     const booking = await Booking.findById(bookingId);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     booking.status = status;
//     await booking.save();

//     res.json({ success: true, booking });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import Booking from "../models/Booking.js";
import User from "../models/User.js";
import PaymentHistory from "../models/PaymentHistory.js";
import Stripe from "stripe";
import { createVideoRoom } from "../lib/stream.js";
import { sendBookingEmails } from "../utils/email.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --------------------
// CREATE BOOKING + STRIPE SESSION
// --------------------
export const createBooking = async (req, res) => {
  try {
    const { clientId, counselorId, date, time, durationMin, notes, sessionType } = req.body;

    const client = await User.findById(clientId);
    const counselor = await User.findById(counselorId);

    if (!client || !counselor) return res.status(404).json({ message: "User not found" });

    const amount = Math.round((durationMin / 60) * (counselor.pricePerSession || 1000));

    const booking = await Booking.create({
      client: clientId,       // use "client" not "clientId"
  counselor: counselorId,  // use "counselor" not "counselorId"
      date,
      time,
      durationMin,
      notes,
      sessionType,
      amount,
      paymentStatus: "pending",
      status: "pending",
    });

    // Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      currency: "lkr",
      line_items: [{
        price_data: {
          currency: "lkr",
          unit_amount: amount * 100,
          product_data: { name: `Session with ${counselor.name}` },
        },
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL}/payment-success?bookingId=${booking._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: { bookingId: booking._id.toString() },
    });

    // Send pre-payment email
    await sendBookingEmails({
      clientEmail: client.email,
      clientName: client.name,
      counselorEmail: counselor.email,
      counselorName: counselor.name,
      booking,
      prePayment: true,
      sessionType,
    });

    res.json({ message: "Booking created", checkoutUrl: session.url, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// STRIPE WEBHOOK
// --------------------
export const stripeWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      const booking = await Booking.findById(bookingId).populate("clientId counselorId");
      if (!booking) return res.json({ received: true });

      // Mark booking as paid & confirmed
      booking.paymentStatus = "paid";
      booking.status = "confirmed";

      // Create Stream video room after payment
      const { callId, meetLink } = await createVideoRoom();
      booking.roomId = callId;
      booking.meetLink = meetLink;

      await booking.save();

      // Record payment history
      await PaymentHistory.create({
        user: booking.counselorId._id,
        booking: booking._id,
        amount: booking.amount,
        currency: "LKR",
        status: "paid",
      });

      // Send post-payment emails
      await sendBookingEmails({
        clientEmail: booking.clientId.email,
        clientName: booking.clientId.name,
        counselorEmail: booking.counselorId.email,
        counselorName: booking.counselorId.name,
        booking,
        prePayment: false,
        sessionType: booking.sessionType,
        meetLink,
        chatRoom: booking.roomId,
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// --------------------
// GET BOOKINGS FOR CLIENT
// --------------------
export const getBookingsForClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const bookings = await Booking.find({ clientId })
      .populate("counselorId")
      .sort({ date: 1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// GET BOOKINGS FOR COUNSELOR
// --------------------
export const getBookingsForCounselor = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const bookings = await Booking.find({ counselorId })
      .populate("clientId")
      .sort({ date: 1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
