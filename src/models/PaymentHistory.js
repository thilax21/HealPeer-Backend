import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema({
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  month: {
    type: String, // e.g. "November 2025"
    required: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // admin who paid
    required: true,
  },
  status: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Paid",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PaymentHistory = mongoose.model("PaymentHistory", paymentHistorySchema);
export default PaymentHistory;
