

// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: { type: String, required: true },   // "YYYY-MM-DD"
  time: { type: String, required: true },   // "HH:MM"
  durationMin: { type: Number, default: 60 },

  amount: { type: Number, required: true },
  sessionType:["video","chat"],
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled", "completed"],
    default: "pending",
  },
  paymentStatus: { type: String, default: "pending" }, // "pending" | "completed" ...

  paidAmount: Number,
  paidAt: Date,

  // NEW: exact timestamps for overlap checking
  startDateTime: { type: Date }, // session start
  endDateTime: { type: Date },   // session end

  // ... existing fields (meetLink, chatRoom, googleEventId, etc.)
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;