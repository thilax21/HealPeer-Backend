import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["booked", "completed", "cancelled"], default: "booked" },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  counselorPaid: { type: Boolean, default: false }, // ✅ new field for admin payout
  amount: { type: Number, default: 1000 }
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
