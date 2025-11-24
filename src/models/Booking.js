
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


import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  counselorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // e.g., "2025-12-30"
  time: { type: String, required: true }, // e.g., "11:00"
  durationMin: { type: Number, default: 60 },
  notes: { type: String },
  status: { type: String, default: "pending" }, // pending / paid / completed
  amount: { type: Number, required: true },
  stripeSessionId: { type: String },
  googleEventId: { type: String },       // Google Calendar event ID
  meetLink: { type: String },            // Google Meet link
  calendarCreated: { type: Boolean, default: false }, // flag if calendar event created
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
