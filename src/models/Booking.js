
// import mongoose from "mongoose";

// const BookingSchema = new mongoose.Schema({
//   counselorId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
//   clientId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
//   date: { type: String, required: true }, // ISO date string or '2025-11-24'
//   time: { type: String, required: true }, // '15:00'
//   durationMin: { type: Number, default: 60 },
//   status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
//   amount: { type: Number, required: true }, // cents or rupees? we'll use cents for stripe
//   stripeSessionId: { type: String },
//   googleEventId: { type: String },
//   meetLink: { type: String },
//   notes: { type: String }
// }, { timestamps: true });

// export default mongoose.model("Booking", BookingSchema);


// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema({
//   clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   counselorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   date: { type: String, required: true }, // e.g., "2025-12-30"
//   time: { type: String, required: true }, // e.g., "11:00"
//   durationMin: { type: Number, default: 60 },
//   notes: { type: String },
//   sessionType: { type: String, required: true, enum: ["chat", "video"], default: "video" }, // chat or video session
//   roomId: { type: String }, // Stream room/channel ID
//   status: { type: String, default: "pending" }, // pending / paid / completed / cancelled
//   paymentStatus: { type: String, default: "pending", enum: ["pending", "completed", "failed", "refunded"] },
//   amount: { type: Number, required: true },
//   paidAmount: { type: Number }, // Actual amount paid (in LKR)
//   currency: { type: String, default: "LKR" }, // Currency used for payment
//   paidAt: { type: Date }, // When payment was completed
//   stripeSessionId: { type: String },
//   stripePaymentIntentId: { type: String }, // Stripe payment intent ID
//   googleEventId: { type: String },       // Google Calendar event ID
//   meetLink:  { type: String }  ,        // Stream Video URL  
//   calendarCreated: { type: Boolean, default: false }, // flag if calendar event created
//   chatRoom: { type: String },           // Chat room identifier for chat sessions
//   confirmedAt: { type: Date }, // When booking was confirmed after payment
// }, { timestamps: true });

// export default mongoose.model("Booking", bookingSchema);


// src/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  counselorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  date: { type: String, required: true }, // keep as string for simplicity
  time: { type: String, required: true },

  durationMin: { type: Number, default: 60 },
  priceLKR: { type: Number, required: true },

  // meetLink saved after payment (object with client/counselor urls)
  meetLink: {
    client: { type: String, default: null },
    counselor: { type: String, default: null },
  },

  roomId: { type: String, default: null },

  // payment & booking status
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
