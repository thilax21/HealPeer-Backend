


// // src/models/Booking.js
// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema({
//   clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   counselorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

//   date: { type: String, required: true }, // keep as string for simplicity
//   time: { type: String, required: true },

//   durationMin: { type: Number, default: 60 },
//   priceLKR: { type: Number, required: true },

//   // meetLink saved after payment (object with client/counselor urls)
//   meetLink: {
//     client: { type: String, default: null },
//     counselor: { type: String, default: null },
//   },

//   roomId: { type: String, default: null },

//   // payment & booking status
//   paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
//   status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },

// }, { timestamps: true });

// export default mongoose.model("Booking", bookingSchema);

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  date: { type: String, required: true },
  time: { type: String, required: true },

  durationMin: { type: Number, default: 60 },
  amount: { type: Number, required: true }, // total session amount in LKR

  meetLink: {
    client: { type: String, default: null },
    counselor: { type: String, default: null },
  },
  roomId: { type: String, default: null },

  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
  notes: { type: String, default: "" }

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
